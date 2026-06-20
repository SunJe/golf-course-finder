-- Preview price update SQL (max 20 rows)
-- Generated: 2026-06-19T23:42:11.379Z
-- Table: public.golf_courses
-- Fields: price_text, price_min, price_max, price_type, price_source_url, price_updated_at
-- Excluded: booking_url, difficulty, avg_score
-- Run manually in Supabase SQL Editor. Do not auto-execute.

-- needs_check: y
-- name: 블랙스톤골프장(대중형)
update public.golf_courses
set
  price_min = 197000,
  price_max = 258000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B8%94%EB%9E%99%EC%8A%A4%ED%86%A4%EA%B3%A8%ED%94%84%EC%9E%A5(%EB%8C%80%EC%A4%91%ED%98%95)',
  price_updated_at = now()
where id = 'gc-9de1c40fef77';

-- needs_check: y
-- name: 몽베르 컨트리클럽(비회원제)
update public.golf_courses
set
  price_min = 160000,
  price_max = 280000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%AA%BD%EB%B2%A0%EB%A5%B4%20CC(%EB%B9%84%ED%9A%8C%EC%9B%90%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-9d709ff43c33';

-- needs_check: y
-- name: 힐스카이C.C
update public.golf_courses
set
  price_min = 90000,
  price_max = 145000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%9E%90%EC%8A%A4%EC%B9%B4%EC%9D%B4C.C%20%EB%84%A4%EC%9D%B4%EB%B2%84',
  price_updated_at = now()
where id = 'gc-6b7f785d4813';

-- needs_check: y
-- name: 안동리버힐C.C
update public.golf_courses
set
  price_min = 90000,
  price_max = 145000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%95%88%EB%8F%99%EB%A6%AC%EB%B2%84%ED%9E%90C.C',
  price_updated_at = now()
where id = 'gc-9adfe4aa2a07';

-- needs_check: y
-- name: 뉴스프링빌Ⅱ
update public.golf_courses
set
  price_min = 130000,
  price_max = 200000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%89%B4%EC%8A%A4%ED%94%84%EB%A7%81%EB%B9%8C%E2%85%A1',
  price_updated_at = now()
where id = 'gc-1730ca5fe304';

-- needs_check: y
-- name: 울산골프장
update public.golf_courses
set
  price_min = 110000,
  price_max = 220000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9A%B8%EC%82%B0',
  price_updated_at = now()
where id = 'gc-3d725200e925';

-- needs_check: y
-- name: 순천CC
update public.golf_courses
set
  price_min = 50000,
  price_max = 80000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%88%9C%EC%B2%9CCC',
  price_updated_at = now()
where id = 'gc-dfddaf985536';

-- needs_check: y
-- name: 화순CC
update public.golf_courses
set
  price_min = 80000,
  price_max = 190000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%99%94%EC%88%9CCC',
  price_updated_at = now()
where id = 'gc-a6fee0f415b7';

-- needs_check: y
-- name: ㈜호텔롯데 스카이힐 부여CC
update public.golf_courses
set
  price_min = 135000,
  price_max = 250000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%E3%88%9C%ED%98%B8%ED%85%94%EB%A1%AF%EB%8D%B0%20%EC%8A%A4%EC%B9%B4%EC%9D%B4%ED%9E%90%20%EB%B6%80%EC%97%ACCC',
  price_updated_at = now()
where id = 'gc-41c9fac17790';

-- needs_check: y
-- name: 힐마루컨트리클럽 (대중제)
update public.golf_courses
set
  price_min = 100000,
  price_max = 160000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%9E%90%EB%A7%88%EB%A3%A8%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD%20(%EB%8C%80%EC%A4%91%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-98e3f829ab99';

-- needs_check: y
-- name: 오션힐스포항C.C (대중제)
update public.golf_courses
set
  price_min = 130000,
  price_max = 230000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%98%A4%EC%85%98%ED%9E%90%EC%8A%A4%ED%8F%AC%ED%95%ADC.C%20(%EB%8C%80%EC%A4%91%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-43ee7ee149ba';

-- needs_check: y
-- name: 에버리스CC (대중제)
update public.golf_courses
set
  price_min = 130000,
  price_max = 160000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%97%90%EB%B2%84%EB%A6%AC%EC%8A%A4CC%20(%EB%8C%80%EC%A4%91%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-57d2cac587d2';

-- needs_check: y
-- name: 캐슬렉스제주 (대중제)
update public.golf_courses
set
  price_min = 65000,
  price_max = 80000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%BA%90%EC%8A%AC%EB%A0%89%EC%8A%A4%EC%A0%9C%EC%A3%BC%20(%EB%8C%80%EC%A4%91%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-8c893fc692ea';

-- needs_check: y
-- name: 해비치CC (대중제)
update public.golf_courses
set
  price_min = 110000,
  price_max = 212000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%B4%EB%B9%84%EC%B9%98CC%20(%EB%8C%80%EC%A4%91%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-a34d1218714a';

-- needs_check: y
-- name: 소노펠리체 컨트리클럽 비발디파크 이스트
update public.golf_courses
set
  price_min = 190000,
  price_max = 210000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%86%8C%EB%85%B8%ED%8E%A0%EB%A6%AC%EC%B2%B4%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD%20%EB%B9%84%EB%B0%9C%EB%94%94%ED%8C%8C%ED%81%AC%20%EC%9D%B4%EC%8A%A4%ED%8A%B8',
  price_updated_at = now()
where id = 'gc-ae905ec6b25f';

-- needs_check: y
-- name: 웰리힐리퍼블릭
update public.golf_courses
set
  price_min = 120000,
  price_max = 200000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9B%B0%EB%A6%AC%ED%9E%90%EB%A6%AC%ED%8D%BC%EB%B8%94%EB%A6%AD',
  price_updated_at = now()
where id = 'gc-ec8024eb7955';

-- needs_check: y
-- name: 경주C.C
update public.golf_courses
set
  price_min = 140000,
  price_max = 170000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B2%BD%EC%A3%BCC.C%20%EB%84%A4%EC%9D%B4%EB%B2%84%20%EC%98%88%EC%95%BD',
  price_updated_at = now()
where id = 'gc-a1d37ac059d4';

-- needs_check: y
-- name: 칠곡아이위시C.C
update public.golf_courses
set
  price_text = '네이버 예약: 80,000원; 90,000원; 140,000원',
  price_min = 80000,
  price_max = 140000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%B9%A0%EA%B3%A1%EC%95%84%EC%9D%B4%EC%9C%84%EC%8B%9CC.C%20%EB%84%A4%EC%9D%B4%EB%B2%84%20%EC%98%88%EC%95%BD',
  price_updated_at = now()
where id = 'gc-bc41a2489944';

-- needs_check: y
-- name: 그린필드GC
update public.golf_courses
set
  price_text = '네이버 예약: 137,000원; 167,000원',
  price_min = 137000,
  price_max = 167000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B7%B8%EB%A6%B0%ED%95%84%EB%93%9CGC',
  price_updated_at = now()
where id = 'gc-7d2ed71b8086';

-- needs_check: y
-- name: 로얄포레cc
update public.golf_courses
set
  price_text = '네이버 예약: 99,000원; 109,000원; 129,000원; 139,000원',
  price_min = 99000,
  price_max = 139000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%A1%9C%EC%96%84%ED%8F%AC%EB%A0%88cc',
  price_updated_at = now()
where id = 'gc-c5f55ef01f20';
