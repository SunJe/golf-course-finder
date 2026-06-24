-- Add SEO alias columns to existing golf_courses tables.
-- Safe to run multiple times (IF NOT EXISTS).

alter table public.golf_courses
  add column if not exists change_name_to text,
  add column if not exists seo_aliases text[] not null default '{}',
  add column if not exists search_keywords text;

create index if not exists idx_golf_courses_seo_aliases
  on public.golf_courses using gin (seo_aliases);

comment on column public.golf_courses.change_name_to is 'enrichment 검색 대표명 (표시 name과 다를 때)';
comment on column public.golf_courses.seo_aliases is 'CC/GC/컨트리클럽 등 검색·SEO 별칭';
comment on column public.golf_courses.search_keywords is '내부 검색·메타용 별칭 공백 구분 문자열';
