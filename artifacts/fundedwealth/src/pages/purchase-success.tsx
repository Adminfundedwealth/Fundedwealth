/**
 * Purchase Success Page
 * 
 * Displayed immediately after successful account provisioning.
 * Shows credentials, allows copying and PDF download.
 * Does NOT auto-redirect - user must explicitly navigate to dashboard.
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  ArrowRight,
  Shield,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { buildTerminalLaunchRequestBody } from "@/lib/terminalLaunchPayload";

type SuccessPageData = {
  id?: string;
  accountCode: string;
  loginEmail: string;
  tempPassword: string;
  server: string;
  challengeType: string;
  accountSize: number;
  planType: string;
  phase: string;
  orderId?: string;
};

function getQueryParam(search: string, key: string): string | null {
  const params = new URLSearchParams(search);
  return params.get(key);
}

export default function PurchaseSuccess() {
  const [, navigate] = useLocation();
  const { getToken, isLoaded } = useAuth();
  const search = window.location.search;

  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState<SuccessPageData | null>(null);
  const [resolvedAccountId, setResolvedAccountId] = useState<string | null>(getQueryParam(search, "accountId"));
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);

  const orderId = getQueryParam(search, "orderId");
  const accountId = getQueryParam(search, "accountId");

  // Fetch account details from the backend
  useEffect(() => {
    const fetchAccountData = async () => {
      if (!orderId && !accountId) {
        setError("Missing order or account ID");
        setLoading(false);
        return;
      }

      try {
        const apiBase = import.meta.env.VITE_API_URL || "https://api.fundedwealth.com";
        const token = isLoaded ? await getToken().catch(() => null) : null;

        // Fetch from orders API using orderId
        const endpoint = accountId
          ? `${apiBase}/api/accounts/${accountId}`
          : `${apiBase}/api/accounts/order/${orderId}`;

        const res = await fetch(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success && data.account) {
          const acc = data.account;
          const resolvedId = acc.id || acc.accountId || acc.tradingAccountId || acc.challengeAccountId || accountId || null;

          setResolvedAccountId(resolvedId);
          if (resolvedId && !accountId) {
            const nextParams = new URLSearchParams(window.location.search);
            nextParams.set("accountId", resolvedId);
            window.history.replaceState({}, "", `${window.location.pathname}?${nextParams.toString()}`);
          }
          
          setAccountData({
            id: resolvedId || undefined,
            accountCode: acc.accountCode || "N/A",
            loginEmail: acc.loginEmail || acc.email || "Check your email",
            tempPassword: acc.tempPassword || "Use 'Forgot Password' to reset",
            server: "FundedWealth Paper Trading",
            challengeType: acc.phase === "funded" ? "Funded Account" : 
                          acc.phase === "phase_2" ? "Phase 2" : "Phase 1",
            accountSize: acc.startBalance ?? acc.currentBalance ?? 0,
            planType: acc.planType || "challenge",
            phase: acc.phase || "phase_1",
            orderId: orderId || undefined,
          });
        } else {
          setError(data.message || "Failed to load account details");
        }
      } catch (err) {
        setError("Could not reach the server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [orderId, accountId, isLoaded, getToken]);

  const copyToClipboard = (field: string, value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadPDF = () => {
    if (!accountData) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FundedWealth", 20, 20);
    
    doc.setFontSize(16);
    doc.text("Trading Account Credentials", 20, 32);
    
    // Add line separator
    doc.setLineWidth(0.5);
    doc.line(20, 38, 190, 38);
    
    // Add credentials
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    let y = 50;
    const lineHeight = 10;
    
    const credentials = [
      { label: "Account Code", value: accountData.accountCode },
      { label: "Login Email", value: accountData.loginEmail },
      { label: "Temporary Password", value: accountData.tempPassword },
      { label: "Server", value: accountData.server },
      { label: "Challenge Type", value: accountData.challengeType },
      { label: "Account Size", value: `₹${accountData.accountSize.toLocaleString("en-IN")}` },
      { label: "Generated On", value: new Date().toLocaleString("en-IN") },
    ];
    
    credentials.forEach(({ label, value }) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 70, y);
      y += lineHeight;
    });
    
    // Add instructions
    y += 10;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Next Steps:", 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const instructions = [
      "1. Save this document securely",
      "2. Visit your dashboard at fundedwealth.com/dashboard",
      "3. Click 'Launch Terminal' on your account card",
      "4. Use your login email and temporary password",
      "5. Change your password after first login",
    ];
    
    instructions.forEach((instruction) => {
      doc.text(instruction, 25, y);
      y += 7;
    });
    
    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text("FundedWealth.com | support@fundedwealth.com", 20, 280);
    
    // Save the PDF
    doc.save(`FundedWealth_Credentials_${accountData.accountCode}.pdf`);
  };

  const handleLaunchTerminal = async () => {
    const launchAccountId = resolvedAccountId || accountId;
    if (!launchAccountId) {
      navigate("/dashboard/accounts");
      return;
    }

    setLaunching(true);
    try {
      const token = await getToken();
      const apiBase = import.meta.env.VITE_API_URL || "https://api.fundedwealth.com";
      const res = await fetch(`${apiBase}/api/terminal-launch`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        },
        credentials: "include",
        body: JSON.stringify(buildTerminalLaunchRequestBody({ ...accountData, accountId: launchAccountId })),
      });

      const data = await res.json().catch(() => ({}));
      
      if (res.ok && data.success && data.launchUrl) {
        window.location.href = data.launchUrl;
      } else {
        toast.error("Unable to launch terminal.");
      }
    } catch {
      toast.error("Unable to launch terminal.");
    } finally {
      setLaunching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0020] text-white flex items-center justify-center">
        <SEOHead title="Loading" noindex={true} />
        <div className="text-center">
          <Loader2 size={48} className="text-fw-pink animate-spin mx-auto mb-4" />
          <div className="text-white/60">Loading your account details...</div>
        </div>
      </div>
    );
  }

  if (error || !accountData) {
    return (
      <div className="min-h-screen bg-[#0D0020] text-white flex items-center justify-center px-4">
        <SEOHead title="Error" noindex={true} />
        <div className="max-w-md w-full text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <div className="text-red-400 text-lg font-bold mb-2">Could not load account</div>
            <div className="text-white/60 text-sm mb-6">{error}</div>
            <Button
              onClick={() => navigate("/dashboard/accounts")}
              className="bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Account Created Successfully — FundedWealth"
        description="Your trading account is ready"
        noindex={true}
      />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-4 border-emerald-400/40 flex items-center justify-center">
                <CheckCircle2 size={48} className="text-emerald-400" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles size={24} className="text-fw-orange animate-pulse" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-emerald-400 to-fw-pink bg-clip-text text-transparent">
            Challenge Purchased Successfully!
          </h1>
          <p className="text-white/60 text-lg">
            Your account is ready. Use these credentials to access the trading terminal.
          </p>
        </motion.div>

        {/* Credentials Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/15 rounded-3xl p-8 mb-6"
        >
          <div className="flex items-center gap-2 text-white/50 text-sm mb-6">
            <Shield size={16} className="text-fw-pink" />
            <span>Keep these credentials safe — you'll need them to login</span>
          </div>

          <div className="space-y-4">
            {/* Account Code */}
            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Account Code</div>
                  <div className="text-white text-xl font-bold font-mono">{accountData.accountCode}</div>
                </div>
                <Button
                  onClick={() => copyToClipboard("code", accountData.accountCode)}
                  variant="outline"
                  size="sm"
                  className={`shrink-0 ${
                    copiedField === "code"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "border-white/20 text-white/60 hover:text-white"
                  }`}
                >
                  <Copy size={14} className="mr-2" />
                  {copiedField === "code" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Login Email */}
            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Login Email</div>
                  <div className="text-white text-lg font-medium break-all">{accountData.loginEmail}</div>
                </div>
                <Button
                  onClick={() => copyToClipboard("email", accountData.loginEmail)}
                  variant="outline"
                  size="sm"
                  className={`shrink-0 ${
                    copiedField === "email"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "border-white/20 text-white/60 hover:text-white"
                  }`}
                >
                  <Copy size={14} className="mr-2" />
                  {copiedField === "email" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Temporary Password */}
            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Temporary Password</div>
                  <div className="text-white text-lg font-mono break-all">{accountData.tempPassword}</div>
                </div>
                <Button
                  onClick={() => copyToClipboard("password", accountData.tempPassword)}
                  variant="outline"
                  size="sm"
                  className={`shrink-0 ${
                    copiedField === "password"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "border-white/20 text-white/60 hover:text-white"
                  }`}
                >
                  <Copy size={14} className="mr-2" />
                  {copiedField === "password" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Server */}
            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Server</div>
                  <div className="text-white text-lg font-medium">{accountData.server}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Challenge Type</div>
              <div className="text-white font-bold">{accountData.challengeType}</div>
            </div>
            <div className="text-center">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Account Size</div>
              <div className="text-fw-orange font-bold text-lg">
                ₹{accountData.accountSize.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <Button
            onClick={() => copyToClipboard("all", 
              `Account Code: ${accountData.accountCode}\nEmail: ${accountData.loginEmail}\nPassword: ${accountData.tempPassword}`
            )}
            variant="outline"
            className="h-14 border-white/20 text-white hover:bg-white/10"
          >
            <Copy size={18} className="mr-2" />
            {copiedField === "all" ? "Copied All!" : "Copy All Credentials"}
          </Button>

          <Button
            onClick={downloadPDF}
            variant="outline"
            className="h-14 border-white/20 text-white hover:bg-white/10"
          >
            <Download size={18} className="mr-2" />
            Download PDF
          </Button>

          <Button
            onClick={handleLaunchTerminal}
            disabled={launching}
            className="h-14 bg-gradient-to-r from-fw-pink to-fw-orange text-white font-bold"
          >
            {launching ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                <ExternalLink size={18} className="mr-2" />
                Launch Terminal
              </>
            )}
          </Button>
        </motion.div>

        {/* Go to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            onClick={() => navigate("/dashboard/accounts")}
            variant="ghost"
            className="text-white/60 hover:text-white"
          >
            View All Accounts
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6"
        >
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-amber-300 font-bold mb-2">Important Security Notice</div>
              <ul className="text-white/60 text-sm space-y-1 list-disc list-inside">
                <li>Save these credentials securely — they won't be shown again</li>
                <li>Change your password after first login</li>
                <li>Never share your credentials with anyone</li>
                <li>FundedWealth staff will never ask for your password</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
