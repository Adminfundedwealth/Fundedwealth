export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuthInHandler } from '@/lib/security/require-auth';

// ── GET /api/blog/[id] — get single post (full content) ──────────────────────
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error: authError } = await requireAuthInHandler();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── PATCH /api/blog/[id] — update post ───────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { error: authError } = await requireAuthInHandler();
  if (authError) return authError;

  try {
    const body = await request.json();
    const supabase = createAdminClient();

    // Build update payload — only include fields that were sent
    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    const allowed = [
      'title', 'slug', 'excerpt', 'content', 'category', 'author',
      'read_time', 'is_featured', 'is_published',
      'meta_title', 'meta_description', 'keywords',
    ];
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    // Auto-set published_at when publishing for the first time
    if (body.is_published === true) {
      // Fetch current record to check if already published
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('published_at')
        .eq('id', params.id)
        .single();
      if (!existing?.published_at) {
        update.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(update)
      .eq('id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE /api/blog/[id] — delete post ──────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error: authError } = await requireAuthInHandler();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', params.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
