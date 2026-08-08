export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuthInHandler } from '@/lib/security/require-auth';

// ── GET /api/blog — list all posts (admin sees unpublished too) ───────────────
export async function GET(request: NextRequest) {
  const { error: authError } = await requireAuthInHandler();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();
    const params = request.nextUrl.searchParams;
    const status = params.get('status'); // 'published' | 'draft' | ''
    const category = params.get('category');
    const search = params.get('search');
    const page = parseInt(params.get('page') || '1', 10);
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('blog_posts')
      .select('id,title,slug,excerpt,category,author,read_time,is_featured,is_published,views,published_at,created_at,updated_at', { count: 'exact' });

    if (status === 'published') query = query.eq('is_published', true);
    if (status === 'draft') query = query.eq('is_published', false);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    query = query.order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      data: data || [],
      meta: { page, pageSize, totalCount: count ?? 0, totalPages: Math.ceil((count ?? 0) / pageSize) },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST /api/blog — create a new post ───────────────────────────────────────
export async function POST(request: NextRequest) {
  const { error: authError } = await requireAuthInHandler();
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      title, slug, excerpt, content, category, author,
      read_time, is_featured, is_published,
      meta_title, meta_description, keywords,
    } = body;

    if (!title || !slug || !excerpt || !content || !category) {
      return NextResponse.json({ error: 'title, slug, excerpt, content, category are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug,
        excerpt,
        content,
        category,
        author: author || 'FundedWealth Team',
        read_time: read_time || '5 min read',
        is_featured: is_featured ?? false,
        is_published: is_published ?? false,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        keywords: keywords || null,
        published_at: is_published ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
