import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState, Suspense } from "react";
import { SupabaseAuthProvider, useAuth } from "@/contexts/SupabaseAuthContext";
import { FingerprintProvider } from "@/contexts/FingerprintContext";
import { TradingDataProvider } from "@/contexts/TradingDataContext";
import { lazyWithRetry } from "@/lib/lazy-with-retry";

const NotFound = lazyWithRetry(() => import("@/pages/not-found"));
const Home = lazyWithRetry(() => import("@/pages/home"));
const Championship = lazyWithRetry(() => import("@/pages/championship"));
const Mission = lazyWithRetry(() => import("@/pages/mission"));
const About = lazyWithRetry(() => import("@/pages/about"));
const ImpactPage = lazyWithRetry(() => import("@/pages/impact"));
const SignInPage = lazyWithRetry(() => import("@/pages/sign-in"));
const SignUpPage = lazyWithRetry(() => import("@/pages/sign-up"));
const Dashboard = lazyWithRetry(() => import("@/pages/dashboard"));
const EconomicCalendar = lazyWithRetry(() => import("@/pages/economic-calendar"));
const Leaderboard = lazyWithRetry(() => import("@/pages/leaderboard"));
const Scaling = lazyWithRetry(() => import("@/pages/scaling"));
const Payouts = lazyWithRetry(() => import("@/pages/payouts"));
const Blog = lazyWithRetry(() => import("@/pages/blog"));
const BlogArticle = lazyWithRetry(() => import("@/pages/blog-article"));
const Rules = lazyWithRetry(() => import("@/pages/rules"));
const FAQ = lazyWithRetry(() => import("@/pages/faq"));
const SuccessStories = lazyWithRetry(() => import("@/pages/success-stories"));
const Community = lazyWithRetry(() => import("@/pages/community"));
const Terms = lazyWithRetry(() => import("@/pages/terms"));
const Privacy = lazyWithRetry(() => import("@/pages/privacy"));
const Refund = lazyWithRetry(() => import("@/pages/refund"));
const AmlKyc = lazyWithRetry(() => import("@/pages/aml-kyc"));
const RiskDisclosure = lazyWithRetry(() => import("@/pages/risk-disclosure"));
const AcceptableUse = lazyWithRetry(() => import("@/pages/acceptable-use"));
const CookiePolicy = lazyWithRetry(() => import("@/pages/cookie-policy"));
const AffiliateTerms = lazyWithRetry(() => import("@/pages/affiliate-terms"));
const Checkout = lazyWithRetry(() => import("@/pages/checkout"));
const ReferralLandingPage = lazyWithRetry(() => import("@/pages/referral"));
const PaymentPending = lazyWithRetry(() => import("@/pages/payment-pending"));
const PurchaseSuccess = lazyWithRetry(() => import("@/pages/purchase-success"));
const KYC = lazyWithRetry(() => import("@/pages/kyc"));
const SSOCallback = lazyWithRetry(() => import("@/pages/sso-callback"));
const AuthCallback = lazyWithRetry(() => import("@/pages/auth-callback"));
const CreatePassword = lazyWithRetry(() => import("@/pages/create-password"));
const ResetPassword = lazyWithRetry(() => import("@/pages/reset-password"));
const ChatWidget = lazyWithRetry(() => import("@/components/ChatWidget"));
const WhatsAppButton = lazyWithRetry(() => import("@/components/WhatsAppButton"));
const SocialMediaRail = lazyWithRetry(() => import("@/components/SocialMediaRail"));
import { OrganizationSchema, WebsiteSchema } from "@/components/StructuredData";
import MobileShell from "@/components/MobileShell";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function DashboardRoute() {
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const [, navigate] = useLocation();
    const [onboardingReady, setOnboardingReady] = useState<boolean | null>(null);

    // Read optional section from URL path e.g. /dashboard/accounts
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.replace(basePath, "").split("/").filter(Boolean);
    const initialSection = pathSegments[1] || "home"; // /dashboard/accounts → "accounts"

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            // Preserve the intended destination so after sign-in they land back here
            const dest = window.location.pathname + window.location.search;
            window.location.href = `${basePath}/sign-in?redirect=${encodeURIComponent(dest)}`;
            return;
        }
        setOnboardingReady(true);
    }, [isLoaded, isSignedIn]);

    if (!isLoaded || onboardingReady === null) {
        return (
            <div className="min-h-screen bg-[#0D0020] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#4A00E0] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (!isSignedIn || !onboardingReady) return null;

    return <Dashboard initialSection={initialSection} />;
}

function AppRouter() {
    return (
        <Switch>
            <Route path="/" component={Home} />
            <Route path="/championship" component={Championship} />
            <Route path="/impact" component={ImpactPage} />
            <Route path="/mission" component={Mission} />
            <Route path="/about" component={About} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/scaling" component={Scaling} />
            <Route path="/payouts" component={Payouts} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogArticle} />
            <Route path="/rules" component={Rules} />
            <Route path="/faq" component={FAQ} />
            <Route path="/kyc" component={KYC} />
            <Route path="/success-stories" component={SuccessStories} />
            <Route path="/community" component={Community} />
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/refund" component={Refund} />
            <Route path="/aml-kyc" component={AmlKyc} />
            <Route path="/risk-disclosure" component={RiskDisclosure} />
            <Route path="/acceptable-use" component={AcceptableUse} />
            <Route path="/cookie-policy" component={CookiePolicy} />
            <Route path="/affiliate-terms" component={AffiliateTerms} />
            <Route path="/ref/:code" component={ReferralLandingPage} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/payment-pending" component={PaymentPending} />
            <Route path="/purchase-success" component={PurchaseSuccess} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/sso-callback" component={SSOCallback} />
            <Route path="/auth/callback" component={AuthCallback} />
            <Route path="/auth/create-password" component={CreatePassword} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/economic-calendar" component={EconomicCalendar} />
            <Route path="/login">{() => { window.location.replace(basePath + "/sign-in"); return null; }}</Route>
            <Route path="/register">{() => { window.location.replace(basePath + "/sign-up"); return null; }}</Route>
            <Route path="/dashboard" component={DashboardRoute} />
            <Route path="/dashboard/:section" component={DashboardRoute} />
            <Route path="/terminal-error">{() => {
                const params = new URLSearchParams(window.location.search);
                const reason = params.get("reason") || "An error occurred launching the terminal.";
                return (
                    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
                        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "40px", maxWidth: "480px", width: "100%", textAlign: "center" }}>
                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
                            <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: "700", marginBottom: "12px" }}>Terminal Launch Failed</h1>
                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>{reason}</p>
                            <a href="/dashboard" style={{ display: "inline-block", background: "linear-gradient(90deg,#4A00E0,#D63384)", color: "#fff", fontWeight: "700", padding: "12px 32px", borderRadius: "12px", textDecoration: "none", fontSize: "14px" }}>
                                ← Back to Dashboard
                            </a>
                        </div>
                    </div>
                );
            }}</Route>
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <WouterRouter base={basePath}>
            <SupabaseAuthProvider>
                <FingerprintProvider>
                    <TradingDataProvider>
                        <QueryClientProvider client={queryClient}>
                            <TooltipProvider>
                                <OrganizationSchema />
                                <WebsiteSchema />
                                <Suspense fallback={
                    <div className="min-h-screen bg-[#0D0020] flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#4A00E0] border-t-transparent rounded-full animate-spin" />
                    </div>
                }>
                                    <MobileShell>
                                        <AppRouter />
                                        <ChatWidget />
                                        <WhatsAppButton />
                                        <SocialMediaRail />
                                    </MobileShell>
                                </Suspense>
                                <Toaster />
                            </TooltipProvider>
                        </QueryClientProvider>
                    </TradingDataProvider>
                </FingerprintProvider>
            </SupabaseAuthProvider>
        </WouterRouter>
    );
}

export default App;
