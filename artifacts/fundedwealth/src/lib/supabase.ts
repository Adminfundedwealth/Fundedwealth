import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or anon key missing. Auth and realtime features will not work.");
}

/** Site URL for redirects — defaults to current origin for local dev */
export const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  }
);

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);
