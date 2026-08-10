'use client';

import { apiFetch } from '@/lib/api/fetch';
import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/shared/data-table';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  BookOpen, Plus, Sparkles, Eye, EyeOff, Pencil, Trash2,
  Search, RefreshCw, Star, StarOff, Upload, X, ImageIcon,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  read_time: string;
  is_featured: boolean;
  is_published: boolean;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  read_time: string;
  is_featured: boolean;
  is_published: boolean;
  meta_title: string;
  meta_description: string;
  keywords: string;
  cover_image: string;
}

const EMPTY_FORM: PostForm = {
  title: '', slug: '', excerpt: '', content: '', category: 'Prop Trading Tips',
  author: 'FundedWealth Team', read_time: '5 min read',
  is_featured: false, is_published: false,
  meta_title: '', meta_description: '', keywords: '',
  cover_image: '',
};

const CATEGORIES = [
  'Prop Trading Tips', 'Risk Management', 'Trading Psychology',
  'Market Analysis', 'Technical Analysis', 'Education',
];

// ─── Slug helper ──────────────────────────────────────────────────────────────
function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState('Prop Trading Tips');
  const [aiCount, setAiCount] = useState(1);
  const [aiPublish, setAiPublish] = useState(true);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');

  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

  // ── Image upload state ────────────────────────────────────────────────────
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await apiFetch(`/api/blog?${params}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const json = await res.json();
      setPosts(json.data || []);
      setTotalCount(json.meta?.totalCount ?? 0);
    } catch {
      setError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => { fetchPosts(); }, [statusFilter, categoryFilter]);

  // ── Open editor (new or edit) ─────────────────────────────────────────────
  async function openEditor(post?: BlogPost) {
    setSaveError('');
    if (post) {
      // Fetch full content for editing
      try {
        const res = await apiFetch(`/api/blog/${post.id}`);
        const json = await res.json();
        const p = json.data;
        setForm({
          title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content,
          category: p.category, author: p.author, read_time: p.read_time,
          is_featured: p.is_featured, is_published: p.is_published,
          meta_title: p.meta_title || '', meta_description: p.meta_description || '',
          keywords: p.keywords || '',
          cover_image: p.cover_image || '',
        });
        setEditingId(post.id);
      } catch {
        setForm(EMPTY_FORM);
        setEditingId(null);
      }
    } else {
      setForm(EMPTY_FORM);
      setEditingId(null);
    }
    setEditorOpen(true);
  }

  // ── Upload cover image ────────────────────────────────────────────────────
  async function handleImageUpload(file: File) {
    setImageUploading(true);
    setImageError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiFetch('/api/blog/upload-image', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) {
        if (json.setup_required) {
          setImageError('Storage not set up yet. Create a "blog-images" bucket in Supabase Storage with public access, then try again.');
        } else {
          setImageError(json.error || 'Upload failed');
        }
        return;
      }
      setForm(f => ({ ...f, cover_image: json.url }));
    } catch (err: any) {
      setImageError(err.message);
    } finally {
      setImageUploading(false);
    }
  }

  // ── Save (create or update) ────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      const res = editingId
        ? await apiFetch(`/api/blog/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) })
        : await apiFetch('/api/blog', { method: 'POST', body: JSON.stringify(form) });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Save failed');
      }
      setEditorOpen(false);
      fetchPosts();
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Quick publish / unpublish toggle ─────────────────────────────────────
  async function togglePublish(post: BlogPost) {
    try {
      await apiFetch(`/api/blog/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_published: !post.is_published }),
      });
      fetchPosts();
    } catch { /* silent */ }
  }

  // ── Quick featured toggle ──────────────────────────────────────────────────
  async function toggleFeatured(post: BlogPost) {
    try {
      await apiFetch(`/api/blog/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_featured: !post.is_featured }),
      });
      fetchPosts();
    } catch { /* silent */ }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/blog/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchPosts();
    } catch { /* silent */ } finally {
      setDeleting(false);
    }
  }

  // ── AI Generate ────────────────────────────────────────────────────────────
  async function handleAiGenerate() {
    setAiRunning(true);
    setAiResult('');
    try {
      const res = await apiFetch('/api/blog/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: aiTopic || undefined,
          category: aiCategory,
          count: aiCount,
          save: true,
          publish: aiPublish,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Generation failed');
      const lines = (json.articles || []).map((a: any) => `✓ "${a.title}" (${a.slug})`);
      if (json.errors?.length) json.errors.forEach((e: string) => lines.push(`✗ ${e}`));
      setAiResult(`Generated ${json.generated} article(s):\n\n${lines.join('\n')}`);
      fetchPosts();
    } catch (err: any) {
      setAiResult(`Error: ${err.message}`);
    } finally {
      setAiRunning(false);
    }
  }

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: ColumnDef<BlogPost, any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="font-medium text-[13px] leading-tight truncate">{row.original.title}</p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">/blog/{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => (
        <span className="text-[11px] bg-muted/60 px-2 py-0.5 rounded-full">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ getValue }) => <span className="text-[12px]">{getValue() as string}</span>,
    },
    {
      accessorKey: 'is_published',
      header: 'Status',
      cell: ({ getValue }) => {
        const pub = getValue() as boolean;
        return (
          <span className={`px-2 py-0.5 text-[11px] rounded-full font-medium ${pub ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
            {pub ? 'Published' : 'Draft'}
          </span>
        );
      },
    },
    {
      accessorKey: 'is_featured',
      header: 'Featured',
      cell: ({ getValue }) => getValue() ? <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> : <span className="text-muted-foreground/30">—</span>,
    },
    {
      accessorKey: 'views',
      header: 'Views',
      cell: ({ getValue }) => <span className="tabular-nums text-[12px]">{(getValue() as number).toLocaleString()}</span>,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ getValue }) => <span className="text-[11px] text-muted-foreground">{new Date(getValue() as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>,
    },
  ];

  const hoverActions = (post: BlogPost) => [
    {
      label: post.is_published ? 'Unpublish' : 'Publish',
      icon: post.is_published ? EyeOff : Eye,
      action: () => togglePublish(post),
    },
    {
      label: 'Edit',
      icon: Pencil,
      action: () => openEditor(post),
    },
    {
      label: post.is_featured ? 'Unfeature' : 'Feature',
      icon: post.is_featured ? StarOff : Star,
      action: () => toggleFeatured(post),
    },
    {
      label: 'Delete',
      icon: Trash2,
      action: () => setDeleteTarget(post),
      variant: 'destructive' as const,
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  if (error) return <ErrorState message={error} onRetry={fetchPosts} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-7 w-7" /> Blog Management
          </h1>
          <p className="text-muted-foreground">Create, edit, and manage all blog articles. Changes go live immediately.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setAiOpen(true); setAiResult(''); }} className="gap-1.5">
            <Sparkles className="h-4 w-4 text-purple-500" /> AI Generate
          </Button>
          <Button size="sm" onClick={() => openEditor()} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Article
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 max-w-lg">
        <div className="border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold tabular-nums">{totalCount}</p>
          <p className="text-[11px] text-muted-foreground">Total</p>
        </div>
        <div className="border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-green-600">{posts.filter(p => p.is_published).length}</p>
          <p className="text-[11px] text-muted-foreground">Published</p>
        </div>
        <div className="border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-yellow-600">{posts.filter(p => !p.is_published).length}</p>
          <p className="text-[11px] text-muted-foreground">Drafts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={(e) => { e.preventDefault(); fetchPosts(); }} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search titles…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm w-48" />
          </div>
          <Button type="submit" size="sm" variant="outline" className="h-8">Search</Button>
        </form>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={fetchPosts}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState rows={8} />
      ) : posts.length === 0 ? (
        <EmptyState message="No blog posts found. Create one manually or use AI Generate." />
      ) : (
        <DataTable
          columns={columns}
          data={posts}
          totalCount={totalCount}
          enableHoverActions
          hoverActions={hoverActions}
        />
      )}

      {/* ── Article Editor Modal ──────────────────────────────────────────────── */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Article' : 'New Article'}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="px-6 py-4 space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title *</label>
              <Input
                value={form.title}
                onChange={e => {
                  const t = e.target.value;
                  setForm(f => ({ ...f, title: t, slug: f.slug || toSlug(t) }));
                }}
                placeholder="Article title…"
                className="mt-1"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Slug *</label>
              <div className="flex gap-2 mt-1">
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="article-slug" className="font-mono text-sm" />
                <Button type="button" variant="outline" size="sm" onClick={() => setForm(f => ({ ...f, slug: toSlug(f.title) }))}>
                  Auto
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">URL: /blog/{form.slug}</p>
            </div>

            {/* Cover Image */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cover Image <span className="normal-case text-muted-foreground/50">(optional, max 5MB — JPEG/PNG/WebP)</span>
              </label>
              <div className="mt-1 space-y-2">
                {form.cover_image ? (
                  <div className="relative group w-full">
                    <img
                      src={form.cover_image}
                      alt="Cover preview"
                      className="w-full h-40 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, cover_image: '' }))}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/30 transition-colors ${imageUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      {imageUploading ? (
                        <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ImageIcon className="h-6 w-6" />
                      )}
                      <span className="text-xs">{imageUploading ? 'Uploading…' : 'Click to upload cover image'}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={imageUploading}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
                {/* Or paste URL directly */}
                <div className="flex gap-2 items-center">
                  <span className="text-[11px] text-muted-foreground shrink-0">Or URL:</span>
                  <Input
                    value={form.cover_image}
                    onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                    placeholder="https://…"
                    className="h-7 text-xs"
                  />
                </div>
                {imageError && <p className="text-xs text-destructive">{imageError}</p>}
              </div>
            </div>

            {/* Category + Author row */}
            <div className="grid grid-cols-2 gap-4">              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Author</label>
                <Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="mt-1" />
              </div>
            </div>

            {/* Read time + toggles */}
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Read Time</label>
                <Input value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: e.target.value }))} className="mt-1 w-28" placeholder="5 min read" />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input type="checkbox" id="is_published" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="rounded" />
                <label htmlFor="is_published" className="text-sm cursor-pointer">Published</label>
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="rounded" />
                <label htmlFor="is_featured" className="text-sm cursor-pointer">Featured</label>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Excerpt * <span className="normal-case text-muted-foreground/60">(shown on blog card)</span></label>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                placeholder="Short summary shown on the blog listing page…"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Content * <span className="normal-case text-muted-foreground/60">(HTML)</span></label>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={16}
                placeholder="<h2>Introduction</h2><p>Full article HTML…</p>"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* SEO section */}
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SEO Settings</p>
              <div>
                <label className="text-xs text-muted-foreground">Meta Title <span className="text-muted-foreground/50">(max 60 chars)</span></label>
                <Input value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} className="mt-1" maxLength={60} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Meta Description <span className="text-muted-foreground/50">(max 155 chars)</span></label>
                <textarea value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} rows={2} maxLength={155} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Keywords <span className="text-muted-foreground/50">(comma separated)</span></label>
                <Input value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} className="mt-1" placeholder="prop trading India, funded trading, NSE" />
              </div>
            </div>

            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          </div>
          <div className="sticky bottom-0 bg-background border-t px-6 py-3">
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.title || !form.slug || !form.content}>
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Article'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ───────────────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            Are you sure you want to permanently delete <strong className="text-foreground">"{deleteTarget?.title}"</strong>?
            This cannot be undone and will remove it from the live site immediately.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AI Generate Modal ─────────────────────────────────────────────────── */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" /> AI Article Generator
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-3">
            <p className="text-sm text-muted-foreground">
              Generate SEO-optimised articles using Gemini AI. Leave topic blank for random topics from the content pool.
            </p>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Topic <span className="normal-case text-muted-foreground/50">(optional — blank = random)</span></label>
              <Input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g. How to manage drawdown in prop trading" className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
                <select value={aiCategory} onChange={e => setAiCategory(e.target.value)} className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Count <span className="normal-case text-muted-foreground/50">(max 5)</span></label>
                <Input type="number" min={1} max={5} value={aiCount} onChange={e => setAiCount(Math.min(5, Math.max(1, Number(e.target.value))))} className="mt-1" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="ai_publish" checked={aiPublish} onChange={e => setAiPublish(e.target.checked)} className="rounded" />
              <label htmlFor="ai_publish" className="text-sm cursor-pointer">Publish immediately after generation</label>
            </div>

            {aiResult && (
              <pre className="text-[12px] bg-muted/50 rounded-lg p-3 whitespace-pre-wrap max-h-40 overflow-y-auto border">
                {aiResult}
              </pre>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAiOpen(false)} disabled={aiRunning}>Close</Button>
            <Button onClick={handleAiGenerate} disabled={aiRunning} className="gap-1.5">
              <Sparkles className="h-4 w-4" />
              {aiRunning ? 'Generating…' : `Generate ${aiCount} Article${aiCount > 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
