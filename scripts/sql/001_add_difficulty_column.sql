-- Add difficulty column to golf_courses (safe, idempotent)
-- Run once in Supabase SQL Editor before update_difficulty_from_enrichment.sql

alter table public.golf_courses
add column if not exists difficulty text;

comment on column public.golf_courses.difficulty is
  'Course difficulty reference (text; Naver 0-10 scale or labeled values from enrichment CSV)';
