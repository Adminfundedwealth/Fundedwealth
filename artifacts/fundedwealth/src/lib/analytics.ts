const GA4_MEASUREMENT_ID = "G-2JC3K2H68Y";

export interface ChallengeItem {
  item_id: string;
  item_name: string;
  item_category: string;
  price: number;
  currency: "INR";
  index: number;
}

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

export function trackAnalyticsEvent(
  eventName: string,
  parameters: Record<string, unknown>,
): Promise<void> {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    window.gtag("event", eventName, {
      ...parameters,
      send_to: GA4_MEASUREMENT_ID,
      event_callback: finish,
      event_timeout: 1000,
    });
    window.setTimeout(finish, 350);
  });
}

export function trackViewItemList(listId: string, listName: string, items: ChallengeItem[]): Promise<void> {
  return trackAnalyticsEvent("view_item_list", { item_list_id: listId, item_list_name: listName, items });
}

export function trackViewItem(item: ChallengeItem): Promise<void> {
  return trackAnalyticsEvent("view_item", { currency: "INR", value: item.price, items: [{ ...item, quantity: 1 }] });
}

export function trackSelectItem(listId: string, listName: string, item: ChallengeItem): Promise<void> {
  return trackAnalyticsEvent("select_item", { item_list_id: listId, item_list_name: listName, items: [item] });
}

export function trackCtaClick(parameters: {
  cta_name: string;
  cta_location: string;
  cta_destination: string;
  challenge_id?: string;
  challenge_name?: string;
  challenge_type?: string;
}): Promise<void> {
  return trackAnalyticsEvent("cta_click", parameters);
}

export function trackBeginCheckout(item: ChallengeItem, value: number): Promise<void> {
  return trackAnalyticsEvent("begin_checkout", { currency: "INR", value, items: [{ ...item, quantity: 1 }] });
}

export function trackAddPaymentInfo(paymentType: string, item: ChallengeItem, value: number): Promise<void> {
  return trackAnalyticsEvent("add_payment_info", {
    currency: "INR",
    value,
    payment_type: paymentType,
    items: [{ ...item, quantity: 1 }],
  });
}

export function trackPaymentInitiated(paymentMethod: string, item: ChallengeItem, value: number): Promise<void> {
  return trackAnalyticsEvent("payment_initiated", {
    payment_method: paymentMethod,
    challenge_id: item.item_id,
    challenge_name: item.item_name,
    challenge_type: item.item_category,
    value,
    currency: "INR",
  });
}

export function trackPurchase(transactionId: string, item: ChallengeItem, value: number): Promise<void> {
  if (!transactionId) return Promise.resolve();
  return trackAnalyticsEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency: "INR",
    items: [{ ...item, quantity: 1 }],
  });
}

export { GA4_MEASUREMENT_ID };