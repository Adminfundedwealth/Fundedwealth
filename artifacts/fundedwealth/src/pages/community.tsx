import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  MessageCircle,
  Users,
  ExternalLink,
  Shield,
  Zap,
  BookOpen,
  Trophy,
  Heart,
  Send,
  ThumbsUp,
  Trash2,
  Pin,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  X,
  Loader2,
  TrendingUp,
  HelpCircle,
  GraduationCap,
  Star,
  ImagePlus,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/SupabaseAuthContext";
import { api } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type Post = {
  id: number;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  content: string;
  imageUrl: string | null;
  category: string;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  likedByMe: boolean;
  createdAt: string;
};

type Comment = {
  id: number;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  content: string;
  createdAt: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "all", label: "All", icon: <Users size={14} /> },
  { key: "general", label: "General", icon: <MessageCircle size={14} /> },
  { key: "trades", label: "Trades", icon: <TrendingUp size={14} /> },
  { key: "education", label: "Education", icon: <GraduationCap size={14} /> },
  { key: "help", label: "Help", icon: <HelpCircle size={14} /> },
  { key: "milestone", label: "Milestone", icon: <Star size={14} /> },
];

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-blue-500/20 text-blue-300",
  trades: "bg-green-500/20 text-green-300",
  education: "bg-purple-500/20 text-purple-300",
  help: "bg-yellow-500/20 text-yellow-300",
  milestone: "bg-orange-500/20 text-orange-300",
};

const SOCIAL_LINKS = [
  {
    platform: "WhatsApp",
    name: "FW Traders Community",
    members: "8,500+",
    desc: "Daily market analysis, trade ideas, and real-time support from funded traders.",
    link: "https://whatsapp.com/channel/0029Vb7PZoPFHWpz05pv7Q0A",
    color: "from-green-500 to-green-600",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    platform: "Telegram",
    name: "FundedWealth Official",
    members: "12,000+",
    desc: "Announcements, payout proofs, championship updates, and exclusive content.",
    link: "https://t.me/fundedwealthind",
    color: "from-blue-500 to-blue-600",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#26A5E4">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    platform: "YouTube",
    name: "FundedWealth",
    members: "18,000+",
    desc: "Educational videos, market analysis, platform tutorials, and success stories.",
    link: "https://www.youtube.com/@FundedWealth",
    color: "from-red-500 to-red-600",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    platform: "Instagram",
    name: "@fundedwealthind",
    members: "25,000+",
    desc: "Trading motivation, payout reels, trader spotlights, and behind-the-scenes.",
    link: "https://www.instagram.com/fundedwealthind?igsh=MWE1ajVibG9sNGtyNw==",
    color: "from-pink-500 to-purple-500",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#E1306C">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function Avatar({ name, url, size = 8 }: { name: string; url?: string | null; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`w-${size} h-${size} rounded-full object-cover shrink-0`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "";
        }}
      />
    );
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0`}
    >
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin" || role === "super_admin") {
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 ml-1">
        ADMIN
      </span>
    );
  }
  return null;
}

// ─── Comment component ────────────────────────────────────────────────────────

function CommentItem({
  comment,
  currentUserId,
  isAdmin,
  onDelete,
}: {
  comment: Comment;
  currentUserId?: string | null;
  isAdmin: boolean;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-white/5 last:border-0">
      <Avatar name={comment.authorName} url={comment.authorAvatar} size={7} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-white/80 text-sm font-semibold">{comment.authorName}</span>
          <RoleBadge role={comment.authorRole} />
          <span className="text-white/30 text-xs ml-auto">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-white/70 text-sm break-words">{comment.content}</p>
      </div>
      {(isAdmin) && (
        <button
          onClick={() => onDelete(comment.id)}
          className="text-white/20 hover:text-red-400 transition-colors shrink-0 self-start mt-0.5"
          aria-label="Delete comment"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Post component ───────────────────────────────────────────────────────────

function PostCard({
  post,
  currentUserClerkId,
  isAdmin,
  onLike,
  onDelete,
  onPin,
}: {
  post: Post;
  currentUserClerkId?: string | null;
  isAdmin: boolean;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onPin: (id: number) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadComments = useCallback(async () => {
    if (commentsLoading) return;
    setCommentsLoading(true);
    try {
      const data = await api.get(`/community/posts/${post.id}/comments`);
      setComments(data);
    } catch {
      // ignore
    } finally {
      setCommentsLoading(false);
    }
  }, [post.id]);

  const toggleComments = () => {
    if (!showComments && comments.length === 0) loadComments();
    setShowComments((s) => !s);
  };

  const submitComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const newComment = await api.post(`/community/posts/${post.id}/comments`, {
        content: commentText.trim(),
      });
      setComments((c) => [newComment, ...c]);
      setCommentText("");
    } catch {
      // ignore
    } finally {
      setSubmittingComment(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await api.delete(`/community/comments/${commentId}`);
      setComments((c) => c.filter((x) => x.id !== commentId));
    } catch {
      // ignore
    }
  };

  return (
    <Card className={`glass-card border-white/10 ${post.isPinned ? "border-orange-500/30 bg-orange-500/5" : ""}`}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar name={post.authorName} url={post.authorAvatar} size={9} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-white font-semibold text-sm">{post.authorName}</span>
              <RoleBadge role={post.authorRole} />
              {post.isPinned && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 ml-1 flex items-center gap-0.5">
                  <Pin size={9} /> Pinned
                </span>
              )}
              <span className="text-white/30 text-xs ml-auto shrink-0">{timeAgo(post.createdAt)}</span>
            </div>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 inline-block ${CATEGORY_COLORS[post.category] ?? "bg-white/10 text-white/50"}`}>
              {post.category}
            </span>
          </div>
          {/* Admin actions */}
          {isAdmin && (
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => onPin(post.id)}
                className="text-white/20 hover:text-orange-400 transition-colors"
                title={post.isPinned ? "Unpin" : "Pin"}
              >
                <Pin size={14} />
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="text-white/20 hover:text-red-400 transition-colors"
                title="Delete post"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
          {/* Own post delete (non-admin) */}
          {!isAdmin && currentUserClerkId && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-white/20 hover:text-red-400 transition-colors shrink-0"
              title="Delete post"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-white/80 text-sm leading-relaxed mb-3 break-words whitespace-pre-wrap">{post.content}</p>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post attachment"
            className="rounded-xl mb-3 max-h-72 w-full object-cover border border-white/10"
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-white/5">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${post.likedByMe ? "text-blue-400" : "text-white/40 hover:text-blue-400"
              }`}
          >
            <ThumbsUp size={15} fill={post.likedByMe ? "currentColor" : "none"} />
            <span>{post.likesCount}</span>
          </button>
          <button
            onClick={toggleComments}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <MessageCircle size={15} />
            <span>{post.commentsCount}</span>
            {showComments ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-3 border-t border-white/5">
            {/* New comment input */}
            {currentUserClerkId && (
              <div className="flex gap-2 mb-4">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitComment()}
                  placeholder="Write a comment…"
                  maxLength={500}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
                <Button
                  size="sm"
                  onClick={submitComment}
                  disabled={!commentText.trim() || submittingComment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                >
                  {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </Button>
              </div>
            )}

            {commentsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={18} className="animate-spin text-white/30" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-3">No comments yet. Be the first!</p>
            ) : (
              <div>
                {comments.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    currentUserId={currentUserClerkId}
                    isAdmin={isAdmin}
                    onDelete={deleteComment}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── New post form ────────────────────────────────────────────────────────────

function NewPostForm({ onPosted }: { onPosted: (post: Post) => void }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX = 2000;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5 MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;

      // Upload image first if selected
      if (imageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("image", imageFile);
        const res = await fetch(`${import.meta.env.BASE_URL}api/community/upload-image`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        setUploadingImage(false);
        if (res.ok) {
          const data = await res.json();
          imageUrl = data.url;
        }
      }

      const post = await api.post("/community/posts", {
        content: content.trim(),
        category,
        imageUrl,
      });
      onPosted({ ...post, likedByMe: false });
      setContent("");
      setCategory("general");
      removeImage();
      setOpen(false);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl px-4 py-3 text-white/40 hover:text-white/60 transition-all text-sm"
      >
        <PlusCircle size={16} className="shrink-0" />
        What's on your mind? Share a trade, question, or milestone…
      </button>
    );
  }

  return (
    <Card className="glass-card border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">New Post</h3>
          <button onClick={() => { setOpen(false); removeImage(); }} className="text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a trade update, ask a question, or celebrate a milestone…"
          maxLength={MAX}
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none mb-3"
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="relative mb-3 inline-block">
            <img src={imagePreview} alt="Preview" className="rounded-xl max-h-48 max-w-full object-cover border border-white/10" />
            <button
              onClick={removeImage}
              className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-500/80 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Image upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
              title="Attach image"
            >
              <ImagePlus size={15} />
              <span>Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
          <span className={`text-xs ${content.length > MAX * 0.9 ? "text-orange-400" : "text-white/30"}`}>
            {content.length}/{MAX}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.filter((c) => c.key !== "all").map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${category === c.key
                ? "bg-white/20 text-white border-white/30"
                : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={submit}
            disabled={!content.trim() || submitting}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-6"
          >
            {(submitting || uploadingImage) ? <Loader2 size={14} className="animate-spin mr-2" /> : <Send size={14} className="mr-2" />}
            {uploadingImage ? "Uploading…" : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Community() {
  const { isSignedIn, user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "social">("feed");

  const isAdmin = false; // Admin check happens server-side via API

  const fetchPosts = useCallback(
    async (cat: string, pg: number, append = false) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      try {
        const params = new URLSearchParams({ page: String(pg) });
        if (cat !== "all") params.set("category", cat);
        const data = await api.get(`/community/posts?${params}`);
        setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
        setHasMore(data.hasMore);
      } catch {
        // ignore
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    fetchPosts(activeCategory, 1);
  }, [activeCategory, fetchPosts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(activeCategory, next, true);
  };

  const handleLike = async (postId: number) => {
    if (!isSignedIn) return;
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likedByMe ? p.likesCount - 1 : p.likesCount + 1 }
          : p
      )
    );
    try {
      await api.post(`/community/posts/${postId}/like`, {});
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likedByMe ? p.likesCount - 1 : p.likesCount + 1 }
            : p
        )
      );
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await api.delete(`/community/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      // ignore
    }
  };

  const handlePin = async (postId: number) => {
    try {
      const updated = await api.patch(`/community/posts/${postId}/pin`, {});
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isPinned: updated.isPinned } : p)));
    } catch {
      // ignore
    }
  };

  const handleNewPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Trading Community India — Join 15,000+ Funded Traders"
        description="Join India's largest prop trading community. Connect with 15,000+ funded traders. Free trading signals, market analysis & support from FundedWealth."
        keywords="trading community India, prop trading group India, funded traders community, trading discord India, free trading signals India"
        canonical="/community"
      />

      {/* Nav */}
      <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
          </Link>
          <h1 className="text-lg font-heading font-bold flex items-center gap-2">
            <Users className="text-green-400" size={20} /> Community
          </h1>
          <Link href="/">
            <Button variant="ghost" className="text-white/70 hover:text-white">
              Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 bg-white/5 rounded-xl p-1 w-fit mx-auto">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "feed" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
              }`}
          >
            Feed
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "social" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
              }`}
          >
            Join Us
          </button>
        </div>

        {/* ── FEED TAB ── */}
        {activeTab === "feed" && (
          <div>
            {/* New post */}
            {isSignedIn && (
              <div className="mb-6">
                <NewPostForm onPosted={handleNewPost} />
              </div>
            )}
            {!isSignedIn && (
              <Card className="glass-card border-white/10 mb-6">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <p className="text-white/60 text-sm">Sign in to post, comment, and like</p>
                  <Link href="/sign-in">
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold">
                      Sign In
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap mb-5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${activeCategory === c.key
                    ? "bg-white/20 text-white border-white/30"
                    : "bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white/60"
                    }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Posts */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-white/30" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle size={40} className="mx-auto text-white/20 mb-3" />
                <p className="text-white/40 text-sm">No posts yet in this category. Be the first to post!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserClerkId={user?.id ?? null}
                    isAdmin={isAdmin}
                    onLike={handleLike}
                    onDelete={handleDelete}
                    onPin={handlePin}
                  />
                ))}
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="ghost"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="text-white/40 hover:text-white/70"
                    >
                      {loadingMore ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SOCIAL TAB ── */}
        {activeTab === "social" && (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-heading font-extrabold mb-3">
                Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">FW Community</span>
              </h2>
              <p className="text-white/50 text-sm max-w-md mx-auto">
                Connect with 50,000+ traders across WhatsApp, Telegram, YouTube, and Instagram. Learn, grow, and trade together.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {SOCIAL_LINKS.map((c, i) => (
                <Card key={i} className="glass-card border-white/10 hover:border-white/20 transition-all group">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0`}>
                        {c.icon}
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">{c.platform}</div>
                        <div className="text-white/40 text-xs">{c.members} members</div>
                      </div>
                    </div>
                    <h3 className="text-white font-heading font-bold text-sm mb-1.5">{c.name}</h3>
                    <p className="text-white/50 text-xs mb-4">{c.desc}</p>
                    <a href={c.link} target="_blank" rel="noopener noreferrer" className="block w-full">
                      <Button
                        className={`w-full bg-gradient-to-r ${c.color} text-white border-0 font-bold text-sm`}
                      >
                        Join Now <ExternalLink size={13} className="ml-2" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Benefits */}
            <h3 className="text-xl font-heading font-bold text-white text-center mb-6">Why Join?</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
              {[
                { icon: <MessageCircle size={18} />, title: "Daily Trade Ideas", desc: "Market analysis and setups every morning." },
                { icon: <Users size={18} />, title: "Mentor Access", desc: "Connect with funded traders who've made it." },
                { icon: <Zap size={18} />, title: "Instant Support", desc: "Quick answers from moderators and the FW team." },
                { icon: <Trophy size={18} />, title: "Exclusive Contests", desc: "Community-only trading contests with bonus prizes." },
                { icon: <BookOpen size={18} />, title: "Free Education", desc: "Weekly webinars and strategy sessions." },
                { icon: <Heart size={18} />, title: "Accountability", desc: "Stay on track and celebrate wins together." },
              ].map((b, i) => (
                <Card key={i} className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-fw-orange mb-2.5">
                      {b.icon}
                    </div>
                    <h4 className="text-white font-bold text-sm mb-1">{b.title}</h4>
                    <p className="text-white/40 text-xs">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="glass-card border-green-500/20 max-w-lg mx-auto">
              <CardContent className="p-6 text-center">
                <Shield className="text-green-400 mx-auto mb-3" size={28} />
                <h3 className="text-lg font-heading font-bold text-white mb-2">Safe &amp; Moderated</h3>
                <p className="text-white/50 text-sm">
                  All communities are actively moderated. No spam, no scams — just genuine traders helping each other grow.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
