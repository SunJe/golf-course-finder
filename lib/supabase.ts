import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase browser/server client (anon key only).
 *
 * .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * env가 없으면 null — courseRepository가 mock data로 fallback.
 * service_role key는 사용하지 않는다.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string);
  }
  return client;
}

/** @deprecated prefer getSupabaseClient() */
export const supabase: SupabaseClient | null = getSupabaseClient();
