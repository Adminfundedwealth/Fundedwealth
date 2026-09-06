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
    ga4ClientId?: string;
  }
}

let lastTrackedKey: string | null = null;

function resolvePath(path: string): string {
  const normalized = path || "/";
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function getClientId(): string {
  if (typeof window === "undefined") return "server";
  if (window.ga4ClientId) return window.ga4ClientId;

  const storageKey = "fw_ga4_client_id";
  let clientId = "";
  try {
    clientId = window.localStorage.getItem(storageKey) || "";
  } catch {
    clientId = "";
  }
  if (!clientId) {
    clientId = `${Date.now()}.${Math.floor(Math.random() * 1_000_000_000)}`;
    try {
      window.localStorage.setItem(storageKey, clientId);
    } catch {
      // Collection still works for this page when storage is unavailable.
    }
  }
  window.ga4ClientId = clientId;
  return clientId;
}

function serializeItem(item: ChallengeItem, quantity?: number): string {
  const values = [
    `id${item.item_id}`,
    `nm${item.item_name}`,
    `ca${item.item_category}`,
    `pr${item.price}`,
    `k0currency`,
    `v0${item.currency}`,
    `lp${item.index}`,
  ];
  if (quantity !== undefined) values.push(`qt${quantity}`);
  return values.join("~");
}

function sendGa4Event(eventName: string, parameters: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;

  const payload = new URLSearchParams({
    v: "2",
    tid: GA4_MEASUREMENT_ID,
    cid: getClientId(),
    en: eventName,
    dl: window.location.href,
    dp: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    dt: document.title,
  });

  for (const [key, value] of Object.entries(parameters)) {
    if (key === "items" && Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item && typeof item === "object") {
          payload.set(`pr${index + 1}`, serializeItem(item as ChallengeItem, eventName === "view_item" ? 1 : undefined));
        }
      });
      continue;
    }
    if (key === "currency") {
      payload.set("cu", String(value));
    } else if (typeof value === "number") {
      payload.set(`epn.${key}`, String(value));
    } else if (typeof value === "string" || typeof value === "boolean") {
      payload.set(`ep.${key}`, String(value));
    }
  }

  const body = new Blob([payload.toString()], { type: "application/x-www-form-urlencoded;charset=UTF-8" });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("https://www.google-analytics.com/g/collect", body);
  } else {
    void fetch("https://www.google-analytics.com/g/collect", {
      method: "POST",
      body,
      keepalive: true,
      mode: "no-cors",
    });
  }
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;

  const currentUrl = window.location.href;
  const key = `${currentUrl}`;

  if (lastTrackedKey === key) return;
  lastTrackedKey = key;

  const pagePath = resolvePath(window.location.pathname + window.location.search + window.location.hash || "/");

  sendGa4Event("page_view", {
    page_title: document.title,
    page_location: currentUrl,
    page_path: pagePath,
  });
}

export function trackAnalyticsEvent(
  eventName: string,
  parameters: Record<string, unknown>,
): Promise<void> {
  sendGa4Event(eventName, parameters);
  return Promise.resolve();
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
  if (typeof window === "undefined") return Promise.resolve();
  const key = `fw_begin_checkout:${item.item_id}:${value}`;
  try {
    if (window.sessionStorage.getItem(key) === "1") return Promise.resolve();
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Continue collection when session storage is unavailable.
  }
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

export { GA4_MEASUREMENT_ID };