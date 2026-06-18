-- Enable read-only public access for golf_courses (anon key / browser fetch)
-- Run in Supabase SQL Editor after schema + CSV import.
-- Do NOT use service_role key in the Next.js app.

alter table public.golf_courses enable row level security;

drop policy if exists "Public read golf_courses" on public.golf_courses;

create policy "Public read golf_courses"
  on public.golf_courses
  for select
  to anon, authenticated
  using (true);

-- Quick verify (should return 532):
-- select count(*) from public.golf_courses;
