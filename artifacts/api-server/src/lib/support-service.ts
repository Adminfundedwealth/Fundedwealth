import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { db, supportTickets, supportMessages, supportAttachments } from '@workspace/db';
import { eq, asc } from 'drizzle-orm';
import { logger } from './logger';
import { randomUUID } from 'crypto';

const EMAIL_WEBHOOK = process.env.SUPPORT_EMAIL_WEBHOOK;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPPORT_STORAGE_BUCKET = process.env.SUPPORT_STORAGE_BUCKET || 'support-attachments';
const ATTACHMENT_UPLOAD_TTL_SECONDS = 900;
const ATTACHMENT_DOWNLOAD_TTL_SECONDS = 300;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  logger.warn('Supabase storage configuration is missing; signed upload support will fail until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured.');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '', {
  auth: { persistSession: false },
});

class SupportService {
  async createAttachmentPresign(params: { filename: string; contentType: string; size: number }) {
    if (!params.filename || typeof params.filename !== 'string') {
      throw new Error('filename is required');
    }
    if (!ALLOWED_ATTACHMENT_TYPES.includes(params.contentType)) {
      throw new Error('file type not allowed');
    }
    if (typeof params.size !== 'number' || params.size <= 0 || params.size > MAX_ATTACHMENT_SIZE) {
      throw new Error('file size exceeds limit');
    }

    const sanitizedFileName = params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `support/${randomUUID()}/${sanitizedFileName}`;
    const expiresAt = new Date(Date.now() + ATTACHMENT_UPLOAD_TTL_SECONDS * 1000);
    const { data, error } = await supabase.storage.from(SUPPORT_STORAGE_BUCKET).createSignedUploadUrl(storageKey);
    if (error || !data?.signedUrl) {
      logger.error({ error }, 'Failed to generate presigned upload URL');
      throw new Error('Could not generate upload URL');
    }

    return {
      uploadUrl: data.signedUrl,
      storageKey,
      contentType: params.contentType,
      filename: sanitizedFileName,
      size: params.size,
      expiresAt,
    };
  }

  async createTicket(params: { userId?: string; subject: string; body: string; categoryId?: number; priorityId?: number; attachments?: Array<{ filename: string; contentType: string; storageKey: string; size: number; expiresAt?: string | Date }> }) {
    const externalId = `T-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    const [ticket] = await db.insert(supportTickets).values({
      externalId,
      userId: params.userId ?? null,
      subject: params.subject,
      body: params.body,
      categoryId: params.categoryId ?? null,
      priorityId: params.priorityId ?? null,
    }).returning();

    await db.insert(supportMessages).values({
      ticketId: ticket.id,
      authorId: null,
      authorName: null,
      body: params.body,
      isInternal: false,
    });

    if (params.attachments && params.attachments.length) {
      for (const a of params.attachments) {
        if (!a.filename || !a.storageKey || !a.contentType) continue;
        const attachmentExpiresAt = a.expiresAt ? new Date(a.expiresAt) : new Date(Date.now() + ATTACHMENT_UPLOAD_TTL_SECONDS * 1000);
        await db.insert(supportAttachments).values({
          ticketId: ticket.id,
          filename: a.filename,
          contentType: a.contentType,
          url: a.storageKey,
          storageKey: a.storageKey,
          size: a.size ?? null,
          expiresAt: attachmentExpiresAt,
          scanStatus: 'pending',
        });
      }
    }

    try {
      if (EMAIL_WEBHOOK) {
        await fetch(EMAIL_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: `[Support] ${ticket.subject}`, body: ticket.body, ticketId: ticket.id, externalId }),
        });
      }
    } catch (err) {
      logger.error({ err }, 'Failed to send support email webhook');
    }

    return ticket;
  }

  async addMessage(ticketId: number, authorId: number | null, authorName: string | null, body: string, isInternal = false) {
    const [msg] = await db.insert(supportMessages).values({ ticketId, authorId: authorId ?? null, authorName, body, isInternal }).returning();
    if (!isInternal && EMAIL_WEBHOOK) {
      try {
        await fetch(EMAIL_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: `Update on ticket #${ticketId}`, body, ticketId }),
        });
      } catch (err) {
        logger.error({ err }, 'notify user failed');
      }
    }
    return msg;
  }

  async listTickets(filters: any = {}) {
    return db.query.supportTickets.findMany({});
  }

  async getSignedDownloadUrl(storageKey: string | null, scanStatus?: string | null) {
    // CRITICAL: Enforce that attachments must be scanned before download
    if (scanStatus === 'infected') {
      logger.warn({ storageKey }, 'Denied download: attachment marked infected');
      return null;
    }
    if (scanStatus === 'pending') {
      logger.warn({ storageKey }, 'Denied download: attachment scan pending');
      return null;
    }
    if (!storageKey) return null;
    const { data, error } = await supabase.storage.from(SUPPORT_STORAGE_BUCKET).createSignedUrl(storageKey, ATTACHMENT_DOWNLOAD_TTL_SECONDS);
    if (error) {
      logger.error({ error, storageKey }, 'Failed to generate signed download URL');
      return null;
    }
    return data?.signedUrl ?? null;
  }

  async getTicket(ticketId: number) {
    const ticket = await db.query.supportTickets.findFirst({ where: eq(supportTickets.id, ticketId) });
    if (!ticket) return null;
    const messages = await db.query.supportMessages.findMany({ where: eq(supportMessages.ticketId, ticket.id), orderBy: [asc(supportMessages.createdAt)] });
    const attachments = await db.query.supportAttachments.findMany({ where: eq(supportAttachments.ticketId, ticket.id) });
    const attachmentsWithUrls = await Promise.all(
      attachments.map(async (attachment) => ({
        ...attachment,
        downloadUrl: await this.getSignedDownloadUrl(attachment.storageKey ?? attachment.url, attachment.scanStatus),
      })),
    );
    return { ticket, messages, attachments: attachmentsWithUrls };
  }

  async updateAttachmentScanStatus(attachmentId: number, scanStatus: 'pending' | 'scanned' | 'infected') {
    const validStatuses = ['pending', 'scanned', 'infected'];
    if (!validStatuses.includes(scanStatus)) throw new Error('Invalid scan status');
    await db.update(supportAttachments).set({ scanStatus }).where(eq(supportAttachments.id, attachmentId));
  }
}

export default new SupportService();
