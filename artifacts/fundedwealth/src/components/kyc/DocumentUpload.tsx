import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, Upload, X, FileText, AlertCircle } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface UploadedDoc {
  documentType: string;
  url: string;
  fileName: string;
  fileSize: number;
}

interface DocumentUploadProps {
  documentType: string;
  label: string;
  description: string;
  /** Whether a KYC profile record already exists in the DB */
  kycProfileReady: boolean;
  /** Called when the profile doesn't exist yet — should create it and update parent state */
  onProfileInit: () => Promise<void>;
  /** Called after a successful upload */
  onUploadComplete: (doc: UploadedDoc) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"] as const;
const ALLOWED_EXTS = ".jpg,.jpeg,.png,.pdf";
const ALLOWED_LABEL = "JPG, PNG or PDF (max 5 MB)";

// ── Helper: format file size ─────────────────────────────────────────────────

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DocumentUpload({
  documentType,
  label,
  description,
  kycProfileReady,
  onProfileInit,
  onUploadComplete,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function processFile(file: File) {
    setError(null);

    // Client-side validation
    if (!ALLOWED_MIME.includes(file.type as typeof ALLOWED_MIME[number])) {
      setError(`Invalid file type. Allowed: ${ALLOWED_LABEL}`);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File is too large (${fmtSize(file.size)}). Maximum size is 5 MB.`);
      return;
    }

    setUploading(true);
    try {
      // Ensure KYC profile exists before uploading
      if (!kycProfileReady) {
        await onProfileInit();
      }

      // Read file as Base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result.split(",")[1]); // strip data URL prefix
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/kyc/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          fileBase64,
          fileName: file.name,
          mimeType: file.type,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || "Upload failed");
      }

      const data = await res.json();
      const doc: UploadedDoc = {
        documentType,
        url: data.fileUrl,
        fileName: file.name,
        fileSize: file.size,
      };
      setUploaded(doc);
      onUploadComplete(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected after removal
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function removeFile() {
    setUploaded(null);
    setError(null);
  }

  // ── Render: uploaded state ────────────────────────────────────────────────

  if (uploaded) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-900/20 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-green-300 truncate">{label}</p>
            <p className="text-xs text-green-400/70 truncate">
              {uploaded.fileName} · {fmtSize(uploaded.fileSize)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={removeFile}
          aria-label={`Remove ${label}`}
          className="ml-3 flex-shrink-0 rounded-md p-1 text-green-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ── Render: upload area ───────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-purple-400">{description}</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors",
          dragging
            ? "border-purple-400 bg-purple-800/30"
            : "border-purple-500/30 bg-purple-900/20 hover:border-purple-400/60 hover:bg-purple-900/30",
          uploading ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={ALLOWED_EXTS}
          onChange={handleInputChange}
          disabled={uploading}
          aria-hidden="true"
        />

        {uploading ? (
          <>
            <Spinner className="h-8 w-8 mb-3 text-purple-400" />
            <p className="text-sm text-purple-200">Uploading…</p>
          </>
        ) : (
          <>
            <div className="rounded-full bg-purple-800/50 p-3 mb-3">
              <Upload className="h-5 w-5 text-purple-300" />
            </div>
            <p className="text-sm font-medium text-purple-200">
              Click to upload or drag &amp; drop
            </p>
            <p className="text-xs text-purple-400 mt-1">{ALLOWED_LABEL}</p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-900/20 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
