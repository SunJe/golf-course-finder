import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트 (추후 연동용).
 *
 * .env.local 에 아래 값을 채우면 활성화된다.
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * 키가 없으면 null 을 반환하므로, 데이터 레이어(lib/data.ts)에서
 * mock data로 안전하게 fallback 할 수 있다.
 *
 * 권장 `courses` 테이블 스키마(컬럼명은 snake_case):
 *   id text primary key,
 *   name text, region text, city text, address text,
 *   latitude double precision, longitude double precision,
 *   phone text, homepage_url text, booking_url text,
 *   hole_count int, course_type text,
 *   weekday_green_fee_min int, weekend_green_fee_min int,
 *   caddie_fee int, cart_fee int,
 *   night_round bool, no_caddie bool, two_player_allowed bool, resort bool,
 *   tags text[], image_url text, description text, updated_at timestamptz
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
