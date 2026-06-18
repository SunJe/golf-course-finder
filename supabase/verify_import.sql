-- GolfMap Korea — post-import verification
-- Run in Supabase SQL Editor after importing data/golf_courses_import_geocoded_final.csv
-- Expected: 532 rows, 0 null coords, 0 duplicate ids

-- =============================================================================
-- 1. 전체 row count (expected: 532)
-- =============================================================================
select count(*) as total_rows
from public.golf_courses;
-- PASS: total_rows = 532

-- =============================================================================
-- 2. latitude / longitude null count (expected: 0 each)
-- =============================================================================
select
  count(*) filter (where latitude is null) as latitude_null_count,
  count(*) filter (where longitude is null) as longitude_null_count
from public.golf_courses;
-- PASS: both = 0

-- =============================================================================
-- 3. 중복 id (expected: 0 rows)
-- =============================================================================
select id, count(*) as cnt
from public.golf_courses
group by id
having count(*) > 1;
-- PASS: no rows

-- =============================================================================
-- 4. 빈 name / address (expected: 0)
-- =============================================================================
select
  count(*) filter (where name is null or trim(name) = '') as empty_name_count,
  count(*) filter (where address is null or trim(address) = '') as empty_address_count
from public.golf_courses;
-- PASS: both = 0

-- =============================================================================
-- 5. region 분포
-- =============================================================================
select region, count(*) as cnt
from public.golf_courses
group by region
order by cnt desc, region;
-- Expected regions only: 서울, 경기, 강원, 충청, 전라, 경상, 제주

select count(*) as invalid_region_count
from public.golf_courses
where region not in ('서울', '경기', '강원', '충청', '전라', '경상', '제주');
-- PASS: 0

-- =============================================================================
-- 6. course_type 분포
-- =============================================================================
select course_type, count(*) as cnt
from public.golf_courses
group by course_type
order by cnt desc, course_type;
-- Expected types: 대중제, 회원제, 군 골프장, 기타

select count(*) as invalid_course_type_count
from public.golf_courses
where course_type is null
   or course_type not in ('대중제', '회원제', '군 골프장', '기타');
-- PASS: 0

-- =============================================================================
-- 7. hole_count 분포
-- =============================================================================
select hole_count, count(*) as cnt
from public.golf_courses
group by hole_count
order by hole_count nulls first;
-- Spot-check merged rows:
--   로얄링스 CC / 솔라고CC → 36
--   블랙스톤제주 → 27
--   태기산 나인CC → 9

select id, name, hole_count
from public.golf_courses
where id in (
  'gc-bf183cd699c7',  -- 로얄링스 CC
  'gc-167a7f95d402',  -- 솔라고CC
  'gc-74de2175f831',  -- 블랙스톤제주
  'gc-a043ad4dfcf6',  -- 서경타니CC
  'gc-01d6a94bf335',  -- 골프존카운티 청통
  'gc-716264430902'   -- 태기산 나인CC
)
order by id;

-- =============================================================================
-- 8. 좌표 범위 밖 (Korea bounds: lat 33~39, lng 124~132)
-- =============================================================================
select id, name, latitude, longitude
from public.golf_courses
where latitude < 33
   or latitude > 39
   or longitude < 124
   or longitude > 132;
-- PASS: no rows

-- =============================================================================
-- 9. source 분포 (expected: all public_data)
-- =============================================================================
select source, count(*) as cnt
from public.golf_courses
group by source
order by cnt desc;
-- PASS: public_data = 532

select count(*) as non_public_data_count
from public.golf_courses
where source is distinct from 'public_data';
-- PASS: 0

-- =============================================================================
-- 10. created_at / updated_at null (expected: 0)
-- =============================================================================
select
  count(*) filter (where created_at is null) as created_at_null_count,
  count(*) filter (where updated_at is null) as updated_at_null_count
from public.golf_courses;
-- PASS: both = 0

-- =============================================================================
-- 11. 골프존카운티 이름 spot-check (한글 브랜드명)
-- =============================================================================
select id, name
from public.golf_courses
where name like '%골프존%'
order by name;
-- Confirm: "골프존카운티 …" (no Latin "ounty" mixed in)

-- =============================================================================
-- 12. Summary — single result row for quick PASS/FAIL
-- =============================================================================
select
  (select count(*) from public.golf_courses) as total_rows,
  (select count(*) from public.golf_courses where latitude is null or longitude is null) as null_coords,
  (select count(*) from (
    select id from public.golf_courses group by id having count(*) > 1
  ) d) as duplicate_ids,
  (select count(*) from public.golf_courses where trim(name) = '' or trim(address) = '') as empty_name_or_address,
  (select count(*) from public.golf_courses where source is distinct from 'public_data') as non_public_data,
  case
    when (select count(*) from public.golf_courses) = 532
     and (select count(*) from public.golf_courses where latitude is null or longitude is null) = 0
     and (select count(*) from (
       select id from public.golf_courses group by id having count(*) > 1
     ) d) = 0
     and (select count(*) from public.golf_courses where trim(name) = '' or trim(address) = '') = 0
    then 'PASS'
    else 'FAIL'
  end as import_status;
