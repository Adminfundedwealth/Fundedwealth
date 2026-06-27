import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const VAPID_KEY = (import.meta.env as any).VITE_VAPID_PUBLIC_KEY as string | undefined;

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window);
    setPermission(typeof Notification !== "undefined" ? Notification.permission : "default");
    (async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(Boolean(sub));
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  async function subscribe() {
    if (!supported) throw new Error("Push not supported in this browser");
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") throw new Error("Permission denied");
    const reg = await navigator.serviceWorker.ready;
    const options: PushSubscriptionOptionsInit = { userVisibleOnly: true };
    if (VAPID_KEY) options.applicationServerKey = urlBase64ToUint8Array(VAPID_KEY);
    const sub = await reg.pushManager.subscribe(options as any);

    // Send subscription to server for storage
    try {
      await fetch(`${import.meta.env.BASE_URL}api/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(sub),
      });
    } catch (e) {
      // ignore server errors for now
    }

    setIsSubscribed(true);
    return sub;
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch(`${import.meta.env.BASE_URL}api/push/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => {});
      await sub.unsubscribe();
    }
    setIsSubscribed(false);
  }

  return { supported, permission, isSubscribed, subscribe, unsubscribe } as const;
}

export default usePushNotifications;
