import React, { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle2, Upload, X } from "lucide-react";

interface DocumentUploadProps {
  documentType: string;
  title: string;
  description: string;
  acceptedTypes: string[];
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export default function DocumentUpload({
  documentType,
  title,
  description,
  acceptedTypes,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setSuccess(null);
      setUploading(true);

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File too large. Maximum size is 10MB.");
        return;
      }

      // Validate file type
      const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
      if (!allowedMimeTypes.includes(file.type)) {
        setError("Invalid file type. Only PNG, JPG, WebP, and PDF are allowed.");
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileBase64 = (e.target?.result as string).split(",")[1];

        try {
          const response = await fetch("/api/kyc/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentType,
              fileBase64,
              fileName: file.name,
              mimeType: file.type,
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to upload document");
          }

          const data = await response.json();
          setUploadedFile({
            id: data.document.id,
            name: file.name,
            size: file.size,
            type: file.type,
            url: data.fileUrl,
            uploadedAt: new Date().toISOString(),
          });
          setSuccess("Document uploaded successfully");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error uploading document");
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setError("Error reading file");
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error processing file");
      setUploading(false);
    }
  }

  return (
    <Card className="border-purple-500/30 bg-purple-950/40">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="bg-green-950/40 border-green-500/30">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-400">Success</AlertTitle>
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {/* Uploaded File Display */}
        {uploadedFile && (
          <div className="bg-green-950/20 border border-green-500/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-green-400 font-semibold">{uploadedFile.name}</p>
                <p className="text-xs text-green-300">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUploadedFile(null)}
              className="text-green-400 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Upload Area */}
        {!uploadedFile && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400/50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".png,.jpg,.jpeg,.webp,.pdf"
              disabled={uploading}
            />

            {uploading ? (
              <>
                <Spinner className="h-8 w-8 mx-auto mb-3" />
                <p className="text-purple-200">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto mb-3 text-purple-400" />
                <p className="text-purple-200 font-semibold">Click to upload or drag and drop</p>
                <p className="text-xs text-purple-400 mt-1">PNG, JPG, WebP, or PDF (max 10MB)</p>
              </>
            )}
          </div>
        )}

        {/* Document Type Hint */}
        <div className="bg-purple-900/30 border border-purple-500/20 rounded p-3">
          <p className="text-xs text-purple-300">
            <strong>Accepted documents:</strong> {acceptedTypes.join(", ")}
          </p>
          <p className="text-xs text-purple-400 mt-1">
            Ensure the image is clear, well-lit, and all text is readable.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
