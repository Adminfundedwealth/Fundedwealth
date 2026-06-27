import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Home, CalendarDays, Users, Download, Bell } from "lucide-react";
import usePushNotifications from "@/hooks/usePushNotifications";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

const MOBILE_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", Icon: Home },
  { id: "calendar", label: "Calendar", href: "/economic-calendar", Icon: CalendarDays },
  { id: "community", label: "Community", href: "/community", Icon: Users },
] as const;

function isActive(location: string, href: string) {
  return location === href || (href !== "/" && location.startsWith(href));
}

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const { supported, permission, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setPromptVisible(true);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setPromptVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installLabel = installed ? "Installed" : "Install app";
  const promptClass = promptVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none";

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      {children}
      {/* Hide install prompt and bottom nav on dashboard (dashboard has its own nav) */}
      {!location.startsWith("/dashboard") && (
        <>
      <div className={`fixed inset-x-4 bottom-24 z-40 rounded-3xl border border-white/10 bg-[#08000F]/95 py-3 px-4 shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 ${promptClass} lg:hidden`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Install FundedWealth</p>
            <p className="text-xs text-white/60">Open faster, stay online with saved data, and launch from your home screen.</p>
          </div>
          <button
            onClick={async () => {
              if (!installPrompt) return;
              setPromptVisible(false);
              installPrompt.prompt();
              const choice = await installPrompt.userChoice;
              if (choice.outcome === "accepted") setInstalled(true);
              setInstallPrompt(null);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-fw-purple px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-fw-purple/15"
          >
            <Download size={14} /> {installLabel}
          </button>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#08000F]/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active = isActive(location, item.href);
            const Icon = item.Icon;
            return (
              <button
                key={item.id}
                onClick={() => setLocation(item.href)}
                className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${active ? "text-white" : "text-white/50 hover:text-white"}`}
                aria-label={item.label}
              >
                <span className={`rounded-full p-2 ${active ? "bg-fw-purple/15 text-fw-purple" : "bg-white/5 text-white/60"}`}>
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
        </>
      )}

      {/* Push notifications enable button (mobile) */}
      {supported && !location.startsWith("/dashboard") && (
        <div className="fixed right-4 bottom-32 z-50 lg:hidden">
          <button
            onClick={async () => {
              try {
                if (isSubscribed) {
                  await unsubscribe();
                } else {
                  await subscribe();
                }
              } catch (e) {
                // ignore failures silently for now
              }
            }}
            className={`rounded-full p-3 shadow-lg ${isSubscribed ? "bg-green-600 text-white" : "bg-white/5 text-white/80"}`}
            aria-label="Enable notifications"
            title={isSubscribed ? "Disable notifications" : "Enable notifications"}
          >
            <Bell size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
