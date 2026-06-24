-- GolfMap Korea — golf_courses table schema
-- Run in Supabase SQL editor or via supabase db push
--
-- CSV import source: data/golf_courses_import_geocoded_final.csv (532 rows)
-- Column order matches CSV header exactly (27 columns).
-- tags: CSV uses "{}" for empty text[] — valid PostgreSQL array literal.
-- booleans: CSV uses "true" / "false" strings — map on import or use SQL COPY.
-- See supabase/IMPORT_GUIDE.md and supabase/verify_import.sql

create table if not exists public.golf_courses (
  id text primary key,
  name text not null,
  region text not null,
  city text,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  phone text,
  homepage_url text,
  booking_url text,
  hole_count integer,
  course_type text,
  weekday_green_fee_min integer,
  weekend_green_fee_min integer,
  caddie_fee integer,
  cart_fee integer,
  night_round boolean not null default false,
  no_caddie boolean not null default false,
  two_player_allowed boolean not null default false,
  resort boolean not null default false,
  tags text[] not null default '{}',
  image_url text,
  description text,
  business_status text,
  source text not null default 'manual',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  price_text text,
  price_min integer,
  price_max integer,
  price_type text,
  price_source_url text,
  price_updated_at timestamptz,
  difficulty text,
  change_name_to text,
  seo_aliases text[] not null default '{}',
  search_keywords text,

  constraint golf_courses_latitude_check
    check (latitude >= -90 and latitude <= 90),
  constraint golf_courses_longitude_check
    check (longitude >= -180 and longitude <= 180)
);

create index if not exists idx_golf_courses_name on public.golf_courses (name);
create index if not exists idx_golf_courses_region on public.golf_courses (region);
create index if not exists idx_golf_courses_city on public.golf_courses (city);
create index if not exists idx_golf_courses_course_type on public.golf_courses (course_type);
create index if not exists idx_golf_courses_hole_count on public.golf_courses (hole_count);
create index if not exists idx_golf_courses_lat_lng on public.golf_courses (latitude, longitude);
create index if not exists idx_golf_courses_tags on public.golf_courses using gin (tags);
create index if not exists idx_golf_courses_seo_aliases on public.golf_courses using gin (seo_aliases);

comment on table public.golf_courses is '전국 골프장 기본 정보';
comment on column public.golf_courses.source is 'mock | public_data | manual | naver | kakao';
comment on column public.golf_courses.change_name_to is 'enrichment 검색 대표명 (표시 name과 다를 때)';
comment on column public.golf_courses.seo_aliases is 'CC/GC/컨트리클럽 등 검색·SEO 별칭';
comment on column public.golf_courses.search_keywords is '내부 검색·메타용 별칭 공백 구분 문자열';
