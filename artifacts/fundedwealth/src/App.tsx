import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState, lazy, Suspense, Component, type ReactNode } from "react";
import { SupabaseAuthProvider, useAuth } from "@/contexts/SupabaseAuthContext";
import { FingerprintProvider } from "@/contexts/FingerprintContext";
import { TradingDataProvider } from "@/contexts/TradingDataContext";

const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const Championship = lazy(() => import("@/pages/championship"));
const Mission = lazy(() => import("@/pages/mission"));
const About = lazy(() => import("@/pages/about"));
const ImpactPage = lazy(() => import("@/pages/impact"));
const SignInPage = lazy(() => import("@/pages/sign-in"));
const SignUpPage = lazy(() => import("@/pages/sign-up"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const EconomicCalendar = lazy(() => import("@/pages/economic-calendar"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));
const Scaling = lazy(() => import("@/pages/scaling"));
const Payouts = lazy(() => import("@/pages/payouts"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogArticle = lazy(() => import("@/pages/blog-article"));
const Rules = lazy(() => import("@/pages/rules"));
const FAQ = lazy(() => import("@/pages/faq"));
const SuccessStories = lazy(() => import("@/pages/success-stories"));
const Community = lazy(() => import("@/pages/community"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Refund = lazy(() => import("@/pages/refund"));
const Checkout = lazy(() => import("@/pages/checkout"));
const ReferralLandingPage = lazy(() => import("@/pages/referral"));
const PaymentPending = lazy(() => import("@/pages/payment-pending"));
const KYC = lazy(() => import("@/pages/kyc"));
const SSOCallback = lazy(() => import("@/pages/sso-callback"));
const AuthCallback = lazy(() => import("@/pages/auth-callback"));
const CreatePassword = lazy(() => import("@/pages/create-password"));
const ChatWidget = lazy(() => import("@/components/ChatWidget"));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton"));
import { OrganizationSchema, WebsiteSchema } from "@/components/StructuredData";
import MobileShell from "@/components/MobileShell";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function DashboardRoute() {
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const [, navigate] = useLocation();
    const [onboardingReady, setOnboardingReady] = useState<boolean | null>(null);

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) { navigate("/sign-in"); return; }

        // Check if the user still needs to set their password
        getToken().then((tok) => {
            if (!tok) { setOnboardingReady(true); return; }
            const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
            fetch(`${apiUrl}/api/auth/onboarding-status`, {
                headers: { Authorization: `Bearer ${tok}` },
            })
                .then((r) => r.json())
                .then((d) => {
                    if (!d.onboardingCompleted) {
                        navigate("/auth/create-password", { replace: true });
                    } else {
                        setOnboardingReady(true);
                    }
                })
                .catch(() => setOnboardingReady(true));
        });
    }, [isLoaded, isSignedIn, navigate, getToken]);

    if (!isLoaded || onboardingReady === null) {
        return (
            <div className="min-h-screen bg-[#0D0020] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#4A00E0] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (!isSignedIn || !onboardingReady) return null;

    return <Dashboard />;
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
            <Route path="/ref/:code" component={ReferralLandingPage} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/payment-pending" component={PaymentPending} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/sso-callback" component={SSOCallback} />
            <Route path="/auth/callback" component={AuthCallback} />
            <Route path="/auth/create-password" component={CreatePassword} />
            <Route path="/economic-calendar" component={EconomicCalendar} />
            <Route path="/login">{() => { window.location.replace(basePath + "/sign-in"); return null; }}</Route>
            <Route path="/register">{() => { window.location.replace(basePath + "/sign-up"); return null; }}</Route>
            <Route path="/dashboard" component={DashboardRoute} />
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
                                <Suspense fallback={<div className="min-h-screen bg-[#0D0020] flex items-center justify-center text-white">Loading...</div>}>
                                    <MobileShell>
                                        <AppRouter />
                                        <ChatWidget />
                                        <WhatsAppButton />
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
