import { lazy, Suspense } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useLocation } from "wouter";
import KYCFlow from "@/components/kyc/KYCFlow";
import { Spinner } from "@/components/ui/spinner";
import SEOHead from "@/components/SEOHead";

export default function KYCPage() {
  const { userId, isLoaded } = useAuth();
  const [, setLocation] = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-black">
        <Spinner />
      </div>
    );
  }

  if (!userId) {
    setLocation("/sign-in");
    return null;
  }

  return (
    <>
      <SEOHead
        title="KYC Verification"
        description="Complete your identity verification to unlock payouts on FundedWealth."
        noindex={true}
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-black">
            <Spinner />
          </div>
        }
      >
        <KYCFlow />
      </Suspense>
    </>
  );
}
