export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuthInHandler } from '@/lib/security/require-auth';

// ── POST /api/blog/upload-image — upload cover image to Supabase Storage ──────
// Accepts multipart/form-data with field "file"
export async function POST(request: NextRequest) {
  const { error: authError } = await requireAuthInHandler();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `blog-covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage bucket "blog-images"
    const { data, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, return a clear error
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')) {
        return NextResponse.json(
          {
            error: 'Storage bucket "blog-images" not found. Please create it in Supabase Storage with public access.',
            setup_required: true,
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl, path: data.path });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
