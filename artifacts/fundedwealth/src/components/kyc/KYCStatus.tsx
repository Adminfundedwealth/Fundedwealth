import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface KYCProfile {
  id: number;
  status: "NOT_STARTED" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "RESUBMISSION_REQUIRED";
  verificationLevel: number;
  submittedAt?: string;
  approvedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
}

export default function KYCStatus() {
  const { userId } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<KYCProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setProfile(data.profile || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading KYC status");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="border-purple-500/30 bg-purple-950/40">
        <CardContent className="pt-6 flex items-center justify-center py-8">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="border-purple-500/30 bg-purple-950/40">
        <CardHeader>
          <CardTitle className="text-white">Identity Verification</CardTitle>
          <CardDescription>Complete your KYC to unlock payouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-purple-200">
            Get verified in minutes. Complete your identity verification to request payouts.
          </p>
          <Button
            onClick={() => setLocation("/kyc")}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          >
            Start KYC <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; message: string }> = {
    APPROVED: {
      color: "bg-green-500/20 border-green-500/30",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      message: "Your identity is verified. You can request payouts.",
    },
    PENDING: {
      color: "bg-yellow-500/20 border-yellow-500/30",
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      message: "Your documents are being reviewed. This usually takes 24-48 hours.",
    },
    UNDER_REVIEW: {
      color: "bg-yellow-500/20 border-yellow-500/30",
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      message: "Your documents are being reviewed. This usually takes 24-48 hours.",
    },
    REJECTED: {
      color: "bg-red-500/20 border-red-500/30",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      message: "Your submission was rejected. Please resubmit with correct documents.",
    },
    RESUBMISSION_REQUIRED: {
      color: "bg-orange-500/20 border-orange-500/30",
      icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
      message: "Please resubmit your documents with improvements.",
    },
    NOT_STARTED: {
      color: "bg-gray-500/20 border-gray-500/30",
      icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
      message: "Start your verification process now.",
    },
  };

  const config = statusConfig[profile.status];
  const progress = {
    NOT_STARTED: 0,
    PENDING: 75,
    UNDER_REVIEW: 75,
    APPROVED: 100,
    REJECTED: 25,
    RESUBMISSION_REQUIRED: 50,
  }[profile.status];

  return (
    <Card className="border-purple-500/30 bg-purple-950/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {config.icon}
          <span>Identity Verification</span>
        </CardTitle>
        <CardDescription>Status: {profile.status}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-300">Verification Progress</span>
            <span className="text-sm font-semibold text-white">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Alert className={`border ${config.color}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{config.message}</AlertDescription>
        </Alert>

        {profile.approvedAt && (
          <div className="bg-green-950/30 border border-green-500/30 rounded p-3">
            <p className="text-xs text-green-400">
              <strong>Approved:</strong> {new Date(profile.approvedAt).toLocaleDateString()}
            </p>
            {profile.expiresAt && (
              <p className="text-xs text-green-300 mt-1">
                <strong>Expires:</strong> {new Date(profile.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {profile.rejectionReason && (
          <div className="bg-red-950/30 border border-red-500/30 rounded p-3">
            <p className="text-xs text-red-400">
              <strong>Reason:</strong> {profile.rejectionReason}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {profile.status !== "APPROVED" && (
            <Button
              onClick={() => setLocation("/kyc")}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              {profile.status === "NOT_STARTED" ? "Start Verification" : "Review"}
            </Button>
          )}
          <Button variant="outline" className="flex-1 border-purple-500/30 text-purple-300" onClick={loadKYCStatus}>
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
