-- Add SEO alias columns to golf_courses (safe to run multiple times).
-- Run in Supabase Dashboard → SQL Editor.

alter table public.golf_courses
  add column if not exists change_name_to text,
  add column if not exists seo_aliases text[],
  add column if not exists search_keywords text;

comment on column public.golf_courses.change_name_to is 'Alternative canonical/search name for a golf course, used for SEO and matching.';
comment on column public.golf_courses.seo_aliases is 'SEO and search aliases such as 더반CC, 더반GC, 더반컨트리클럽.';
comment on column public.golf_courses.search_keywords is 'Space-separated search keyword string generated from course aliases.';

-- Verification (expect 3 rows: change_name_to, seo_aliases, search_keywords)
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'golf_courses'
  and column_name in ('change_name_to', 'seo_aliases', 'search_keywords')
order by column_name;
