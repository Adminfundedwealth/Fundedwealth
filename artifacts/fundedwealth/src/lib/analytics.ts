const GA4_MEASUREMENT_ID = "G-2JC3K2H68Y";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let lastTrackedKey: string | null = null;

function resolvePath(path: string): string {
  const normalized = path || "/";
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;

  const currentUrl = window.location.href;
  const key = `${currentUrl}`;

  if (lastTrackedKey === key) return;
  lastTrackedKey = key;

  if (typeof window.gtag !== "function") return;

  const pagePath = resolvePath(window.location.pathname + window.location.search + window.location.hash || "/");

  window.gtag("event", "page_view", {
    page_title: document.title,
    page_location: currentUrl,
    page_path: pagePath,
    send_to: GA4_MEASUREMENT_ID,
  });
}

export { GA4_MEASUREMENT_ID };