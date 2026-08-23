-- GolfMap Korea — course link enrichment updates
-- Generated: 2026-08-23T11:34:26.318Z
-- Source CSV: data/enrichment/course_links.csv
-- Regenerate: npm run generate:course-links-sql
--
-- Run manually in Supabase SQL Editor (do not use service_role in scripts).
-- Only non-empty homepage_url / booking_url / phone columns are updated.
--
-- 포천아도니스 대중골프장
-- source: https://www.adoniscc.co.kr/public
-- note: 공식 퍼블릭 연락처 및 예약 경로 확인
update public.golf_courses
set
  homepage_url = 'https://www.adoniscc.co.kr/public',
  booking_url = 'https://www.adoniscc.co.kr/public/booking',
  phone = '031-530-9140',
  updated_at = now()
where id = 'gc-e2614722e86e';

-- 인천그랜드컨트리클럽
-- source: https://search.naver.com/search.naver?where=nexearch&query=%EC%9D%B8%EC%B2%9C%EA%B7%B8%EB%9E%9C%EB%93%9C%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD
-- note: 예시 행 — URL/전화 입력 후 npm run generate:course-links-sql 실행
update public.golf_courses
set
  homepage_url = 'http://www.incheongrand.cc/',
  phone = '032-584-3111',
  updated_at = now()
where id = 'gc-60319bf1693c';

-- 가야컨트리클럽 (대중제)
-- source: https://www.gayacc.com/sub.php?MenuID=9
-- note: 공식 퍼블릭 9H 및 인제로 502 확인
update public.golf_courses
set
  homepage_url = 'https://www.gayacc.com/main_new.php',
  booking_url = 'https://www.gayacc.com/reserve.php?location=04',
  phone = '055-337-0091',
  updated_at = now()
where id = 'gc-9bd0f98bfdee';
