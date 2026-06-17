-- GolfMap Korea — golf_courses table schema
-- Run in Supabase SQL editor or via supabase db push

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

comment on table public.golf_courses is '전국 골프장 기본 정보';
comment on column public.golf_courses.source is 'mock | public_data | manual | naver | kakao';
