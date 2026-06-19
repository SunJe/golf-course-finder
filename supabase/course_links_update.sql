-- GolfMap Korea — course link enrichment updates
-- Generated: 2026-06-19T05:54:18.012Z
-- Source CSV: data/enrichment/course_links.csv
-- Regenerate: npm run generate:course-links-sql
--
-- Run manually in Supabase SQL Editor (do not use service_role in scripts).
-- Only non-empty homepage_url / booking_url / phone columns are updated.
--
-- 인천그랜드컨트리클럽
-- source: https://search.naver.com/search.naver?where=nexearch&query=%EC%9D%B8%EC%B2%9C%EA%B7%B8%EB%9E%9C%EB%93%9C%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD
-- note: 예시 행 — URL/전화 입력 후 npm run generate:course-links-sql 실행
update public.golf_courses
set
  homepage_url = 'http://www.incheongrand.cc/',
  phone = '032-584-3111',
  updated_at = now()
where id = 'gc-60319bf1693c';
