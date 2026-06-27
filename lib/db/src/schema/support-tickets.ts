import { pgTable, serial, text, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

export const supportCategories = pgTable('support_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const supportPriorities = pgTable('support_priorities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  level: integer('level').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').unique(),
  userId: uuid('user_id'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  categoryId: integer('category_id'),
  priorityId: integer('priority_id'),
  status: text('status').notNull().default('OPEN'),
  assignedTo: text('assigned_to'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const supportAttachments = pgTable('support_attachments', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').notNull(),
  filename: text('filename').notNull(),
  contentType: text('content_type'),
  url: text('url'),
  storageKey: text('storage_key'),
  size: integer('size'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  scanStatus: text('scan_status').default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const supportMessages = pgTable('support_messages', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').notNull(),
  authorId: integer('author_id'),
  authorName: text('author_name'),
  body: text('body').notNull(),
  isInternal: boolean('is_internal').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true });

export type SupportTicket = typeof supportTickets.$inferSelect;
