-- Full price update SQL
-- Generated: 2026-06-20T11:55:06.078Z
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
-- name: 우리G.C
update public.golf_courses
set
  price_min = 40000,
  price_max = 65000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9A%B0%EB%A6%ACG.C%20%EB%84%A4%EC%9D%B4%EB%B2%84',
  price_updated_at = now()
where id = 'gc-130f7b88bcf3';

-- needs_check: y
-- name: 오션힐스청도G.C
update public.golf_courses
set
  price_min = 180000,
  price_max = 230000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%98%A4%EC%85%98%ED%9E%90%EC%8A%A4%EC%B2%AD%EB%8F%84G.C%20%EA%B7%B8%EB%A6%B0%ED%94%BC',
  price_updated_at = now()
where id = 'gc-29c208d17553';

-- needs_check: y
-- name: 에콜리안광산골프장
update public.golf_courses
set
  price_min = 30000,
  price_max = 40000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%97%90%EC%BD%9C%EB%A6%AC%EC%95%88%EA%B4%91%EC%82%B0%EA%B3%A8%ED%94%84%EC%9E%A5%20%EB%84%A4%EC%9D%B4%EB%B2%84',
  price_updated_at = now()
where id = 'gc-2159121d90f9';

-- needs_check: y
-- name: 다산베아채골프&리조트
update public.golf_courses
set
  price_min = 85000,
  price_max = 185000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%8B%A4%EC%82%B0%EB%B2%A0%EC%95%84%EC%B1%84%EA%B3%A8%ED%94%84%26%EB%A6%AC%EC%A1%B0%ED%8A%B8%20%EA%B7%B8%EB%A6%B0%ED%94%BC',
  price_updated_at = now()
where id = 'gc-d5a6f91a588a';

-- needs_check: y
-- name: 천지CC
update public.golf_courses
set
  price_min = 50000,
  price_max = 85000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%B2%9C%EC%A7%80CC%20%EC%A0%84%EB%82%A8',
  price_updated_at = now()
where id = 'gc-c8fc5eccf7b9';

-- needs_check: y
-- name: 떼제베운영
update public.golf_courses
set
  price_min = 120000,
  price_max = 150000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%96%BC%EC%A0%9C%EB%B2%A0%EC%9A%B4%EC%98%81',
  price_updated_at = now()
where id = 'gc-606fb4b33249';

-- needs_check: y
-- name: 블랙스톤cc
update public.golf_courses
set
  price_min = 250000,
  price_max = 330000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B8%94%EB%9E%99%EC%8A%A4%ED%86%A4cc%20%EC%A6%9D%ED%8F%89%EA%B5%B0',
  price_updated_at = now()
where id = 'gc-97d5d758dc31';

-- needs_check: y
-- name: 롯데스카이힐제주 (대중제)
update public.golf_courses
set
  price_min = 110000,
  price_max = 180000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%A1%AF%EB%8D%B0%EC%8A%A4%EC%B9%B4%EC%9D%B4%ED%9E%90%EC%A0%9C%EC%A3%BC%20(%EB%8C%80%EC%A4%91%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-4d1cbdf3ceb2';

-- needs_check: y
-- name: 여수시티파크골프&호텔
update public.golf_courses
set
  price_min = 100000,
  price_max = 140000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%97%AC%EC%88%98%EC%8B%9C%ED%8B%B0%ED%8C%8C%ED%81%AC%EA%B3%A8%ED%94%84%26%ED%98%B8%ED%85%94%20%EB%84%A4%EC%9D%B4%EB%B2%84',
  price_updated_at = now()
where id = 'gc-ae299d74ffe4';

-- needs_check: y
-- name: 메이플비치골프&리조트
update public.golf_courses
set
  price_min = 120000,
  price_max = 180000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%A9%94%EC%9D%B4%ED%94%8C%EB%B9%84%EC%B9%98%EA%B3%A8%ED%94%84%26%EB%A6%AC%EC%A1%B0%ED%8A%B8',
  price_updated_at = now()
where id = 'gc-b768a2002431';

-- needs_check: y
-- name: O2리조트 퍼블릭골프장
update public.golf_courses
set
  price_min = 100000,
  price_max = 150000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=O2%EB%A6%AC%EC%A1%B0%ED%8A%B8%20%ED%8D%BC%EB%B8%94%EB%A6%AD%EA%B3%A8%ED%94%84%EC%9E%A5',
  price_updated_at = now()
where id = 'gc-e6edfdd39527';

-- needs_check: y
-- name: 벨라45 오너스 컨트리클럽
update public.golf_courses
set
  price_min = 150000,
  price_max = 230000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B2%A8%EB%9D%BC45%20%EC%98%A4%EB%84%88%EC%8A%A4%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-fac50b03683e';

-- needs_check: y
-- name: 플라자CC
update public.golf_courses
set
  price_min = 220000,
  price_max = 290000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%94%8C%EB%9D%BC%EC%9E%90CC',
  price_updated_at = now()
where id = 'gc-4af8a2f8ed32';

-- needs_check: y
-- name: 태광컨트리클럽(회원제)
update public.golf_courses
set
  price_min = 260000,
  price_max = 300000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%83%9C%EA%B4%91%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD(%ED%9A%8C%EC%9B%90%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-9da6f2a0f2d9';

-- needs_check: y
-- name: 태광컨트리클럽(대중제)
update public.golf_courses
set
  price_min = 199000,
  price_max = 259000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%83%9C%EA%B4%91%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD(%EB%8C%80%EC%A4%91%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-3d63d3179c0f';

-- needs_check: y
-- name: 국가보훈부 88골프장
update public.golf_courses
set
  price_min = 210000,
  price_max = 260000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B5%AD%EA%B0%80%EB%B3%B4%ED%9B%88%EB%B6%80%2088%EA%B3%A8%ED%94%84%EC%9E%A5%20%EB%84%A4%EC%9D%B4%EB%B2%84',
  price_updated_at = now()
where id = 'gc-0f218a599984';

-- needs_check: y
-- name: 코리아대중CC
update public.golf_courses
set
  price_min = 55000,
  price_max = 80000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%BD%94%EB%A6%AC%EC%95%84%EB%8C%80%EC%A4%91CC',
  price_updated_at = now()
where id = 'gc-4487ee52808c';

-- needs_check: y
-- name: 지산퍼블릭
update public.golf_courses
set
  price_min = 50000,
  price_max = 65000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%A7%80%EC%82%B0%ED%8D%BC%EB%B8%94%EB%A6%AD',
  price_updated_at = now()
where id = 'gc-4687a4044d34';

-- needs_check: y
-- name: 발리오스컨트리클럽(회원제)
update public.golf_courses
set
  price_min = 230000,
  price_max = 300000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B0%9C%EB%A6%AC%EC%98%A4%EC%8A%A4%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD(%ED%9A%8C%EC%9B%90%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-ccb45b4f27e1';

-- needs_check: y
-- name: 발리오스컨트리클럽(비회원제)
update public.golf_courses
set
  price_min = 115000,
  price_max = 150000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B0%9C%EB%A6%AC%EC%98%A4%EC%8A%A4%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD(%EB%B9%84%ED%9A%8C%EC%9B%90%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-2db2d6cad688';

-- needs_check: y
-- name: 파주 J-Public 골프장
update public.golf_courses
set
  price_min = 63700,
  price_max = 95500,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8C%8C%EC%A3%BC%20J-Public',
  price_updated_at = now()
where id = 'gc-81becbdb274e';

-- needs_check: y
-- name: 타이거CC 골프장
update public.golf_courses
set
  price_min = 130000,
  price_max = 240000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%83%80%EC%9D%B4%EA%B1%B0CC%20%EA%B3%A8%ED%94%84%EC%9E%A5',
  price_updated_at = now()
where id = 'gc-9eb46dae9c9d';

-- needs_check: y
-- name: 사우스스프링스C.C
update public.golf_courses
set
  price_min = 200000,
  price_max = 250000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%82%AC%EC%9A%B0%EC%8A%A4%EC%8A%A4%ED%94%84%EB%A7%81%EC%8A%A4C.C',
  price_updated_at = now()
where id = 'gc-06bb9165507c';

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

-- needs_check: y
-- name: 캐슬렉스제주 (회원제)
update public.golf_courses
set
  price_min = 200000,
  price_max = 270000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%BA%90%EC%8A%AC%EB%A0%89%EC%8A%A4%EC%A0%9C%EC%A3%BC%20(%ED%9A%8C%EC%9B%90%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-0654fd7fa764';

-- needs_check: y
-- name: 해비치CC (회원제)
update public.golf_courses
set
  price_min = 110000,
  price_max = 212000,
  price_type = 'unknown',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%B4%EB%B9%84%EC%B9%98CC%20(%ED%9A%8C%EC%9B%90%EC%A0%9C)',
  price_updated_at = now()
where id = 'gc-e51deb9a5cbf';

-- needs_check: y
-- name: 라데나골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 250,000원; 270,000원',
  price_min = 250000,
  price_max = 270000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%9D%BC%EB%8D%B0%EB%82%98%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-18f9f355721d';

-- needs_check: y
-- name: 오너스골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 150,000원; 160,000원; 210,000원; 220,000원; 250,000원',
  price_min = 150000,
  price_max = 250000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%98%A4%EB%84%88%EC%8A%A4%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-3ae54b5361c3';

-- needs_check: y
-- name: 파크밸리골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 129,000원; 139,000원; 149,000원',
  price_min = 129000,
  price_max = 149000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8C%8C%ED%81%AC%EB%B0%B8%EB%A6%AC%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-52110494ceac';

-- needs_check: y
-- name: 인터불고원주골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 119,000원',
  price_min = 119000,
  price_max = 119000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9D%B8%ED%84%B0%EB%B6%88%EA%B3%A0%EC%9B%90%EC%A3%BC%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-cbe46e8a03a2';

-- needs_check: y
-- name: 설악프라자컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 168,000원',
  price_min = 168000,
  price_max = 168000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%84%A4%EC%95%85%ED%94%84%EB%9D%BC%EC%9E%90%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-716535d8799a';

-- needs_check: y
-- name: 파인밸리컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 145,000원',
  price_min = 145000,
  price_max = 145000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8C%8C%EC%9D%B8%EB%B0%B8%EB%A6%AC%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-5d96ff075544';

-- needs_check: y
-- name: 블랙밸리컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 90,000원; 130,000원',
  price_min = 90000,
  price_max = 130000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B8%94%EB%9E%99%EB%B0%B8%EB%A6%AC%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-788ff880fb4f';

-- needs_check: y
-- name: 비콘힐스골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 135,000원; 145,000원; 155,000원',
  price_min = 135000,
  price_max = 155000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B9%84%EC%BD%98%ED%9E%90%EC%8A%A4%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-3447dbe87ddc';

-- needs_check: y
-- name: 힐드로사이컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 220,000원; 240,000원',
  price_min = 220000,
  price_max = 240000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%9E%90%EB%93%9C%EB%A1%9C%EC%82%AC%EC%9D%B4%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-d7beeda963dd';

-- needs_check: y
-- name: 샤인데일골프&리조트
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원; 210,000원',
  price_min = 160000,
  price_max = 210000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%83%A4%EC%9D%B8%EB%8D%B0%EC%9D%BC%EA%B3%A8%ED%94%84%26%EB%A6%AC%EC%A1%B0%ED%8A%B8',
  price_updated_at = now()
where id = 'gc-690b34d2b582';

-- needs_check: y
-- name: 카스카디아 골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 280,000원; 290,000원',
  price_min = 280000,
  price_max = 290000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%B9%B4%EC%8A%A4%EC%B9%B4%EB%94%94%EC%95%84%20%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-568fcaa60a5e';

-- needs_check: y
-- name: 웰리힐리컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 200,000원',
  price_min = 200000,
  price_max = 200000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9B%B0%EB%A6%AC%ED%9E%90%EB%A6%AC%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-bbf51fd6cc91';

-- needs_check: y
-- name: 벨라스톤컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 149,000원; 169,000원; 174,000원; 179,000원; 189,000원',
  price_min = 149000,
  price_max = 189000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B2%A8%EB%9D%BC%EC%8A%A4%ED%86%A4%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-43114c6913bc';

-- needs_check: y
-- name: 올데이 옥스필드
update public.golf_courses
set
  price_text = '네이버 예약: 89,000원; 109,000원; 169,000원',
  price_min = 89000,
  price_max = 169000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%98%AC%EB%8D%B0%EC%9D%B4%20%EC%98%A5%EC%8A%A4%ED%95%84%EB%93%9C',
  price_updated_at = now()
where id = 'gc-535182f1f0fa';

-- needs_check: y
-- name: 동강시스타 골프장
update public.golf_courses
set
  price_text = '네이버 예약: 80,000원; 150,000원; 160,000원',
  price_min = 80000,
  price_max = 160000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%8F%99%EA%B0%95%EC%8B%9C%EC%8A%A4%ED%83%80%20%EA%B3%A8%ED%94%84%EC%9E%A5',
  price_updated_at = now()
where id = 'gc-908385d35939';

-- needs_check: y
-- name: 휘닉스 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 190,000원; 240,000원',
  price_min = 190000,
  price_max = 240000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%9C%98%EB%8B%89%EC%8A%A4%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-98e23645d4c7';

-- needs_check: y
-- name: 하이원컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 133,000원; 170,000원',
  price_min = 133000,
  price_max = 170000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%98%EC%9D%B4%EC%9B%90%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-658a43bb77b8';

-- needs_check: y
-- name: 소노펠리체 컨트리클럽 델피노
update public.golf_courses
set
  price_text = '네이버 예약: 168,000원; 182,000원; 189,000원',
  price_min = 168000,
  price_max = 189000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%86%8C%EB%85%B8%ED%8E%A0%EB%A6%AC%EC%B2%B4%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD%20%EB%8D%B8%ED%94%BC%EB%85%B8',
  price_updated_at = now()
where id = 'gc-da4ac7ff9f91';

-- needs_check: y
-- name: 파인리즈컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 220,000원',
  price_min = 220000,
  price_max = 220000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8C%8C%EC%9D%B8%EB%A6%AC%EC%A6%88%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-4454a258c3a6';

-- needs_check: y
-- name: 한원컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 220,000원',
  price_min = 220000,
  price_max = 220000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%9C%EC%9B%90%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-9a7ff16abcee';

-- needs_check: y
-- name: 양지파인골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 185,000원; 194,000원; 205,000원',
  price_min = 185000,
  price_max = 205000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%96%91%EC%A7%80%ED%8C%8C%EC%9D%B8%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-897c73dbf41b';

-- needs_check: y
-- name: 골드컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 200,000원; 220,000원; 290,000원',
  price_min = 200000,
  price_max = 290000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%EB%93%9C%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-254a1c054bbe';

-- needs_check: y
-- name: 코리아컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 260,000원; 300,000원',
  price_min = 260000,
  price_max = 300000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%BD%94%EB%A6%AC%EC%95%84%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-0086afc84101';

-- needs_check: y
-- name: 한림용인CC
update public.golf_courses
set
  price_text = '네이버 예약: 170,000원; 230,000원',
  price_min = 170000,
  price_max = 230000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%9C%EB%A6%BC%EC%9A%A9%EC%9D%B8CC',
  price_updated_at = now()
where id = 'gc-8b59a320f132';

-- needs_check: y
-- name: 글렌로스 골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 290,000원',
  price_min = 290000,
  price_max = 290000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B8%80%EB%A0%8C%EB%A1%9C%EC%8A%A4%20%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-748b687096d1';

-- needs_check: y
-- name: 용인CC
update public.golf_courses
set
  price_text = '네이버 예약: 175,000원; 185,000원; 195,000원',
  price_min = 175000,
  price_max = 195000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9A%A9%EC%9D%B8CC%20%EC%9A%A9%EC%9D%B8%EC%8B%9C',
  price_updated_at = now()
where id = 'gc-928514cac4c6';

-- needs_check: y
-- name: 써닝포인트 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 195,000원; 225,000원; 265,000원; 275,000원',
  price_min = 195000,
  price_max = 275000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%8D%A8%EB%8B%9D%ED%8F%AC%EC%9D%B8%ED%8A%B8%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-c45d3f5d316d';

-- needs_check: y
-- name: 해솔리아 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 200,000원',
  price_min = 200000,
  price_max = 200000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%B4%EC%86%94%EB%A6%AC%EC%95%84%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-f4bb9638f567';

-- needs_check: y
-- name: 세현CC
update public.golf_courses
set
  price_text = '네이버 예약: 170,000원; 210,000원; 280,000원',
  price_min = 170000,
  price_max = 280000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%84%B8%ED%98%84CC',
  price_updated_at = now()
where id = 'gc-af63c289d999';

-- needs_check: y
-- name: 올림픽 골프장
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원',
  price_min = 160000,
  price_max = 160000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%98%AC%EB%A6%BC%ED%94%BD%20%EA%B3%A8%ED%94%84%EC%9E%A5',
  price_updated_at = now()
where id = 'gc-18640b625b94';

-- needs_check: y
-- name: 일산스프링힐스 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 150,000원; 160,000원; 165,000원',
  price_min = 150000,
  price_max = 165000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9D%BC%EC%82%B0%EC%8A%A4%ED%94%84%EB%A7%81%ED%9E%90%EC%8A%A4%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-41b5c15f44da';

-- needs_check: y
-- name: 라비돌컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 140,000원; 145,000원',
  price_min = 140000,
  price_max = 145000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%9D%BC%EB%B9%84%EB%8F%8C%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-ee03e5ddbe9f';

-- needs_check: y
-- name: 화성골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 110,000원; 120,000원; 130,000원; 140,000원',
  price_min = 110000,
  price_max = 140000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%99%94%EC%84%B1%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-5ec5b76d3c22';

-- needs_check: y
-- name: 양주 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 300,000원',
  price_min = 300000,
  price_max = 300000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%96%91%EC%A3%BC%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-24a9087d99d6';

-- needs_check: y
-- name: 해비치 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 202,000원; 212,000원',
  price_min = 202000,
  price_max = 212000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%B4%EB%B9%84%EC%B9%98%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-01a5e4501db9';

-- needs_check: y
-- name: 남양주CC
update public.golf_courses
set
  price_text = '네이버 예약: 139,000원; 159,000원; 169,000원; 199,000원',
  price_min = 139000,
  price_max = 199000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%82%A8%EC%96%91%EC%A3%BCCC',
  price_updated_at = now()
where id = 'gc-29fa36946d15';

-- needs_check: y
-- name: 에이치원 클럽
update public.golf_courses
set
  price_text = '네이버 예약: 280,000원; 290,000원; 310,000원',
  price_min = 280000,
  price_max = 310000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%97%90%EC%9D%B4%EC%B9%98%EC%9B%90%20%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-82563fee9804';

-- needs_check: y
-- name: 더크로스비골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 250,000원; 280,000원',
  price_min = 250000,
  price_max = 280000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%8D%94%ED%81%AC%EB%A1%9C%EC%8A%A4%EB%B9%84%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-d76bd69feda5';

-- needs_check: y
-- name: 골프클럽Q
update public.golf_courses
set
  price_text = '네이버 예약: 200,000원; 220,000원; 240,000원; 250,000원',
  price_min = 200000,
  price_max = 250000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BDQ',
  price_updated_at = now()
where id = 'gc-152613ee89f3';

-- needs_check: y
-- name: 마에스트로 CC
update public.golf_courses
set
  price_text = '네이버 예약: 220,000원; 230,000원',
  price_min = 220000,
  price_max = 230000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%A7%88%EC%97%90%EC%8A%A4%ED%8A%B8%EB%A1%9C%20CC',
  price_updated_at = now()
where id = 'gc-0151ec2b5b3a';

-- needs_check: y
-- name: 포웰CC 안성
update public.golf_courses
set
  price_text = '네이버 예약: 120,000원; 135,000원; 140,000원; 145,000원; 150,000원; 170,000원',
  price_min = 120000,
  price_max = 170000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8F%AC%EC%9B%B0CC%20%EC%95%88%EC%84%B1',
  price_updated_at = now()
where id = 'gc-5062dbcbfa1c';

-- needs_check: y
-- name: 한림안성
update public.golf_courses
set
  price_text = '네이버 예약: 90,000원; 130,000원; 170,000원',
  price_min = 90000,
  price_max = 170000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%9C%EB%A6%BC%EC%95%88%EC%84%B1',
  price_updated_at = now()
where id = 'gc-16fca0551d98';

-- needs_check: y
-- name: 에덴블루 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 209,000원; 219,000원; 229,000원',
  price_min = 209000,
  price_max = 229000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%97%90%EB%8D%B4%EB%B8%94%EB%A3%A8%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-5495f8d48bf7';

-- needs_check: y
-- name: 이글몬트CC
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원; 190,000원; 210,000원; 260,000원',
  price_min = 160000,
  price_max = 260000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9D%B4%EA%B8%80%EB%AA%AC%ED%8A%B8CC',
  price_updated_at = now()
where id = 'gc-1f3e33adbac2';

-- needs_check: y
-- name: 필로스 골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원; 170,000원; 180,000원',
  price_min = 160000,
  price_max = 180000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%84%EB%A1%9C%EC%8A%A4%20%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-b46ed64b80b6';

-- needs_check: y
-- name: 포레스트힐 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 110,000원; 120,000원; 180,000원; 187,500원; 195,000원',
  price_min = 110000,
  price_max = 195000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8F%AC%EB%A0%88%EC%8A%A4%ED%8A%B8%ED%9E%90%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-b7fd5ee009ca';

-- needs_check: y
-- name: 샴발라 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 150,000원',
  price_min = 150000,
  price_max = 150000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%83%B4%EB%B0%9C%EB%9D%BC%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-7c76a7546834';

-- needs_check: y
-- name: 양평TPC GC
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원; 170,000원; 240,000원',
  price_min = 160000,
  price_max = 240000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%96%91%ED%8F%89TPC%20GC',
  price_updated_at = now()
where id = 'gc-5ca66aa29c0b';

-- needs_check: y
-- name: YJC골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 240,000원; 250,000원; 270,000원',
  price_min = 240000,
  price_max = 270000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=YJC%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-88f7a6754606';

-- needs_check: y
-- name: 소피아그린
update public.golf_courses
set
  price_text = '네이버 예약: 190,000원; 200,000원; 210,000원; 220,000원',
  price_min = 190000,
  price_max = 220000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%86%8C%ED%94%BC%EC%95%84%EA%B7%B8%EB%A6%B0',
  price_updated_at = now()
where id = 'gc-7e1dadf46eaa';

-- needs_check: y
-- name: 아리지 골프장
update public.golf_courses
set
  price_text = '네이버 예약: 210,000원; 220,000원; 240,000원; 250,000원',
  price_min = 210000,
  price_max = 250000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%95%84%EB%A6%AC%EC%A7%80%20%EA%B3%A8%ED%94%84%EC%9E%A5',
  price_updated_at = now()
where id = 'gc-c0e3c44b953c';

-- needs_check: y
-- name: 신라컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 170,000원; 180,000원; 210,000원',
  price_min = 170000,
  price_max = 210000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%8B%A0%EB%9D%BC%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-d388a17be449';

-- needs_check: y
-- name: 페럼클럽
update public.golf_courses
set
  price_text = '네이버 예약: 235,000원; 245,000원; 255,000원; 265,000원; 275,000원',
  price_min = 235000,
  price_max = 275000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8E%98%EB%9F%BC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-bd3f6011928e';

-- needs_check: y
-- name: ROUTE52CC
update public.golf_courses
set
  price_text = '네이버 예약: 110,000원; 190,000원; 200,000원',
  price_min = 110000,
  price_max = 200000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=ROUTE52CC',
  price_updated_at = now()
where id = 'gc-41b908991867';

-- needs_check: y
-- name: 용원컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 190,000원; 210,000원; 215,000원',
  price_min = 190000,
  price_max = 215000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9A%A9%EC%9B%90%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-bfc85ba9acd0';

-- needs_check: y
-- name: 진주컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 150,000원; 175,000원',
  price_min = 150000,
  price_max = 175000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%A7%84%EC%A3%BC%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-25bf0a715d27';

-- needs_check: y
-- name: 김해정산컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 240,000원',
  price_min = 240000,
  price_max = 240000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B9%80%ED%95%B4%EC%A0%95%EC%82%B0%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-7c631a53804f';

-- needs_check: y
-- name: 포웰CC 김해
update public.golf_courses
set
  price_text = '네이버 예약: 140,000원; 150,000원; 160,000원',
  price_min = 140000,
  price_max = 160000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8F%AC%EC%9B%B0CC%20%EA%B9%80%ED%95%B4',
  price_updated_at = now()
where id = 'gc-60d067e583df';

-- needs_check: y
-- name: 리더스컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 150,000원; 160,000원; 165,000원; 175,000원',
  price_min = 150000,
  price_max = 175000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%A6%AC%EB%8D%94%EC%8A%A4%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-57ce42c5a27d';

-- needs_check: y
-- name: 밀양컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 80,000원',
  price_min = 80000,
  price_max = 80000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B0%80%EC%96%91%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-db7809fe87b9';

-- needs_check: y
-- name: 밀양노벨컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 110,000원',
  price_min = 110000,
  price_max = 110000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B0%80%EC%96%91%EB%85%B8%EB%B2%A8%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-a33f55e2efe0';

-- needs_check: y
-- name: 거제드비치골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 110,000원; 120,000원; 130,000원',
  price_min = 110000,
  price_max = 130000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B1%B0%EC%A0%9C%EB%93%9C%EB%B9%84%EC%B9%98%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-2b0f0302ba03';

-- needs_check: y
-- name: 거제뷰컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 95,000원; 129,000원',
  price_min = 95000,
  price_max = 129000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B1%B0%EC%A0%9C%EB%B7%B0%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-cc0251be98e6';

-- needs_check: y
-- name: 양산컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원; 170,000원',
  price_min = 160000,
  price_max = 170000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%96%91%EC%82%B0%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-68aed81d1384';

-- needs_check: y
-- name: 다이아몬드컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 152,000원; 160,000원; 170,000원; 180,000원',
  price_min = 152000,
  price_max = 180000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%8B%A4%EC%9D%B4%EC%95%84%EB%AA%AC%EB%93%9C%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-e33531fed221';

-- needs_check: y
-- name: 양산동원로얄CC
update public.golf_courses
set
  price_text = '네이버 예약: 135,000원; 170,000원',
  price_min = 135000,
  price_max = 170000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%96%91%EC%82%B0%EB%8F%99%EC%9B%90%EB%A1%9C%EC%96%84CC',
  price_updated_at = now()
where id = 'gc-afaf2442a07f';

-- needs_check: y
-- name: 부곡컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원; 165,000원',
  price_min = 160000,
  price_max = 165000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B6%80%EA%B3%A1%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-5aff806af4f9';

-- needs_check: y
-- name: 경남스카이뷰CC
update public.golf_courses
set
  price_text = '네이버 예약: 119,000원; 129,000원; 149,000원',
  price_min = 119000,
  price_max = 149000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B2%BD%EB%82%A8%EC%8A%A4%EC%B9%B4%EC%9D%B4%EB%B7%B0CC',
  price_updated_at = now()
where id = 'gc-64e6bf7be0a4';

-- needs_check: y
-- name: 클럽디거창
update public.golf_courses
set
  price_text = '네이버 예약: 140,000원',
  price_min = 140000,
  price_max = 140000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%81%B4%EB%9F%BD%EB%94%94%EA%B1%B0%EC%B0%BD',
  price_updated_at = now()
where id = 'gc-993e536ad4ee';

-- needs_check: y
-- name: 안동레이크골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 130,000원; 140,000원',
  price_min = 130000,
  price_max = 140000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%95%88%EB%8F%99%EB%A0%88%EC%9D%B4%ED%81%AC%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-94b561c2c97d';

-- needs_check: y
-- name: 인터불고컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 150,000원; 160,000원',
  price_min = 150000,
  price_max = 160000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9D%B8%ED%84%B0%EB%B6%88%EA%B3%A0%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-addca096eb8a';

-- needs_check: y
-- name: 펜타뷰골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 95,000원',
  price_min = 95000,
  price_max = 95000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8E%9C%ED%83%80%EB%B7%B0%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-96fce8122d04';

-- needs_check: y
-- name: 마스터피스CC
update public.golf_courses
set
  price_text = '네이버 예약: 145,000원; 150,000원',
  price_min = 145000,
  price_max = 150000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%A7%88%EC%8A%A4%ED%84%B0%ED%94%BC%EC%8A%A4CC',
  price_updated_at = now()
where id = 'gc-8809b27cc2be';

-- needs_check: y
-- name: 마린CC
update public.golf_courses
set
  price_text = '네이버 예약: 133,000원',
  price_min = 133000,
  price_max = 133000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%A7%88%EB%A6%B0CC',
  price_updated_at = now()
where id = 'gc-078c6e56af3a';

-- needs_check: y
-- name: 어등산컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 135,000원; 140,000원; 150,000원; 160,000원',
  price_min = 135000,
  price_max = 160000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%96%B4%EB%93%B1%EC%82%B0%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-96881a9924c5';

-- needs_check: y
-- name: 팔공컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 140,000원',
  price_min = 140000,
  price_max = 140000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8C%94%EA%B3%B5%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-3b059ef8ec97';

-- needs_check: y
-- name: 구니컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 100,000원',
  price_min = 100000,
  price_max = 100000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B5%AC%EB%8B%88%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-5164e33152d9';

-- needs_check: y
-- name: 금실대덕밸리CC
update public.golf_courses
set
  price_text = '네이버 예약: 99,000원; 135,000원',
  price_min = 99000,
  price_max = 135000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B8%88%EC%8B%A4%EB%8C%80%EB%8D%95%EB%B0%B8%EB%A6%ACCC',
  price_updated_at = now()
where id = 'gc-c9369c96907d';

-- needs_check: y
-- name: 동래베네스트골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 220,000원; 270,000원',
  price_min = 220000,
  price_max = 270000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%8F%99%EB%9E%98%EB%B2%A0%EB%84%A4%EC%8A%A4%ED%8A%B8%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-38215b654b62';

-- needs_check: y
-- name: 하이스트컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 105,000원; 110,000원; 120,000원; 125,000원',
  price_min = 105000,
  price_max = 125000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%98%EC%9D%B4%EC%8A%A4%ED%8A%B8%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-9262179bfeaa';

-- needs_check: y
-- name: 해운대컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 150,000원',
  price_min = 150000,
  price_max = 150000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%B4%EC%9A%B4%EB%8C%80%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-0cacc131d4d7';

-- needs_check: y
-- name: 기장동원로얄컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 110,000원; 120,000원',
  price_min = 110000,
  price_max = 120000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B8%B0%EC%9E%A5%EB%8F%99%EC%9B%90%EB%A1%9C%EC%96%84%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-80348568c7d7';

-- needs_check: y
-- name: 스톤게이트컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 190,000원',
  price_min = 190000,
  price_max = 190000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%8A%A4%ED%86%A4%EA%B2%8C%EC%9D%B4%ED%8A%B8%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-4fba6a0ae29e';

-- needs_check: y
-- name: 보라골프장
update public.golf_courses
set
  price_text = '네이버 예약: 250,000원',
  price_min = 250000,
  price_max = 250000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B3%B4%EB%9D%BC%EA%B3%A8%ED%94%84%EC%9E%A5',
  price_updated_at = now()
where id = 'gc-312ef6603be3';

-- needs_check: y
-- name: 베이스타즈CC
update public.golf_courses
set
  price_text = '네이버 예약: 130,000원; 189,000원',
  price_min = 130000,
  price_max = 189000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B2%A0%EC%9D%B4%EC%8A%A4%ED%83%80%EC%A6%88CC',
  price_updated_at = now()
where id = 'gc-bb197f80e910';

-- needs_check: y
-- name: 인천그랜드컨트리클럽
update public.golf_courses
set
  price_min = 220000,
  price_max = 260000,
  price_type = 'green_fee',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9D%B8%EC%B2%9C%EA%B7%B8%EB%9E%9C%EB%93%9C%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-60319bf1693c';

-- needs_check: y
-- name: 베르힐CC 영종
update public.golf_courses
set
  price_text = '네이버 예약: 270,000원',
  price_min = 270000,
  price_max = 270000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B2%A0%EB%A5%B4%ED%9E%90CC%20%EC%98%81%EC%A2%85',
  price_updated_at = now()
where id = 'gc-043ae5d51851';

-- needs_check: y
-- name: 디오션CC
update public.golf_courses
set
  price_text = '네이버 예약: 215,000원',
  price_min = 215000,
  price_max = 215000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%94%94%EC%98%A4%EC%85%98CC',
  price_updated_at = now()
where id = 'gc-4c57c6fd7298';

-- needs_check: y
-- name: 포라이즌
update public.golf_courses
set
  price_text = '네이버 예약: 204,000원',
  price_min = 204000,
  price_max = 204000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8F%AC%EB%9D%BC%EC%9D%B4%EC%A6%8C',
  price_updated_at = now()
where id = 'gc-295d6bb19311';

-- needs_check: y
-- name: 파인힐스CC
update public.golf_courses
set
  price_text = '네이버 예약: 125,000원; 135,000원; 155,000원',
  price_min = 125000,
  price_max = 155000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8C%8C%EC%9D%B8%ED%9E%90%EC%8A%A4CC',
  price_updated_at = now()
where id = 'gc-95d86b96417d';

-- needs_check: y
-- name: 순천부영CC
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원',
  price_min = 160000,
  price_max = 160000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%88%9C%EC%B2%9C%EB%B6%80%EC%98%81CC',
  price_updated_at = now()
where id = 'gc-a4b9d0a94686';

-- needs_check: y
-- name: 보성CC
update public.golf_courses
set
  price_text = '네이버 예약: 105,280원; 150,400원',
  price_min = 105280,
  price_max = 150400,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B3%B4%EC%84%B1CC',
  price_updated_at = now()
where id = 'gc-496a04b9cf3f';

-- needs_check: y
-- name: JNJ골프리조트
update public.golf_courses
set
  price_text = '네이버 예약: 122,200원; 141,000원',
  price_min = 122200,
  price_max = 141000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=JNJ%EA%B3%A8%ED%94%84%EB%A6%AC%EC%A1%B0%ED%8A%B8',
  price_updated_at = now()
where id = 'gc-9885ff9a556f';

-- needs_check: y
-- name: 파인비치골프링크스
update public.golf_courses
set
  price_text = '네이버 예약: 220,000원; 260,000원; 300,000원',
  price_min = 220000,
  price_max = 300000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8C%8C%EC%9D%B8%EB%B9%84%EC%B9%98%EA%B3%A8%ED%94%84%EB%A7%81%ED%81%AC%EC%8A%A4',
  price_updated_at = now()
where id = 'gc-437ea8156737';

-- needs_check: y
-- name: 솔라시도CC
update public.golf_courses
set
  price_text = '네이버 예약: 120,000원; 135,000원',
  price_min = 120000,
  price_max = 135000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%86%94%EB%9D%BC%EC%8B%9C%EB%8F%84CC',
  price_updated_at = now()
where id = 'gc-5b534d8afc35';

-- needs_check: y
-- name: 아크로CC
update public.golf_courses
set
  price_text = '네이버 예약: 100,000원; 105,000원; 110,000원; 150,000원',
  price_min = 100000,
  price_max = 150000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%95%84%ED%81%AC%EB%A1%9CCC',
  price_updated_at = now()
where id = 'gc-068d49f9d08c';

-- needs_check: y
-- name: 클린밸리CC
update public.golf_courses
set
  price_text = '네이버 예약: 134,000원',
  price_min = 134000,
  price_max = 134000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%81%B4%EB%A6%B0%EB%B0%B8%EB%A6%ACCC',
  price_updated_at = now()
where id = 'gc-a043a2488af5';

-- needs_check: y
-- name: 웨스트오션CC
update public.golf_courses
set
  price_text = '네이버 예약: 115,000원; 120,000원; 130,000원',
  price_min = 115000,
  price_max = 130000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9B%A8%EC%8A%A4%ED%8A%B8%EC%98%A4%EC%85%98CC',
  price_updated_at = now()
where id = 'gc-cc31ca848991';

-- needs_check: y
-- name: 백양우리CC
update public.golf_courses
set
  price_text = '네이버 예약: 130,000원',
  price_min = 130000,
  price_max = 130000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B0%B1%EC%96%91%EC%9A%B0%EB%A6%ACCC',
  price_updated_at = now()
where id = 'gc-db3f5634c5ee';

-- needs_check: y
-- name: 포세븐금강컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원; 170,000원; 190,000원',
  price_min = 160000,
  price_max = 190000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%8F%AC%EC%84%B8%EB%B8%90%EA%B8%88%EA%B0%95%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-11d936495fd4';

-- needs_check: y
-- name: 내장산골프&리조트
update public.golf_courses
set
  price_text = '네이버 예약: 180,000원',
  price_min = 180000,
  price_max = 180000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%82%B4%EC%9E%A5%EC%82%B0%EA%B3%A8%ED%94%84%26%EB%A6%AC%EC%A1%B0%ED%8A%B8',
  price_updated_at = now()
where id = 'gc-db9ee81a1a70';

-- needs_check: y
-- name: 남원상록골프장
update public.golf_courses
set
  price_text = '네이버 예약: 150,000원',
  price_min = 150000,
  price_max = 150000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%82%A8%EC%9B%90%EC%83%81%EB%A1%9D%EA%B3%A8%ED%94%84%EC%9E%A5',
  price_updated_at = now()
where id = 'gc-555dca97c252';

-- needs_check: y
-- name: 김제스파힐스CC
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원',
  price_min = 160000,
  price_max = 160000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B9%80%EC%A0%9C%EC%8A%A4%ED%8C%8C%ED%9E%90%EC%8A%A4CC',
  price_updated_at = now()
where id = 'gc-8cda6b72d361';

-- needs_check: y
-- name: 더나인골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 119,000원; 129,000원; 139,000원',
  price_min = 119000,
  price_max = 139000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%8D%94%EB%82%98%EC%9D%B8%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-51bc2ed864d2';

-- needs_check: y
-- name: 무주덕유산CC
update public.golf_courses
set
  price_text = '네이버 예약: 180,000원',
  price_min = 180000,
  price_max = 180000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%AC%B4%EC%A3%BC%EB%8D%95%EC%9C%A0%EC%82%B0CC',
  price_updated_at = now()
where id = 'gc-dede5bb789cf';

-- needs_check: y
-- name: 장수골프리조트
update public.golf_courses
set
  price_text = '네이버 예약: 150,400원',
  price_min = 150400,
  price_max = 150400,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9E%A5%EC%88%98%EA%B3%A8%ED%94%84%EB%A6%AC%EC%A1%B0%ED%8A%B8',
  price_updated_at = now()
where id = 'gc-6d636874e191';

-- needs_check: y
-- name: 전주샹그릴라CC
update public.golf_courses
set
  price_text = '네이버 예약: 175,000원; 180,000원',
  price_min = 175000,
  price_max = 180000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%A0%84%EC%A3%BC%EC%83%B9%EA%B7%B8%EB%A6%B4%EB%9D%BCCC',
  price_updated_at = now()
where id = 'gc-a2c85434539e';

-- needs_check: y
-- name: 석정힐CC
update public.golf_courses
set
  price_text = '네이버 예약: 140,000원; 175,000원; 185,000원',
  price_min = 140000,
  price_max = 185000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%84%9D%EC%A0%95%ED%9E%90CC',
  price_updated_at = now()
where id = 'gc-8f5c8d0f5d46';

-- needs_check: y
-- name: 라헨느CC
update public.golf_courses
set
  price_text = '네이버 예약: 120,000원; 130,000원',
  price_min = 120000,
  price_max = 130000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%9D%BC%ED%97%A8%EB%8A%90CC',
  price_updated_at = now()
where id = 'gc-aff117457c45';

-- needs_check: y
-- name: 라온골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 170,000원; 180,000원',
  price_min = 170000,
  price_max = 180000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%9D%BC%EC%98%A8GC',
  price_updated_at = now()
where id = 'gc-0e0131544801';

-- needs_check: y
-- name: 더시에나CC
update public.golf_courses
set
  price_text = '네이버 예약: 175,000원',
  price_min = 175000,
  price_max = 175000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%8D%94%EC%8B%9C%EC%97%90%EB%82%98CC',
  price_updated_at = now()
where id = 'gc-5f82bbc964a8';

-- needs_check: y
-- name: 서귀포팬텀 골프앤리조트
update public.golf_courses
set
  price_text = '네이버 예약: 130,000원',
  price_min = 130000,
  price_max = 130000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%84%9C%EA%B7%80%ED%8F%AC%ED%8C%AC%ED%85%80%20%EA%B3%A8%ED%94%84%EC%95%A4%EB%A6%AC%EC%A1%B0%ED%8A%B8',
  price_updated_at = now()
where id = 'gc-7dcfb1b60ab9';

-- needs_check: y
-- name: 마론컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 180,000원',
  price_min = 180000,
  price_max = 180000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%A7%88%EB%A1%A0%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-2c27b8854e6b';

-- needs_check: y
-- name: 보령베이스CC
update public.golf_courses
set
  price_text = '네이버 예약: 109,000원',
  price_min = 109000,
  price_max = 109000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B3%B4%EB%A0%B9%EB%B2%A0%EC%9D%B4%EC%8A%A4CC',
  price_updated_at = now()
where id = 'gc-5631e69db45e';

-- needs_check: y
-- name: 에스앤 골프리조트
update public.golf_courses
set
  price_text = '네이버 예약: 85,000원; 119,000원',
  price_min = 85000,
  price_max = 119000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%97%90%EC%8A%A4%EC%95%A4%20%EA%B3%A8%ED%94%84%EB%A6%AC%EC%A1%B0%ED%8A%B8',
  price_updated_at = now()
where id = 'gc-de2b5fc511da';

-- needs_check: y
-- name: 서산수 골프앤리조트
update public.golf_courses
set
  price_text = '네이버 예약: 230,000원; 240,000원',
  price_min = 230000,
  price_max = 240000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%84%9C%EC%82%B0%EC%88%98%20%EA%B3%A8%ED%94%84%EC%95%A4%EB%A6%AC%EC%A1%B0%ED%8A%B8',
  price_updated_at = now()
where id = 'gc-c9dda49e7539';

-- needs_check: y
-- name: 더힐 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 90,000원',
  price_min = 90000,
  price_max = 90000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%8D%94%ED%9E%90%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-e3f0db78167a';

-- needs_check: y
-- name: 아리스타 CC
update public.golf_courses
set
  price_text = '네이버 예약: 135,000원; 145,000원; 155,000원',
  price_min = 135000,
  price_max = 155000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%95%84%EB%A6%AC%EC%8A%A4%ED%83%80%20CC',
  price_updated_at = now()
where id = 'gc-c0cdb2271518';

-- needs_check: y
-- name: 에딘버러 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 200,000원',
  price_min = 200000,
  price_max = 200000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%97%90%EB%94%98%EB%B2%84%EB%9F%AC%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-b48ba0827aa2';

-- needs_check: y
-- name: 백제컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원; 180,000원; 190,000원',
  price_min = 160000,
  price_max = 190000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B0%B1%EC%A0%9C%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-19f328d2bc87';

-- needs_check: y
-- name: 솔라고CC
update public.golf_courses
set
  price_text = '네이버 예약: 120,000원; 150,000원; 160,000원; 180,000원; 190,000원; 200,000원',
  price_min = 120000,
  price_max = 200000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%86%94%EB%9D%BC%EA%B3%A0CC',
  price_updated_at = now()
where id = 'gc-167a7f95d402';

-- needs_check: y
-- name: 내포골프클럽
update public.golf_courses
set
  price_text = '네이버 예약: 120,000원; 140,000원',
  price_min = 120000,
  price_max = 140000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%82%B4%ED%8F%AC%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-04b372ccad13';

-- needs_check: y
-- name: 그랜드cc
update public.golf_courses
set
  price_text = '네이버 예약: 140,000원; 150,000원; 155,000원',
  price_min = 140000,
  price_max = 155000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B7%B8%EB%9E%9C%EB%93%9Ccc',
  price_updated_at = now()
where id = 'gc-81f36c789316';

-- needs_check: y
-- name: 세레니티cc
update public.golf_courses
set
  price_text = '네이버 예약: 130,000원; 140,000원; 150,000원; 160,000원; 200,000원',
  price_min = 130000,
  price_max = 200000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%84%B8%EB%A0%88%EB%8B%88%ED%8B%B0cc',
  price_updated_at = now()
where id = 'gc-8ccf3d19f9bb';

-- needs_check: y
-- name: 센테리움cc
update public.golf_courses
set
  price_text = '네이버 예약: 109,000원; 169,000원; 199,000원',
  price_min = 109000,
  price_max = 199000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%84%BC%ED%85%8C%EB%A6%AC%EC%9B%80cc',
  price_updated_at = now()
where id = 'gc-3d68f1ae46e5';

-- needs_check: y
-- name: 대호단양cc
update public.golf_courses
set
  price_text = '네이버 예약: 189,000원',
  price_min = 189000,
  price_max = 189000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%8C%80%ED%98%B8%EB%8B%A8%EC%96%91cc',
  price_updated_at = now()
where id = 'gc-f261ddd7cd1a';

-- needs_check: y
-- name: 오창 에딘버러
update public.golf_courses
set
  price_text = '네이버 예약: 90,000원; 100,000원; 130,000원',
  price_min = 90000,
  price_max = 130000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%98%A4%EC%B0%BD%20%EC%97%90%EB%94%98%EB%B2%84%EB%9F%AC',
  price_updated_at = now()
where id = 'gc-facbcadf0522';

-- needs_check: y
-- name: 이븐데일cc
update public.golf_courses
set
  price_text = '네이버 예약: 114,000원; 118,800원; 123,500원; 128,300원; 133,000원; 175,800원',
  price_min = 114000,
  price_max = 175800,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9D%B4%EB%B8%90%EB%8D%B0%EC%9D%BCcc',
  price_updated_at = now()
where id = 'gc-9c36390d43ba';

-- needs_check: y
-- name: 킹즈락cc
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원; 180,000원; 195,000원',
  price_min = 160000,
  price_max = 195000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%82%B9%EC%A6%88%EB%9D%BDcc',
  price_updated_at = now()
where id = 'gc-717efe03426f';

-- needs_check: y
-- name: 젠스필드cc
update public.golf_courses
set
  price_text = '네이버 예약: 100,000원; 110,000원',
  price_min = 100000,
  price_max = 110000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%A0%A0%EC%8A%A4%ED%95%84%EB%93%9Ccc',
  price_updated_at = now()
where id = 'gc-eec2e96ca1a7';

-- needs_check: y
-- name: 진양밸리cc
update public.golf_courses
set
  price_text = '네이버 예약: 190,000원; 230,000원; 240,000원',
  price_min = 190000,
  price_max = 240000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%A7%84%EC%96%91%EB%B0%B8%EB%A6%ACcc',
  price_updated_at = now()
where id = 'gc-617f2f73c737';

-- needs_check: y
-- name: 코스카cc
update public.golf_courses
set
  price_text = '네이버 예약: 180,000원; 200,000원; 210,000원',
  price_min = 180000,
  price_max = 210000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%BD%94%EC%8A%A4%EC%B9%B4cc',
  price_updated_at = now()
where id = 'gc-e02aaeea09ed';

-- needs_check: y
-- name: 클럽디속리산
update public.golf_courses
set
  price_text = '네이버 예약: 130,000원; 150,000원; 160,000원; 210,000원',
  price_min = 130000,
  price_max = 210000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%81%B4%EB%9F%BD%EB%94%94%EC%86%8D%EB%A6%AC%EC%82%B0',
  price_updated_at = now()
where id = 'gc-914eaef995a0';

-- needs_check: y
-- name: 동 촌cc
update public.golf_courses
set
  price_text = '네이버 예약: 165,000원; 175,000원; 195,000원; 220,000원',
  price_min = 165000,
  price_max = 220000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%8F%99%20%EC%B4%8Ccc',
  price_updated_at = now()
where id = 'gc-2bace244ca44';

-- needs_check: y
-- name: 세 일cc
update public.golf_courses
set
  price_text = '네이버 예약: 149,000원; 155,000원; 160,000원; 170,000원',
  price_min = 149000,
  price_max = 170000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%84%B8%20%EC%9D%BCcc',
  price_updated_at = now()
where id = 'gc-0a89c1c9b286';

-- needs_check: y
-- name: 클럽디보은
update public.golf_courses
set
  price_text = '네이버 예약: 135,000원; 145,000원; 155,000원; 165,000원; 175,000원',
  price_min = 135000,
  price_max = 175000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%81%B4%EB%9F%BD%EB%94%94%EB%B3%B4%EC%9D%80',
  price_updated_at = now()
where id = 'gc-746ebce39dd0';

-- needs_check: y
-- name: 올데이 골프앤리조트
update public.golf_courses
set
  price_text = '네이버 예약: 89,000원; 149,000원',
  price_min = 89000,
  price_max = 149000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%98%AC%EB%8D%B0%EC%9D%B4%20%EA%B3%A8%ED%94%84%EC%95%A4%EB%A6%AC%EC%A1%B0%ED%8A%B8',
  price_updated_at = now()
where id = 'gc-ca6baf196057';

-- needs_check: y
-- name: 감곡CC
update public.golf_courses
set
  price_text = '네이버 예약: 110,000원; 120,000원',
  price_min = 110000,
  price_max = 120000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B0%90%EA%B3%A1CC',
  price_updated_at = now()
where id = 'gc-b86dec31683a';

-- needs_check: y
-- name: 일라이트 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 100,000원; 130,000원; 140,000원; 155,000원; 160,000원; 170,000원; 190,000원',
  price_min = 100000,
  price_max = 190000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9D%BC%EB%9D%BC%EC%9D%B4%ED%8A%B8%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-a8e246e93ac3';

-- needs_check: y
-- name: 일레븐cc
update public.golf_courses
set
  price_text = '네이버 예약: 130,000원; 140,000원',
  price_min = 130000,
  price_max = 140000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9D%BC%EB%A0%88%EB%B8%90cc',
  price_updated_at = now()
where id = 'gc-e14661a32922';

-- needs_check: y
-- name: 킹스데일cc
update public.golf_courses
set
  price_text = '네이버 예약: 230,000원; 240,000원',
  price_min = 230000,
  price_max = 240000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%82%B9%EC%8A%A4%EB%8D%B0%EC%9D%BCcc',
  price_updated_at = now()
where id = 'gc-8d9ee33d1f22';

-- needs_check: y
-- name: 음성 힐데스하임cc
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원; 180,000원',
  price_min = 160000,
  price_max = 180000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9D%8C%EC%84%B1%20%ED%9E%90%EB%8D%B0%EC%8A%A4%ED%95%98%EC%9E%84cc',
  price_updated_at = now()
where id = 'gc-cf2911a3e910';

-- needs_check: y
-- name: 세레니티cc
update public.golf_courses
set
  price_text = '네이버 예약: 130,000원; 140,000원; 150,000원; 160,000원; 200,000원',
  price_min = 130000,
  price_max = 200000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%84%B8%EB%A0%88%EB%8B%88%ED%8B%B0cc',
  price_updated_at = now()
where id = 'gc-736ecb0e589a';

-- needs_check: y
-- name: 해피니스CC (대중제)
update public.golf_courses
set
  price_text = '네이버 예약: 115,000원; 120,000원; 125,000원; 130,000원; 135,000원; 140,000원; 160,000원',
  price_min = 115000,
  price_max = 160000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%ED%95%B4%ED%94%BC%EB%8B%88%EC%8A%A4CC',
  price_updated_at = now()
where id = 'gc-53f5c270575b';

-- needs_check: y
-- name: 시그너스cc
update public.golf_courses
set
  price_text = '네이버 예약: 160,000원',
  price_min = 160000,
  price_max = 160000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%8B%9C%EA%B7%B8%EB%84%88%EC%8A%A4cc',
  price_updated_at = now()
where id = 'gc-1ce1b36ed2da';

-- needs_check: y
-- name: 골프존카운티 안성H
update public.golf_courses
set
  price_text = '네이버 예약: 170,000원; 220,000원',
  price_min = 170000,
  price_max = 220000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%EC%A1%B4%EC%B9%B4%EC%9A%B4%ED%8B%B0%20%EC%95%88%EC%84%B1H',
  price_updated_at = now()
where id = 'gc-ba3362c686e4';

-- needs_check: y
-- name: 골프존카운티 안성W
update public.golf_courses
set
  price_text = '네이버 예약: 140,000원; 190,000원; 220,000원',
  price_min = 140000,
  price_max = 220000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%EC%A1%B4%EC%B9%B4%EC%9A%B4%ED%8B%B0%20%EC%95%88%EC%84%B1W',
  price_updated_at = now()
where id = 'gc-411771a420e7';

-- needs_check: y
-- name: 밀양에스파크골프리조트
update public.golf_courses
set
  price_text = '네이버 예약: 140,000원; 180,000원; 190,000원',
  price_min = 140000,
  price_max = 190000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%B0%80%EC%96%91%EC%97%90%EC%8A%A4%ED%8C%8C%ED%81%AC%EA%B3%A8%ED%94%84%EB%A6%AC%EC%A1%B0%ED%8A%B8',
  price_updated_at = now()
where id = 'gc-968de8ceffeb';

-- needs_check: y
-- name: 골프존카운티 경남
update public.golf_courses
set
  price_text = '네이버 예약: 133,000원',
  price_min = 133000,
  price_max = 133000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%EC%A1%B4%EC%B9%B4%EC%9A%B4%ED%8B%B0%20%EA%B2%BD%EB%82%A8',
  price_updated_at = now()
where id = 'gc-09693194d3fb';

-- needs_check: y
-- name: 골프존카운티 청통
update public.golf_courses
set
  price_text = '네이버 예약: 101,000원; 142,000원',
  price_min = 101000,
  price_max = 142000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%EC%A1%B4%EC%B9%B4%EC%9A%B4%ED%8B%B0%20%EC%B2%AD%ED%86%B5',
  price_updated_at = now()
where id = 'gc-01d6a94bf335';

-- needs_check: y
-- name: 골프존카운티 송도 골프장
update public.golf_courses
set
  price_text = '네이버 예약: 169,000원; 209,000원; 259,000원; 269,000원',
  price_min = 169000,
  price_max = 269000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%EC%A1%B4%EC%B9%B4%EC%9A%B4%ED%8B%B0%20%EC%86%A1%EB%8F%84',
  price_updated_at = now()
where id = 'gc-4005648f63d2';

-- needs_check: y
-- name: 골프존카운티무주
update public.golf_courses
set
  price_text = '네이버 예약: 111,000원',
  price_min = 111000,
  price_max = 111000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%EC%A1%B4%EC%B9%B4%EC%9A%B4%ED%8B%B0%EB%AC%B4%EC%A3%BC',
  price_updated_at = now()
where id = 'gc-2a867c283a2c';

-- needs_check: y
-- name: 골프존카운티선운
update public.golf_courses
set
  price_text = '네이버 예약: 131,000원; 141,000원; 151,000원',
  price_min = 131000,
  price_max = 151000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%EC%A1%B4%EC%B9%B4%EC%9A%B4%ED%8B%B0%EC%84%A0%EC%9A%B4',
  price_updated_at = now()
where id = 'gc-1f1578e897f2';

-- needs_check: y
-- name: 골프존카운티 천안
update public.golf_courses
set
  price_text = '네이버 예약: 120,000원',
  price_min = 120000,
  price_max = 120000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%EC%A1%B4%EC%B9%B4%EC%9A%B4%ED%8B%B0%20%EC%B2%9C%EC%95%88',
  price_updated_at = now()
where id = 'gc-adeec421c374';

-- needs_check: y
-- name: 골프존카운티 진천cc
update public.golf_courses
set
  price_text = '네이버 예약: 118,000원; 127,000원; 136,000원',
  price_min = 118000,
  price_max = 136000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%EC%A1%B4%EC%B9%B4%EC%9A%B4%ED%8B%B0%20%EC%A7%84%EC%B2%9Ccc',
  price_updated_at = now()
where id = 'gc-226b2263c6f6';

-- needs_check: y
-- name: 골프존카운티 화랑cc
update public.golf_courses
set
  price_text = '네이버 예약: 99,000원; 105,000원; 111,000원; 159,000원',
  price_min = 99000,
  price_max = 159000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%EC%A1%B4%EC%B9%B4%EC%9A%B4%ED%8B%B0%20%ED%99%94%EB%9E%91cc',
  price_updated_at = now()
where id = 'gc-ab22b2f16924';

-- needs_check: y
-- name: 골프존 카운티 드래곤
update public.golf_courses
set
  price_text = '네이버 예약: 151,000원; 161,000원',
  price_min = 151000,
  price_max = 161000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EA%B3%A8%ED%94%84%EC%A1%B4%20%EC%B9%B4%EC%9A%B4%ED%8B%B0%20%EB%93%9C%EB%9E%98%EA%B3%A4',
  price_updated_at = now()
where id = 'gc-01762fe809b0';

-- ok
-- name: 더스타휴 컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 90,970원',
  price_min = 90970,
  price_max = 90970,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EB%8D%94%EC%8A%A4%ED%83%80%ED%9C%B4%20%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-a15f33b9f89a';

-- ok
-- name: 웅포컨트리클럽
update public.golf_courses
set
  price_text = '네이버 예약: 150,000원; 170,000원; 180,000원',
  price_min = 150000,
  price_max = 180000,
  price_type = 'reservation_price',
  price_source_url = 'https://search.naver.com/search.naver?where=nexearch&query=%EC%9B%85%ED%8F%AC%EC%BB%A8%ED%8A%B8%EB%A6%AC%ED%81%B4%EB%9F%BD',
  price_updated_at = now()
where id = 'gc-45a6c468cd91';
