import type { CourseSource, CourseType } from "@/types/course";

/** Supabase `golf_courses` 테이블 row (snake_case) */
export interface GolfCourseRow {
  id: string;
  name: string;
  region: string;
  city: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  homepage_url: string | null;
  booking_url: string | null;
  hole_count: number | null;
  course_type: CourseType | string | null;
  weekday_green_fee_min: number | null;
  weekend_green_fee_min: number | null;
  caddie_fee: number | null;
  cart_fee: number | null;
  night_round: boolean | null;
  no_caddie: boolean | null;
  two_player_allowed: boolean | null;
  resort: boolean | null;
  tags: string[] | null;
  image_url: string | null;
  description: string | null;
  business_status: string | null;
  source: CourseSource | string | null;
  updated_at: string | null;
  created_at?: string | null;
  price_text: string | null;
  price_min: number | null;
  price_max: number | null;
  price_type: string | null;
  price_source_url: string | null;
  price_updated_at: string | null;
  difficulty: string | null;
}
