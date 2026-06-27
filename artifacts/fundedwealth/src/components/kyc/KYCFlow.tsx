import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle2, Clock, FileText, Upload, User, MapPin, Camera } from "lucide-react";
import DocumentUpload from "./DocumentUpload";

interface KYCProfile {
  id: number;
  userId: number;
  fullName: string;
  dateOfBirth: string;
  country: string;
  phone: string;
  address: string;
  status: "NOT_STARTED" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "RESUBMISSION_REQUIRED";
  verificationLevel: number;
  riskScore: number;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

type Step = "personal" | "documents" | "selfie" | "review";

export default function KYCFlow() {
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("personal");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<KYCProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    country: "",
    phone: "",
    address: "",
    addressCity: "",
    addressState: "",
    addressPostalCode: "",
  });

  const [documents, setDocuments] = useState<Record<string, string>>({
    identity: "",
    address: "",
    selfie: "",
  });

  // Load KYC profile on mount
  useEffect(() => {
    if (!userId) return;
    loadKYCStatus();
  }, [userId]);

  async function loadKYCStatus() {
    try {
      setLoading(true);
      const response = await fetch("/api/kyc/status");
      if (!response.ok) throw new Error("Failed to load KYC status");

      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
        setFormData({
          fullName: data.profile.fullName || "",
          dateOfBirth: data.profile.dateOfBirth || "",
          country: data.profile.country || "",
          phone: data.profile.phone || "",
          address: data.profile.address || "",
          addressCity: data.profile.addressCity || "",
          addressState: data.profile.addressState || "",
          addressPostalCode: data.profile.addressPostalCode || "",
        });

        // Redirect to appropriate step based on status
        if (data.profile.status === "APPROVED") {
          setCurrentStep("review");
        } else if (data.profile.status === "PENDING" || data.profile.status === "UNDER_REVIEW") {
          setCurrentStep("review");
        }
      } else {
        // Initialize KYC
        const initResponse = await fetch("/api/kyc/start", { method: "POST" });
        if (!initResponse.ok) throw new Error("Failed to initialize KYC");
        const initData = await initResponse.json();
        setProfile(initData.profile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading KYC profile");
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.fullName || !formData.dateOfBirth || !formData.country || !formData.address) {
        setError("Please fill in all required fields");
        return;
      }

      const response = await fetch("/api/kyc/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      const data = await response.json();
      setProfile(data.profile);
      setSuccess("Profile updated successfully");
      setCurrentStep("documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating profile");
    } finally {
      setLoading(false);
    }
  }

  async function submitKYC() {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/kyc/submit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit KYC");
      }

      const data = await response.json();
      setProfile(data.profile);
      setSuccess("KYC submitted successfully for review");
      setCurrentStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error submitting KYC");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive" className="m-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load KYC profile</AlertDescription>
      </Alert>
    );
  }

  const progress = {
    "NOT_STARTED": 0,
    "PENDING": 75,
    "UNDER_REVIEW": 75,
    "APPROVED": 100,
    "REJECTED": 25,
    "RESUBMISSION_REQUIRED": 50,
  }[profile.status] || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Identity Verification</h1>
          <p className="text-purple-200">
            Complete your KYC to unlock payouts and exclusive features
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-8 border-purple-500/30 bg-purple-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {profile.status === "APPROVED" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {profile.status === "PENDING" || profile.status === "UNDER_REVIEW" ? (
                <Clock className="h-5 w-5 text-yellow-500" />
              ) : null}
              {profile.status === "REJECTED" && <AlertCircle className="h-5 w-5 text-red-500" />}
              <span>Status: {profile.status}</span>
            </CardTitle>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent>
            {profile.status === "APPROVED" && (
              <Alert className="bg-green-950/40 border-green-500/30 mb-4">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-400">Verification Complete</AlertTitle>
                <AlertDescription className="text-green-300">
                  Your identity has been verified. You can now request payouts.
                </AlertDescription>
              </Alert>
            )}

            {profile.status === "REJECTED" && profile.rejectionReason && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>{profile.rejectionReason}</AlertDescription>
              </Alert>
            )}

            {profile.status === "PENDING" || profile.status === "UNDER_REVIEW" ? (
              <Alert className="bg-yellow-950/40 border-yellow-500/30">
                <Clock className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-yellow-400">Under Review</AlertTitle>
                <AlertDescription className="text-yellow-300">
                  Your documents are being reviewed. This usually takes 24-48 hours.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-950/40 border-green-500/30">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-400">Success</AlertTitle>
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {/* Form Steps */}
        {profile.status !== "APPROVED" && (
          <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as Step)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-purple-900/50 border-purple-500/30">
              <TabsTrigger
                value="personal"
                disabled={profile.status === "PENDING" || profile.status === "UNDER_REVIEW"}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                disabled={profile.status === "PENDING" || profile.status === "UNDER_REVIEW"}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger
                value="selfie"
                disabled={profile.status === "PENDING" || profile.status === "UNDER_REVIEW"}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Selfie</span>
              </TabsTrigger>
              <TabsTrigger
                value="review"
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Review</span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Step */}
            <TabsContent value="personal" className="space-y-6">
              <Card className="border-purple-500/30 bg-purple-950/40">
                <CardHeader>
                  <CardTitle className="text-white">Personal Information</CardTitle>
                  <CardDescription>Enter your basic personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-purple-200">
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob" className="text-purple-200">
                        Date of Birth *
                      </Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="bg-purple-900/40 border-purple-500/30 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country" className="text-purple-200">
                        Country *
                      </Label>
                      <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                        <SelectTrigger className="bg-purple-900/40 border-purple-500/30 text-white">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 border-purple-500/30">
                          <SelectItem value="IN">India</SelectItem>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-purple-200">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-400"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-purple-200">
                      Address *
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-purple-200">
                        City
                      </Label>
                      <Input
                        id="city"
                        placeholder="Mumbai"
                        value={formData.addressCity}
                        onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                        className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-purple-200">
                        State
                      </Label>
                      <Input
                        id="state"
                        placeholder="Maharashtra"
                        value={formData.addressState}
                        onChange={(e) => setFormData({ ...formData, addressState: e.target.value })}
                        className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip" className="text-purple-200">
                        ZIP Code
                      </Label>
                      <Input
                        id="zip"
                        placeholder="400001"
                        value={formData.addressPostalCode}
                        onChange={(e) => setFormData({ ...formData, addressPostalCode: e.target.value })}
                        className="bg-purple-900/40 border-purple-500/30 text-white placeholder:text-purple-400"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={updateProfile}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                {loading ? <Spinner className="mr-2" /> : null}
                Continue to Documents
              </Button>
            </TabsContent>

            {/* Documents Step */}
            <TabsContent value="documents" className="space-y-6">
              <DocumentUpload
                documentType="identity"
                title="Identity Document"
                description="Upload your passport, PAN, Aadhar, or driving license"
                acceptedTypes={["PASSPORT", "PAN", "AADHAR", "DRIVING_LICENSE", "NATIONAL_ID"]}
              />
              <DocumentUpload
                documentType="address"
                title="Address Proof"
                description="Upload a bank statement or utility bill as address proof"
                acceptedTypes={["BANK_STATEMENT", "UTILITY_BILL"]}
              />

              <Button
                onClick={() => setCurrentStep("selfie")}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                Continue to Selfie
              </Button>
            </TabsContent>

            {/* Selfie Step */}
            <TabsContent value="selfie" className="space-y-6">
              <DocumentUpload
                documentType="selfie"
                title="Live Selfie"
                description="Take a clear selfie with good lighting. We'll verify it matches your identity document."
                acceptedTypes={["SELFIE"]}
              />

              <Button
                onClick={() => setCurrentStep("review")}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                Review & Submit
              </Button>
            </TabsContent>

            {/* Review Step */}
            <TabsContent value="review" className="space-y-6">
              <Card className="border-purple-500/30 bg-purple-950/40">
                <CardHeader>
                  <CardTitle className="text-white">Review Your Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-purple-300">Full Name</p>
                      <p className="text-white font-semibold">{formData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-300">Date of Birth</p>
                      <p className="text-white font-semibold">{formData.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-300">Country</p>
                      <p className="text-white font-semibold">{formData.country}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-300">Phone</p>
                      <p className="text-white font-semibold">{formData.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {profile.status !== "PENDING" && profile.status !== "UNDER_REVIEW" && (
                <Button
                  onClick={submitKYC}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  {submitting ? <Spinner className="mr-2" /> : null}
                  Submit for Review
                </Button>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
