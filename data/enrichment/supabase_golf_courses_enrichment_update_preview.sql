-- Safe enrichment update SQL (preview, first 20 rows)
-- Generated: 2026-06-21T08:32:00.041Z
-- Source: data/enrichment/course_enrichment_edit.csv
-- Table: public.golf_courses
-- Columns: id, name, address, phone, homepage_url, price_text, price_min, price_max, price_type
-- Excluded (never updated): avg_score, difficulty, scraped_avg_score, scraped_difficulty, scraped_difficulty_text
-- Policy: name always updated; other fields only when CSV value is non-empty (NULL for empty numerics)
-- Run manually in Supabase SQL Editor. Do not auto-execute.

UPDATE public.golf_courses AS g
SET
  name = v.name,
  address = COALESCE(NULLIF(v.address, ''), g.address),
  phone = COALESCE(NULLIF(v.phone, ''), g.phone),
  homepage_url = COALESCE(NULLIF(v.homepage_url, ''), g.homepage_url),
  price_text = COALESCE(NULLIF(v.price_text, ''), g.price_text),
  price_min = COALESCE(v.price_min, g.price_min),
  price_max = COALESCE(v.price_max, g.price_max),
  price_type = COALESCE(NULLIF(v.price_type, ''), g.price_type),
  updated_at = NOW()
FROM (
  VALUES
  ('gc-9b37cfc9caa8', '뉴스프링빌CC', '경기도 이천시 모가면 사실로 527번길 158', '031-630-7500', 'http://www.newspringvillecc.co.kr/', '', NULL, NULL, 'unknown'),
  ('gc-1f14d0ca89b4', '가산CC', '경상북도 칠곡군 가산면 학하2길 54-171', '054-970-3712', 'https://www.gasancc.com', '', NULL, NULL, 'unknown'),
  ('gc-a862e6d054f2', '빅토리아GC', '경기도 여주시 가남읍 송삼로 191', '031-883-0111', 'http://www.victoriagc.co.kr/', '', NULL, NULL, 'reservation_price'),
  ('gc-15dd2e00d6c7', '군위오펠GC', '대구광역시 군위군 산성면 부흥로 227', '054-380-8000', 'https://www.ophelgc.com/', '', NULL, NULL, 'reservation_price'),
  ('gc-9a7cb8103191', '오크밸리CC', '원주시 지정면 오크밸리1길 66', '1588-7676', 'https://ipark-golf.com/oakvalley/course', '', NULL, NULL, 'unknown'),
  ('gc-7b4833dc4475', '월송리CC', '원주시 지정면 오크밸리2길 250', '1588-7676', 'https://ipark-golf.com/wolsongri/course', '', NULL, NULL, 'unknown'),
  ('gc-40bd08295048', '오크힐스CC', '강원 원주시 지정면 오크밸리2길 132', '1588-7676', 'https://ipark-golf.com/oakhills/course', '', NULL, NULL, 'unknown'),
  ('gc-120fdf5098ca', '센추리21CC', '원주시 문막읍 궁말길 193', '033-733-1000', 'http://www.century21cc.co.kr/', '', NULL, NULL, 'unknown'),
  ('gc-d2426892b3a5', '센추리21CC(퍼블릭)', '원주시 문막읍 궁말길 193', '033-733-2113', 'https://www.century21cc.co.kr/', '', NULL, NULL, 'unknown'),
  ('gc-e9127c84ddf1', '소노펠리체CC 비발디파크 WEST', '홍천군 서면 한치골길 200', '1644-0063', 'http://www.sonofelicecc.com/vc', '', NULL, NULL, 'unknown'),
  ('gc-56adaea8c265', '소노펠리체CC 비발디파크 MOUNTAIN', '홍천군 서면 한치골길 264', '1644-0063', 'http://www.sonofelicecc.com/vp', '', NULL, NULL, 'unknown'),
  ('gc-67d0f65e6b2d', '설해원', '양양군 손양면 공항로 230', '033-670-7700', 'https://www.seolhaeone.com/golf/list.do', '', NULL, NULL, 'unknown'),
  ('gc-e684f84c8fa4', '레이크사이드CC(퍼블릭)', '경기도 용인시 처인구 모현읍 능원로 181', '031-334-2111', 'http://www.lakeside.kr/', '', NULL, NULL, 'unknown'),
  ('gc-0c833ff6d95f', '블루원용인CC(회원제)', '경기도 용인시 처인구 원삼면 보개원삼로 1534번길 40', '1899-1888', 'http://yi.blueone.com/', '', NULL, NULL, 'unknown'),
  ('gc-bcdfbfe815c7', '비에이비스타CC(회원제)', '경기도 이천시 모가면 어농로 272', '031-636-3577', 'http://www.bavista.co.kr/', '', NULL, NULL, 'unknown'),
  ('gc-9de1c40fef77', '블랙스톤CC(퍼블릭, 서코스)', '경기도 이천시 장호원읍 장여로 459-160', '031·630·0703', 'https://www.blackstoneresort.com/ic/', '', 197000, 258000, 'unknown'),
  ('gc-9d709ff43c33', '몽베르CC(퍼블릭)', '경기 포천시 영북면 산정리 산 60', '031-531-1100', 'http://www.montvertcc.com/', '', 160000, 280000, 'unknown'),
  ('gc-8a797fe2213a', '금강CC(회원제)', '경기도 여주시 가남읍 여주남로 541', '031-880-6000', 'https://www.kccgolf.co.kr', '', NULL, NULL, 'unknown'),
  ('gc-3f6cace5bf14', '금강CC(퍼블릭, 동코스)', '경기도 여주시 가남읍 여주남로 541', '031-880-6000', 'https://www.kccgolf.co.kr', '', NULL, NULL, 'unknown'),
  ('gc-6259847b3bba', '스카이밸리CC(퍼블릭)', '경기도 여주시 북내면 운촌길 254', '031-880-8800', 'http://www.skyvalley.co.kr/', '', NULL, NULL, 'unknown')
) AS v(id, name, address, phone, homepage_url, price_text, price_min, price_max, price_type)
WHERE g.id = v.id;
