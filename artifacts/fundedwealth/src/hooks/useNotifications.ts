import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type NotificationPriority = "low" | "medium" | "high" | "critical";
export type NotificationDeliveryChannel = "in_app" | "email" | "whatsapp";

export interface NotificationPreferences {
  emailAlerts: boolean;
  whatsappAlerts: boolean;
  inAppAlerts: boolean;
  payoutAlerts: boolean;
  tradeAlerts: boolean;
  marketingAlerts: boolean;
}

export interface DashboardNotification {
  id: string | number;
  type: string;
  title: string;
  message: string;
  link?: string;
  actionUrl?: string;
  icon?: string;
  category?: string;
  priority?: NotificationPriority;
  deliveryChannels?: NotificationDeliveryChannel[];
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailAlerts: true,
  whatsappAlerts: false,
  inAppAlerts: true,
  payoutAlerts: true,
  tradeAlerts: true,
  marketingAlerts: false,
};

function parsePreferences(settings: unknown): NotificationPreferences {
  if (!settings || typeof settings !== "object") return DEFAULT_PREFERENCES;
  return {
    emailAlerts: Boolean((settings as any).emailAlerts ?? true),
    whatsappAlerts: Boolean((settings as any).whatsappAlerts ?? false),
    inAppAlerts: Boolean((settings as any).inAppAlerts ?? true),
    payoutAlerts: Boolean((settings as any).payoutAlerts ?? true),
    tradeAlerts: Boolean((settings as any).tradeAlerts ?? true),
    marketingAlerts: Boolean((settings as any).marketingAlerts ?? false),
  };
}

function parseNotificationItem(item: any): DashboardNotification {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    message: item.message,
    link: item.link ?? item.actionUrl,
    actionUrl: item.actionUrl ?? item.link,
    icon: item.icon,
    category: item.category,
    priority: item.priority as NotificationPriority,
    deliveryChannels: Array.isArray(item.deliveryChannels) ? item.deliveryChannels : typeof item.deliveryChannels === "string" ? item.deliveryChannels.split(",") as NotificationDeliveryChannel[] : undefined,
    metadata: item.metadata || undefined,
    isRead: Boolean(item.isRead),
    createdAt: item.createdAt,
    expiresAt: item.expiresAt,
  };
}

function playCriticalSound() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = 640;
    gain.gain.value = 0.12;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
    oscillator.onended = () => context.close();
  } catch {
    // Silent fallback for unsupported environments.
  }
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "offline">("connecting");
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/notifications?limit=20`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      const items = Array.isArray(data.notifications) ? data.notifications.map(parseNotificationItem) : [];
      setNotifications(items);
      setUnreadCount(Number(data.unreadCount ?? 0));
      setError(null);
    } catch (err) {
      setError("Unable to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchPreferences = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/notifications/preferences`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setPreferences(parsePreferences(data.preferences));
    } catch {
      // ignore
    }
  }, [userId]);

  const markAsRead = useCallback(async (id: string | number) => {
    await fetch(`${import.meta.env.BASE_URL}api/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    });
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
    setUnreadCount((count) => Math.max(0, count - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await fetch(`${import.meta.env.BASE_URL}api/notifications/read-all`, {
      method: "PATCH",
      credentials: "include",
    });
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (id: string | number) => {
    await fetch(`${import.meta.env.BASE_URL}api/notifications/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const updatePreferences = useCallback(async (nextPreferences: Partial<NotificationPreferences>) => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/notifications/preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nextPreferences),
      });
      if (!res.ok) throw new Error("Preferences update failed");
      const data = await res.json();
      setPreferences(parsePreferences(data.preferences));
    } catch {
      setError("Unable to update notification settings.");
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    fetchPreferences();
  }, [userId, fetchNotifications, fetchPreferences]);

  useEffect(() => {
    if (!userId || !supabase) {
      setRealtimeStatus("offline");
      return;
    }

    setRealtimeStatus("connecting");
    const channel = supabase.channel(`notifications_clerk_${userId}`)
      .on("broadcast", { event: "new_notification" }, (payload) => {
        const next = parseNotificationItem(payload.payload);
        setNotifications((current) => [next, ...current].slice(0, 50));
        setUnreadCount((count) => count + 1);
        if (next.priority === "critical" || next.priority === "high") {
          playCriticalSound();
        }
      });

    // subscribe() returns a RealtimeChannel, NOT a Promise — never call .then() on it
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setRealtimeStatus("connected");
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        setRealtimeStatus("offline");
      }
    });

    return () => {
      try { supabase.removeChannel(channel); } catch { /* ignore cleanup errors */ }
    };
  }, [userId]);

  useEffect(() => {
    if (realtimeStatus === "connected") return;
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [realtimeStatus, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    realtimeStatus,
    preferences,
    error,
    markAsRead,
    markAllRead,
    deleteNotification,
    updatePreferences,
  };
}
