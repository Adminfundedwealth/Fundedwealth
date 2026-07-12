import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ws is optionalDependency — provides WebSocket on Node < 22
let ws: any;
try { ws = require("ws"); } catch { ws = undefined; }

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin: SupabaseClient | null = (supabaseUrl && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
      ...(ws ? { realtime: { transport: ws } } : {}),
    })
  : null;

export const isSupabaseEnabled = (): boolean => Boolean(supabaseAdmin);

export async function broadcastNotificationToUser(userClerkId: string, payload: unknown) {
  if (!supabaseAdmin || !userClerkId) return;

  const channel = supabaseAdmin.channel(`notifications_clerk_${userClerkId}`);
  try {
    await channel.send({ type: "broadcast", event: "new_notification", payload });
  } catch (error) {
    console.warn("[SUPABASE] broadcastNotificationToUser failed", error);
  }
}

export async function broadcastPayoutUpdateToUser(userClerkId: string, payload: unknown) {
  if (!supabaseAdmin || !userClerkId) return;

  const channel = supabaseAdmin.channel(`payouts_clerk_${userClerkId}`);
  try {
    await channel.send({ type: "broadcast", event: "payout_update", payload });
  } catch (error) {
    console.warn("[SUPABASE] broadcastPayoutUpdateToUser failed", error);
  }
}

// Recommended Supabase RLS policy for the notifications table:
// alter table public.notifications enable row level security;
// create policy "Allow select/insert for owner" on public.notifications
//   for select using (user_id = auth.uid())
//   for insert with check (user_id = auth.uid());
// create policy "Allow service role insert" on public.notifications
//   for insert with check (auth.role() = 'service_role');
