import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Upload,
  User,
  Lock,
} from "lucide-react";
import DocumentUpload from "./DocumentUpload";

// ── Types ────────────────────────────────────────────────────────────────────

export type KYCStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "RESUBMISSION_REQUIRED"
  | "ADDITIONAL_DOCS_REQUIRED";

interface KYCProfile {
  id: number;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  country: string;
  countryCode?: string;
  phone: string;
  address: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  status: KYCStatus;
  verificationLevel: number;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  reviewNotes?: string;
}

interface UploadedDoc {
  documentType: string;
  url: string;
  fileName: string;
}

// ── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  KYCStatus,
  { label: string; color: string; icon: React.ReactNode; progress: number; description: string }
> = {
  NOT_STARTED: {
    label: "Not Started",
    color: "border-slate-500/30 bg-slate-900/30",
    icon: <Clock className="h-5 w-5 text-slate-400" />,
    progress: 0,
    description: "Complete the form below to start your verification.",
  },
  PENDING: {
    label: "Pending Review",
    color: "border-yellow-500/30 bg-yellow-900/20",
    icon: <Clock className="h-5 w-5 text-yellow-400" />,
    progress: 70,
    description: "Your submission is queued for review. This usually takes 24–48 hours.",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "border-blue-500/30 bg-blue-900/20",
    icon: <Clock className="h-5 w-5 text-blue-400" />,
    progress: 80,
    description: "Our compliance team is actively reviewing your documents.",
  },
  APPROVED: {
    label: "Verified",
    color: "border-green-500/30 bg-green-900/20",
    icon: <ShieldCheck className="h-5 w-5 text-green-400" />,
    progress: 100,
    description: "Your identity is verified. You can now request payouts.",
  },
  REJECTED: {
    label: "Rejected",
    color: "border-red-500/30 bg-red-900/20",
    icon: <ShieldAlert className="h-5 w-5 text-red-400" />,
    progress: 20,
    description: "Your submission was rejected. Please review the reason and resubmit.",
  },
  RESUBMISSION_REQUIRED: {
    label: "Re-upload Required",
    color: "border-orange-500/30 bg-orange-900/20",
    icon: <AlertCircle className="h-5 w-5 text-orange-400" />,
    progress: 40,
    description: "Please re-upload your documents as requested by our team.",
  },
  ADDITIONAL_DOCS_REQUIRED: {
    label: "Additional Documents Required",
    color: "border-amber-500/30 bg-amber-900/20",
    icon: <FileText className="h-5 w-5 text-amber-400" />,
    progress: 50,
    description: "Our team needs additional documents to complete your verification.",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function isEditable(status: KYCStatus): boolean {
  return status === "NOT_STARTED" || status === "RESUBMISSION_REQUIRED" || status === "ADDITIONAL_DOCS_REQUIRED" || status === "REJECTED";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function KYCFlow() {
  const { userId } = useAuth();

  // Eligibility
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);

  // Profile
  const [profile, setProfile] = useState<KYCProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    country: "IN",
    countryCode: "IN",
    phone: "",
    address: "",
    addressCity: "",
    addressState: "",
    addressPostalCode: "",
  });

  // Document uploads
  const [uploads, setUploads] = useState<Record<string, UploadedDoc | null>>({
    PAN: null,
    AADHAR_FRONT: null,
    AADHAR_BACK: null,
  });

  // ── Load eligibility + status on mount ────────────────────────────────────

  const checkEligibility = useCallback(async () => {
    setEligibilityLoading(true);
    try {
      const res = await fetch("/api/kyc/eligibility");
      if (!res.ok) { setEligible(false); return; }
      const data = await res.json();
      setEligible(!!data.eligible);
    } catch {
      setEligible(false);
    } finally {
      setEligibilityLoading(false);
    }
  }, []);

  const loadKYCStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/kyc/status");
      if (!res.ok) throw new Error("Failed to load KYC status");
      const data = await res.json();

      if (data.profile) {
        setProfile(data.profile);
        setFormData((prev) => ({
          ...prev,
          fullName: data.profile.fullName || "",
          dateOfBirth: data.profile.dateOfBirth || "",
          country: data.profile.country || "IN",
          countryCode: data.profile.countryCode || "IN",
          phone: data.profile.phone || "",
          address: data.profile.address || "",
          addressCity: data.profile.addressCity || "",
          addressState: data.profile.addressState || "",
          addressPostalCode: data.profile.addressPostalCode || "",
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading KYC profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    void checkEligibility();
    void loadKYCStatus();
  }, [userId, checkEligibility, loadKYCStatus]);

  // ── Save profile ──────────────────────────────────────────────────────────

  async function saveProfile() {
    setLoading(true);
    setError(null);
    try {
      if (!formData.fullName || !formData.dateOfBirth || !formData.country || !formData.address) {
        setError("Please fill in all required fields.");
        return false;
      }

      // Initialize profile if not yet created
      if (!profile) {
        const initRes = await fetch("/api/kyc/start", { method: "POST" });
        if (!initRes.ok) {
          const d = await initRes.json();
          throw new Error(d.message || d.error || "Failed to initialize KYC");
        }
        const initData = await initRes.json();
        setProfile(initData.profile);
      }

      const patchRes = await fetch("/api/kyc/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!patchRes.ok) {
        const d = await patchRes.json();
        throw new Error(d.error || "Failed to save profile");
      }
      const patchData = await patchRes.json();
      setProfile(patchData.profile);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving profile");
      return false;
    } finally {
      setLoading(false);
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate all docs are uploaded
    const missing = (["PAN", "AADHAR_FRONT", "AADHAR_BACK"] as const).filter(
      (t) => !uploads[t]
    );
    if (missing.length > 0) {
      const labels: Record<string, string> = {
        PAN: "PAN Card",
        AADHAR_FRONT: "Aadhaar Front",
        AADHAR_BACK: "Aadhaar Back",
      };
      setError(`Please upload: ${missing.map((m) => labels[m]).join(", ")}`);
      return;
    }

    const saved = await saveProfile();
    if (!saved) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/kyc/submit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || d.error || "Submission failed");
      }
      const data = await res.json();
      setProfile(data.profile);
      setSuccess("Your KYC has been submitted for review. We'll notify you within 24–48 hours.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error submitting KYC");
    } finally {
      setSubmitting(false);
    }
  }

  function handleUploadComplete(docType: string, doc: UploadedDoc) {
    setUploads((prev) => ({ ...prev, [docType]: doc }));
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (eligibilityLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  const currentStatus = profile?.status ?? "NOT_STARTED";
  const statusCfg = STATUS_CONFIG[currentStatus];
  const editable = isEditable(currentStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-black p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">KYC Verification</h1>
          <p className="text-purple-300 mt-1">
            Complete your identity verification to unlock payouts and higher account limits.
          </p>
        </div>

        {/* Status Banner */}
        <div className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${statusCfg.color}`}>
          {statusCfg.icon}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white">{statusCfg.label}</p>
            <p className="text-sm text-purple-200 mt-0.5">{statusCfg.description}</p>
            {profile?.rejectionReason && (
              <p className="text-sm text-red-300 mt-1">
                <span className="font-medium">Reason:</span> {profile.rejectionReason}
              </p>
            )}
            {profile?.reviewNotes && currentStatus === "ADDITIONAL_DOCS_REQUIRED" && (
              <p className="text-sm text-amber-300 mt-1">
                <span className="font-medium">Admin note:</span> {profile.reviewNotes}
              </p>
            )}
          </div>
          {profile?.submittedAt && (
            <p className="text-xs text-purple-400 whitespace-nowrap">
              Submitted {new Date(profile.submittedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {statusCfg.progress > 0 && (
          <Progress value={statusCfg.progress} className="h-1.5" />
        )}

        {/* Ineligibility Wall */}
        {!eligible && (
          <Card className="border-purple-500/30 bg-purple-950/40">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <div className="rounded-full bg-purple-900/60 p-4">
                  <Lock className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    KYC Not Available Yet
                  </h3>
                  <p className="text-purple-200 max-w-md">
                    KYC verification becomes available after your first Challenge or
                    Instant Funding account is activated.
                  </p>
                </div>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
                >
                  Browse Challenges
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approved — show final state only */}
        {eligible && currentStatus === "APPROVED" && (
          <Card className="border-green-500/30 bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-10 w-10 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-lg">Identity Verified</p>
                  <p className="text-green-300 text-sm mt-0.5">
                    Your KYC is complete. Payouts and premium features are now unlocked.
                  </p>
                  {profile?.approvedAt && (
                    <p className="text-green-400 text-xs mt-1">
                      Approved on {new Date(profile.approvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Under review — no editing */}
        {eligible && (currentStatus === "PENDING" || currentStatus === "UNDER_REVIEW") && (
          <Card className="border-yellow-500/30 bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Clock className="h-10 w-10 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-lg">Review in Progress</p>
                  <p className="text-yellow-200 text-sm mt-0.5">
                    Your documents have been submitted and are being reviewed. No action needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KYC Form — editable states */}
        {eligible && editable && (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Personal Details */}
            <Card className="border-purple-500/30 bg-purple-950/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5 text-purple-400" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your details must match your identity documents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-purple-200">
                      Full Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="As on your PAN / Aadhaar"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dob" className="text-purple-200">
                      Date of Birth <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="bg-purple-900/40 border-purple-500/30 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-purple-200">
                      Country <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(v) => setFormData({ ...formData, country: v, countryCode: v })}
                    >
                      <SelectTrigger className="bg-purple-900/40 border-purple-500/30 text-white">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="bg-purple-900 border-purple-500/30">
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="AE">UAE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-purple-200">
                      Phone Number <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-purple-200">
                    Address <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Street address as on Aadhaar card"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-500 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-purple-200">City</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      value={formData.addressCity}
                      onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                      className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-purple-200">State</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      value={formData.addressState}
                      onChange={(e) => setFormData({ ...formData, addressState: e.target.value })}
                      className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postal" className="text-purple-200">PIN Code</Label>
                    <Input
                      id="postal"
                      placeholder="400001"
                      value={formData.addressPostalCode}
                      onChange={(e) => setFormData({ ...formData, addressPostalCode: e.target.value })}
                      className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Uploads */}
            <Card className="border-purple-500/30 bg-purple-950/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Upload Documents
                </CardTitle>
                <CardDescription>
                  All three documents are required. JPG, PNG or PDF — max 5 MB each.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DocumentUpload
                  documentType="PAN"
                  label="PAN Card"
                  description="Upload a clear image or scan of your PAN card"
                  kycProfileReady={!!profile}
                  onProfileInit={async () => {
                    const initRes = await fetch("/api/kyc/start", { method: "POST" });
                    if (!initRes.ok) throw new Error("Failed to initialize KYC");
                    const d = await initRes.json();
                    setProfile(d.profile);
                  }}
                  onUploadComplete={(doc) => handleUploadComplete("PAN", doc)}
                />
                <DocumentUpload
                  documentType="AADHAR_FRONT"
                  label="Aadhaar Card — Front"
                  description="Upload the front side of your Aadhaar card"
                  kycProfileReady={!!profile}
                  onProfileInit={async () => {
                    const initRes = await fetch("/api/kyc/start", { method: "POST" });
                    if (!initRes.ok) throw new Error("Failed to initialize KYC");
                    const d = await initRes.json();
                    setProfile(d.profile);
                  }}
                  onUploadComplete={(doc) => handleUploadComplete("AADHAR_FRONT", doc)}
                />
                <DocumentUpload
                  documentType="AADHAR_BACK"
                  label="Aadhaar Card — Back"
                  description="Upload the back side of your Aadhaar card"
                  kycProfileReady={!!profile}
                  onProfileInit={async () => {
                    const initRes = await fetch("/api/kyc/start", { method: "POST" });
                    if (!initRes.ok) throw new Error("Failed to initialize KYC");
                    const d = await initRes.json();
                    setProfile(d.profile);
                  }}
                  onUploadComplete={(doc) => handleUploadComplete("AADHAR_BACK", doc)}
                />
              </CardContent>
            </Card>

            {/* Error / Success */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-950/40 border-green-500/30">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertTitle className="text-green-300">Submitted</AlertTitle>
                <AlertDescription className="text-green-200">{success}</AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting || loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" /> Submitting…
                </span>
              ) : (
                "Submit for Verification"
              )}
            </Button>

            {/* Why KYC */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-4">
              <p className="text-sm font-medium text-amber-300 mb-1">Why is KYC required?</p>
              <p className="text-xs text-amber-200/80">
                As per SEBI guidelines, identity verification is mandatory before processing any
                payouts. Your documents are securely stored and used solely for compliance purposes.
                Documents accepted: clear photo or scanned copy of PAN Card, Aadhaar Front, and
                Aadhaar Back.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
