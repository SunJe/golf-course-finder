-- Preview delta enrichment update SQL (max 20 rows)
-- Generated: 2026-06-20T11:57:22.016Z
-- Table: public.golf_courses
-- Fields: name (only when change_name_to set), phone, homepage_url
-- Excluded: booking_url, price, difficulty, avg_score
-- Run manually in Supabase SQL Editor. Do not auto-execute.
-- Baseline: data/golf_courses_import_geocoded_final.csv
-- name: only when change_name_to differs from baseline name
-- phone/homepage: only when baseline was empty

-- needs_check: y / confidence: low | rename, fill phone, fill homepage
-- original_name: 뉴스프링빌골프장(대중형)
-- change_name_to: 뉴스프링빌CC
update public.golf_courses
set
  name = '뉴스프링빌CC',
  phone = '031-630-7500',
  homepage_url = 'http://www.newspringvillecc.co.kr/'
where id = 'gc-9b37cfc9caa8';

-- needs_check: y / confidence: low | fill phone, fill homepage
-- original_name: 가산CC
-- change_name_to: 가산CC
update public.golf_courses
set
  phone = '054-970-3712',
  homepage_url = 'https://www.gasancc.com'
where id = 'gc-1f14d0ca89b4';

-- needs_check: y / confidence: low | rename, fill phone, fill homepage
-- original_name: 빅토리아일반대중골프장
-- change_name_to: 빅토리아GC
update public.golf_courses
set
  name = '빅토리아GC',
  phone = '031-883-0111',
  homepage_url = 'http://www.victoriagc.co.kr/'
where id = 'gc-a862e6d054f2';

-- needs_check: y / confidence: low | rename, fill phone, fill homepage
-- original_name: 오펠골프클럽
-- change_name_to: 군위오펠GC
update public.golf_courses
set
  name = '군위오펠GC',
  phone = '054-380-8000',
  homepage_url = 'https://www.ophelgc.com/'
where id = 'gc-15dd2e00d6c7';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 오크밸리회원제골프장
-- change_name_to: 오크밸리CC
update public.golf_courses
set
  name = '오크밸리CC',
  phone = '1588-7676',
  homepage_url = 'https://ipark-golf.com/oakvalley/course'
where id = 'gc-9a7cb8103191';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 월송리 컨트리클럽
-- change_name_to: 월송리CC
update public.golf_courses
set
  name = '월송리CC',
  phone = '1588-7676',
  homepage_url = 'https://ipark-golf.com/wolsongri/course'
where id = 'gc-7b4833dc4475';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: Oak Hills컨트리클럽
-- change_name_to: 오크힐스CC
update public.golf_courses
set
  name = '오크힐스CC',
  phone = '1588-7676',
  homepage_url = 'https://ipark-golf.com/oakhills/course'
where id = 'gc-40bd08295048';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 센추리21컨트리클럽Ⅱ
-- change_name_to: 센추리21CC
update public.golf_courses
set
  name = '센추리21CC',
  phone = '033-733-1000',
  homepage_url = 'http://www.century21cc.co.kr/'
where id = 'gc-120fdf5098ca';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 센추리21퍼블릭
-- change_name_to: 센추리21CC(퍼블릭)
update public.golf_courses
set
  name = '센추리21CC(퍼블릭)',
  phone = '033-733-2113',
  homepage_url = 'https://www.century21cc.co.kr/'
where id = 'gc-d2426892b3a5';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 소노펠리체 컨트리클럽 비발디파크 웨스트
-- change_name_to: 소노펠리체CC 비발디파크 WEST
update public.golf_courses
set
  name = '소노펠리체CC 비발디파크 WEST',
  phone = '1644-0063',
  homepage_url = 'http://www.sonofelicecc.com/vc'
where id = 'gc-e9127c84ddf1';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 소노펠리체 컨트리클럽 비발디파크 마운틴
-- change_name_to: 소노펠리체CC 비발디파크 MOUNTAIN
update public.golf_courses
set
  name = '소노펠리체CC 비발디파크 MOUNTAIN',
  phone = '1644-0063',
  homepage_url = 'http://www.sonofelicecc.com/vp'
where id = 'gc-56adaea8c265';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 설해원더 레전드 코스
-- change_name_to: 설해원
update public.golf_courses
set
  name = '설해원',
  phone = '033-670-7700',
  homepage_url = 'https://www.seolhaeone.com/golf/list.do'
where id = 'gc-67d0f65e6b2d';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 레이크사이드CC(대중제)
-- change_name_to: 레이크사이드CC(퍼블릭)
update public.golf_courses
set
  name = '레이크사이드CC(퍼블릭)',
  phone = '031-334-2111',
  homepage_url = 'http://www.lakeside.kr/'
where id = 'gc-e684f84c8fa4';

-- needs_check: y | fill phone, fill homepage
-- original_name: 블루원용인CC(회원제)
-- change_name_to: 블루원용인CC(회원제)
update public.golf_courses
set
  phone = '1899-1888',
  homepage_url = 'http://yi.blueone.com/'
where id = 'gc-0c833ff6d95f';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 비에이비스타골프장(회원)
-- change_name_to: 비에이비스타CC(회원제)
update public.golf_courses
set
  name = '비에이비스타CC(회원제)',
  phone = '031-636-3577',
  homepage_url = 'http://www.bavista.co.kr/'
where id = 'gc-bcdfbfe815c7';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 블랙스톤골프장(대중형)
-- change_name_to: 블랙스톤CC(퍼블릭, 서코스)
update public.golf_courses
set
  name = '블랙스톤CC(퍼블릭, 서코스)',
  homepage_url = 'https://www.blackstoneresort.com/ic/'
where id = 'gc-9de1c40fef77';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 몽베르 컨트리클럽(비회원제)
-- change_name_to: 몽베르CC(퍼블릭)
update public.golf_courses
set
  name = '몽베르CC(퍼블릭)',
  phone = '031-531-1100',
  homepage_url = 'http://www.montvertcc.com/'
where id = 'gc-9d709ff43c33';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 금강컨트리클럽(회원)
-- change_name_to: 금강CC(회원제)
update public.golf_courses
set
  name = '금강CC(회원제)',
  phone = '031-880-6000',
  homepage_url = 'https://www.kccgolf.co.kr'
where id = 'gc-8a797fe2213a';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 금강컨트리클럽(대중)
-- change_name_to: 금강CC(퍼블릭, 동코스)
update public.golf_courses
set
  name = '금강CC(퍼블릭, 동코스)',
  phone = '031-880-6000',
  homepage_url = 'https://www.kccgolf.co.kr'
where id = 'gc-3f6cace5bf14';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 스카이밸리골프장(비회원)
-- change_name_to: 스카이밸리CC(퍼블릭)
update public.golf_courses
set
  name = '스카이밸리CC(퍼블릭)',
  phone = '031-880-8800',
  homepage_url = 'http://www.skyvalley.co.kr/'
where id = 'gc-6259847b3bba';
