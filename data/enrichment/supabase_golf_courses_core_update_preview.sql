-- Safe core update SQL (preview, first 20 rows)
-- Generated: 2026-06-20T11:59:42.500Z
-- Source: data/enrichment/course_enrichment_edit.csv
-- Table: public.golf_courses
-- Columns: name, address, phone, homepage_url, updated_at
-- Excluded: price, difficulty, avg_score, tags, course_type, latitude, longitude
-- Policy: name always updated; address/phone/homepage_url only when CSV value is non-empty
-- Run manually in Supabase SQL Editor. Do not auto-execute.

UPDATE public.golf_courses
SET
  name = v.name,
  address = COALESCE(NULLIF(v.address, ''), public.golf_courses.address),
  phone = COALESCE(NULLIF(v.phone, ''), public.golf_courses.phone),
  homepage_url = COALESCE(NULLIF(v.homepage_url, ''), public.golf_courses.homepage_url),
  updated_at = NOW()
FROM (
  VALUES
  ('gc-9b37cfc9caa8', '뉴스프링빌CC', '경기도 이천시 모가면 사실로 527번길 158', '031-630-7500', 'http://www.newspringvillecc.co.kr/'),
  ('gc-1f14d0ca89b4', '가산CC', '경상북도 칠곡군 가산면 학하2길 54-171', '054-970-3712', 'https://www.gasancc.com'),
  ('gc-a862e6d054f2', '빅토리아GC', '경기도 여주시 가남읍 송삼로 191', '031-883-0111', 'http://www.victoriagc.co.kr/'),
  ('gc-15dd2e00d6c7', '군위오펠GC', '대구광역시 군위군 산성면 부흥로 227', '054-380-8000', 'https://www.ophelgc.com/'),
  ('gc-9a7cb8103191', '오크밸리CC', '원주시 지정면 오크밸리1길 66', '1588-7676', 'https://ipark-golf.com/oakvalley/course'),
  ('gc-7b4833dc4475', '월송리CC', '원주시 지정면 오크밸리2길 250', '1588-7676', 'https://ipark-golf.com/wolsongri/course'),
  ('gc-40bd08295048', '오크힐스CC', '강원 원주시 지정면 오크밸리2길 132', '1588-7676', 'https://ipark-golf.com/oakhills/course'),
  ('gc-120fdf5098ca', '센추리21CC', '원주시 문막읍 궁말길 193', '033-733-1000', 'http://www.century21cc.co.kr/'),
  ('gc-d2426892b3a5', '센추리21CC(퍼블릭)', '원주시 문막읍 궁말길 193', '033-733-2113', 'https://www.century21cc.co.kr/'),
  ('gc-e9127c84ddf1', '소노펠리체CC 비발디파크 WEST', '홍천군 서면 한치골길 200', '1644-0063', 'http://www.sonofelicecc.com/vc'),
  ('gc-56adaea8c265', '소노펠리체CC 비발디파크 MOUNTAIN', '홍천군 서면 한치골길 264', '1644-0063', 'http://www.sonofelicecc.com/vp'),
  ('gc-67d0f65e6b2d', '설해원', '양양군 손양면 공항로 230', '033-670-7700', 'https://www.seolhaeone.com/golf/list.do'),
  ('gc-e684f84c8fa4', '레이크사이드CC(퍼블릭)', '경기도 용인시 처인구 모현읍 능원로 181', '031-334-2111', 'http://www.lakeside.kr/'),
  ('gc-0c833ff6d95f', '블루원용인CC(회원제)', '경기도 용인시 처인구 원삼면 보개원삼로 1534번길 40', '1899-1888', 'http://yi.blueone.com/'),
  ('gc-bcdfbfe815c7', '비에이비스타CC(회원제)', '경기도 이천시 모가면 어농로 272', '031-636-3577', 'http://www.bavista.co.kr/'),
  ('gc-9de1c40fef77', '블랙스톤CC(퍼블릭, 서코스)', '경기도 이천시 장호원읍 장여로 459-160', '031·630·0703', 'https://www.blackstoneresort.com/ic/'),
  ('gc-9d709ff43c33', '몽베르CC(퍼블릭)', '경기 포천시 영북면 산정리 산 60', '031-531-1100', 'http://www.montvertcc.com/'),
  ('gc-8a797fe2213a', '금강CC(회원제)', '경기도 여주시 가남읍 여주남로 541', '031-880-6000', 'https://www.kccgolf.co.kr'),
  ('gc-3f6cace5bf14', '금강CC(퍼블릭, 동코스)', '경기도 여주시 가남읍 여주남로 541', '031-880-6000', 'https://www.kccgolf.co.kr'),
  ('gc-6259847b3bba', '스카이밸리CC(퍼블릭)', '경기도 여주시 북내면 운촌길 254', '031-880-8800', 'http://www.skyvalley.co.kr/')
) AS v(id, name, address, phone, homepage_url)
WHERE public.golf_courses.id = v.id;
