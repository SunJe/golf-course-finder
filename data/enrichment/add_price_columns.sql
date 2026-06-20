-- Add reservation price columns to golf_courses
-- Run manually in Supabase SQL Editor. Do not auto-execute.
-- Source: course_enrichment_edit.csv (Naver reservation panel prices only)

alter table public.golf_courses
  add column if not exists price_text text,
  add column if not exists price_min integer,
  add column if not exists price_max integer,
  add column if not exists price_type text,
  add column if not exists price_source_url text,
  add column if not exists price_updated_at timestamptz;

comment on column public.golf_courses.price_text is 'Naver reservation price text (reference only)';
comment on column public.golf_courses.price_min is 'Minimum reservation price (KRW, integer)';
comment on column public.golf_courses.price_max is 'Maximum reservation price (KRW, integer)';
comment on column public.golf_courses.price_type is 'reservation_price | unknown | green_fee | ...';
comment on column public.golf_courses.price_source_url is 'Naver search/source URL for price';
comment on column public.golf_courses.price_updated_at is 'When price fields were last updated';
