-- Delta enrichment update SQL (rename + fill missing phone/homepage)
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

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 힐스카이C.C
-- change_name_to: 힐스카이CC
update public.golf_courses
set
  name = '힐스카이CC',
  phone = '1811-0770',
  homepage_url = 'https://www.hillskycc.com'
where id = 'gc-6b7f785d4813';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 안동리버힐C.C
-- change_name_to: 안동리버힐CC
update public.golf_courses
set
  name = '안동리버힐CC',
  phone = '054-843-1256',
  homepage_url = 'https://www.xn--2q1bm4ioscnwnx4w.com/'
where id = 'gc-9adfe4aa2a07';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 뉴스프링빌Ⅱ
-- change_name_to: 뉴스프링빌2CC
update public.golf_courses
set
  name = '뉴스프링빌2CC',
  phone = '02-2285-1700',
  homepage_url = 'http://www.newspring.co.kr/'
where id = 'gc-1730ca5fe304';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 파라지오C.C
-- change_name_to: 파라지오CC
update public.golf_courses
set
  name = '파라지오CC',
  phone = '054-833-7100',
  homepage_url = 'http://paragio.co.kr'
where id = 'gc-5607a255716b';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 파미힐스C.C
-- change_name_to: 파미힐스CC
update public.golf_courses
set
  name = '파미힐스CC',
  phone = '054-971-9900',
  homepage_url = 'http://www.palmyhillscc.co.kr/'
where id = 'gc-66dd9ef01893';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 울산골프장
-- change_name_to: 울산CC
update public.golf_courses
set
  name = '울산CC',
  phone = '052-225-0707',
  homepage_url = 'http://www.ulsancc.co.kr/'
where id = 'gc-3d725200e925';

-- needs_check: y | fill phone, fill homepage
-- original_name: 순천CC
-- change_name_to: 순천CC
update public.golf_courses
set
  phone = '061-720-0000',
  homepage_url = 'http://suncheoncc.co.kr/'
where id = 'gc-dfddaf985536';

-- needs_check: y | fill phone, fill homepage
-- original_name: 화순CC
-- change_name_to: 화순CC
update public.golf_courses
set
  phone = '061-373-9955',
  homepage_url = 'http://www.hwasuncc.co.kr/'
where id = 'gc-a6fee0f415b7';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 에스지아름다운골프&리조트
-- change_name_to: SG아름다운골프&리조트
update public.golf_courses
set
  name = 'SG아름다운골프&리조트',
  phone = '041-536-8000',
  homepage_url = 'http://www.arumdaunresort.com/'
where id = 'gc-7c044b23d1a4';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: ㈜호텔롯데 스카이힐 부여CC
-- change_name_to: 롯데스카이힐부여CC
update public.golf_courses
set
  name = '롯데스카이힐부여CC',
  phone = '041-939-1700',
  homepage_url = 'https://www.lotteskyhill.com/club/club-intro/club-intro-buyeo'
where id = 'gc-41c9fac17790';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 힐마루컨트리클럽 (대중제)
-- change_name_to: 힐마루CC(퍼블릭)
update public.golf_courses
set
  name = '힐마루CC(퍼블릭)',
  phone = '055-520-8000',
  homepage_url = 'http://www.hillmaru.com/'
where id = 'gc-98e3f829ab99';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 오션힐스포항C.C (대중제)
-- change_name_to: 오션힐스 포항CC
update public.golf_courses
set
  name = '오션힐스 포항CC',
  phone = '054-262-9988',
  homepage_url = 'https://oceanhills.com/'
where id = 'gc-43ee7ee149ba';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 엘리시안제주 (회원제)
-- change_name_to: 엘리시안제주(퍼블릭)
update public.golf_courses
set
  name = '엘리시안제주(퍼블릭)',
  phone = '064-798-7000',
  homepage_url = 'https://www.elysian.co.kr/intro'
where id = 'gc-7ef835cc44ce';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 에버리스CC (대중제)
-- change_name_to: 에버리스GR(퍼블릭)
update public.golf_courses
set
  name = '에버리스GR(퍼블릭)',
  phone = '064-795-5000',
  homepage_url = 'https://www.shinangolf.com/'
where id = 'gc-57d2cac587d2';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 캐슬렉스제주 (대중제)
-- change_name_to: 캐슬렉스제주(퍼블릭)
update public.golf_courses
set
  name = '캐슬렉스제주(퍼블릭)',
  phone = '064-793-6630',
  homepage_url = 'http://www.castlexjj.com/'
where id = 'gc-8c893fc692ea';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 해비치CC (대중제)
-- change_name_to: 해비치CC(퍼블릭)
update public.golf_courses
set
  name = '해비치CC(퍼블릭)',
  phone = '064-766-6200',
  homepage_url = 'https://www.haevichi.com/ccjeju/ko/'
where id = 'gc-a34d1218714a';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 소노펠리체 컨트리클럽 비발디파크 이스트
-- change_name_to: 소노펠리체CC 비발디파크 EAST
update public.golf_courses
set
  name = '소노펠리체CC 비발디파크 EAST',
  phone = '1644-0063',
  homepage_url = 'https://www.sonofelicecc.com/sn/'
where id = 'gc-ae905ec6b25f';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 웰리힐리퍼블릭
-- change_name_to: 웰리힐리CC
update public.golf_courses
set
  name = '웰리힐리CC',
  phone = '1544-8833',
  homepage_url = 'http://www.wellihillipark.com/wellihillicc/'
where id = 'gc-ec8024eb7955';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 블루헤런G.C
-- change_name_to: 블루헤런GC
update public.golf_courses
set
  name = '블루헤런GC',
  phone = '031-880-0700',
  homepage_url = 'https://www.blueheron.co.kr/'
where id = 'gc-07b4c0178c39';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 사우스케이프오너스클럽
-- change_name_to: 사우스케이프CC
update public.golf_courses
set
  name = '사우스케이프CC',
  phone = '1644-0280',
  homepage_url = 'https://www.southcape.co.kr/golf.asp'
where id = 'gc-69fe3eb3e177';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 거창친환경대중골프장
-- change_name_to: 거창CC
update public.golf_courses
set
  name = '거창CC',
  phone = '055-940-7979',
  homepage_url = 'https://www.geochang.go.kr/golf/common/main.do'
where id = 'gc-cd6b63162f39';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 경주C.C
-- change_name_to: 경주CC
update public.golf_courses
set
  name = '경주CC',
  phone = '054-778-8900',
  homepage_url = 'http://www.kyongjugolf.co.kr/'
where id = 'gc-a1d37ac059d4';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 우리G.C
-- change_name_to: 우리GC
update public.golf_courses
set
  name = '우리GC',
  phone = '054-740-0800',
  homepage_url = 'http://urigolfclub.co.kr'
where id = 'gc-130f7b88bcf3';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 오션힐스청도G.C
-- change_name_to: 오션힐스 청도GC
update public.golf_courses
set
  name = '오션힐스 청도GC',
  phone = '0507-1375-5620',
  homepage_url = 'https://oceanhills.com/'
where id = 'gc-29c208d17553';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 에콜리안광산골프장
-- change_name_to: 광산CC
update public.golf_courses
set
  name = '광산CC',
  phone = '062-616-5870',
  homepage_url = 'https://www.gwangsancc.kr/'
where id = 'gc-2159121d90f9';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 클럽72(바다)
-- change_name_to: 클럽72CC
update public.golf_courses
set
  name = '클럽72CC',
  phone = '1599-0072',
  homepage_url = 'https://www.onetheclub.com/'
where id = 'gc-b0d53a657195';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 클럽72(하늘)
-- change_name_to: 클럽72CC(하늘)
update public.golf_courses
set
  name = '클럽72CC(하늘)',
  phone = '1599-0072',
  homepage_url = 'https://www.onetheclub.com/'
where id = 'gc-a7bb99a4bcec';

-- needs_check: y | fill phone, fill homepage
-- original_name: 다산베아채골프&리조트
-- change_name_to: 다산베아채골프&리조트
update public.golf_courses
set
  phone = '061-430-9999',
  homepage_url = 'http://www.beachegolf.com'
where id = 'gc-d5a6f91a588a';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 천지CC
-- change_name_to: 함평천지CC
update public.golf_courses
set
  name = '함평천지CC',
  phone = '0507-1439-0000',
  homepage_url = 'http://www.hpnabicc.co.kr'
where id = 'gc-c8fc5eccf7b9';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 떼제베운영
-- change_name_to: 올데이청주떼제베
update public.golf_courses
set
  name = '올데이청주떼제베',
  phone = '043-262-5000',
  homepage_url = 'https://www.adtgv.co.kr/'
where id = 'gc-606fb4b33249';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 블랙스톤cc
-- change_name_to: 블랙스톤CC
update public.golf_courses
set
  name = '블랙스톤CC',
  phone = '031-643-2000',
  homepage_url = 'https://www.blackstoneresort.com/ic/'
where id = 'gc-97d5d758dc31';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 아난티클럽제주 (대중제)
-- change_name_to: 아난티클럽제주(퍼블릭)
update public.golf_courses
set
  name = '아난티클럽제주(퍼블릭)',
  phone = '064-786-3800',
  homepage_url = 'https://ananti.kr/ko/jeju'
where id = 'gc-ce976348ba8f';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 롯데스카이힐제주 (대중제)
-- change_name_to: 롯데스카이힐제주CC
update public.golf_courses
set
  name = '롯데스카이힐제주CC',
  phone = '064-731-2000',
  homepage_url = 'https://www.lotteskyhill.com/club/club-intro/club-intro-jeju'
where id = 'gc-4d1cbdf3ceb2';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 여수시티파크골프&호텔
-- change_name_to: 여수시티파크리조트골프장
update public.golf_courses
set
  name = '여수시티파크리조트골프장',
  phone = '061-808-8000',
  homepage_url = 'http://www.citypark.co.kr/'
where id = 'gc-ae299d74ffe4';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 메이플비치골프&리조트
-- change_name_to: 메이플비치골프앤리조트 CC
update public.golf_courses
set
  name = '메이플비치골프앤리조트 CC',
  phone = '033-650-0020',
  homepage_url = 'https://maplebeach.co.kr/'
where id = 'gc-b768a2002431';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: O2리조트 퍼블릭골프장
-- change_name_to: 오투리조트CC
update public.golf_courses
set
  name = '오투리조트CC',
  phone = '033-580-7700',
  homepage_url = 'http://www.o2resort.com/main.xhtml'
where id = 'gc-e6edfdd39527';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 벨라45 오너스 컨트리클럽
-- change_name_to: 벨라45 컨트리클럽
update public.golf_courses
set
  name = '벨라45 컨트리클럽',
  phone = '1551-2745',
  homepage_url = 'https://www.bella45.com/'
where id = 'gc-fac50b03683e';

-- needs_check: y | fill phone
-- original_name: 용평리조트골프클럽
update public.golf_courses
set
  phone = '033-330-7611'
where id = 'gc-11423b427515';

-- needs_check: y | fill phone
-- original_name: 용평버치힐골프클럽
update public.golf_courses
set
  phone = '033-330-8623'
where id = 'gc-1e4b4a02117e';

-- needs_check: y | fill phone
-- original_name: 용평리조트대중골프장
update public.golf_courses
set
  phone = '02-3270-1245'
where id = 'gc-07cd3007c683';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 플라자CC
-- change_name_to: 플라자CC 용인
update public.golf_courses
set
  name = '플라자CC 용인',
  phone = '031-323-3311',
  homepage_url = 'http://www.plazacc.co.kr/'
where id = 'gc-4af8a2f8ed32';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 태광컨트리클럽(회원제)
-- change_name_to: 태광CC(회원제)
update public.golf_courses
set
  name = '태광CC(회원제)',
  phone = '070-8189-6001',
  homepage_url = 'https://www.taekwangcc.co.kr/'
where id = 'gc-9da6f2a0f2d9';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 태광컨트리클럽(대중제)
-- change_name_to: 태광CC(퍼블릭)
update public.golf_courses
set
  name = '태광CC(퍼블릭)',
  phone = '070-8189-6001',
  homepage_url = 'https://www.taekwangcc.co.kr/'
where id = 'gc-3d63d3179c0f';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 국가보훈부 88골프장
-- change_name_to: 88CC
update public.golf_courses
set
  name = '88CC',
  phone = '031-287-8811',
  homepage_url = 'https://www.88countryclub.co.kr/'
where id = 'gc-0f218a599984';

-- needs_check: y | fill phone, fill homepage
-- original_name: 레이크사이드CC(회원제)
-- change_name_to: 레이크사이드CC(회원제)
update public.golf_courses
set
  phone = '031-334-2111',
  homepage_url = 'http://www.lakeside.kr/'
where id = 'gc-588d348bc962';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 블루원용인CC(비회원제)
-- change_name_to: 블루원용인CC(퍼블릭)
update public.golf_courses
set
  name = '블루원용인CC(퍼블릭)',
  phone = '1899-1888',
  homepage_url = 'http://yi.blueone.com/'
where id = 'gc-2ef4e18d677b';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 코리아대중CC
-- change_name_to: 코리아퍼블릭CC
update public.golf_courses
set
  name = '코리아퍼블릭CC',
  phone = '031-286-9500',
  homepage_url = 'https://www.gakorea.com'
where id = 'gc-4487ee52808c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 지산퍼블릭
-- change_name_to: 지산퍼블릭
update public.golf_courses
set
  phone = '031-330-1400',
  homepage_url = 'https://www.jisanresort.co.kr'
where id = 'gc-4687a4044d34';

-- needs_check: y | fill phone, fill homepage
-- original_name: 고양컨트리클럽
-- change_name_to: 고양컨트리클럽
update public.golf_courses
set
  phone = '031-960-7700',
  homepage_url = 'https://www.goyangcc.com/index'
where id = 'gc-8fbc2ee961a0';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 1·2·3 골프장
-- change_name_to: 123골프클럽
update public.golf_courses
set
  name = '123골프클럽',
  phone = '02-359-0123',
  homepage_url = 'http://www.123golfclub.co.kr/'
where id = 'gc-a80360466b97';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 발리오스컨트리클럽(회원제)
-- change_name_to: 발리오스CC(회원제)
update public.golf_courses
set
  name = '발리오스CC(회원제)',
  phone = '031-352-5061',
  homepage_url = 'http://baliosgc.com/index.asp'
where id = 'gc-ccb45b4f27e1';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 발리오스컨트리클럽(비회원제)
-- change_name_to: 발리오스CC(퍼블릭, 남코스)
update public.golf_courses
set
  name = '발리오스CC(퍼블릭, 남코스)',
  phone = '031-352-5061',
  homepage_url = 'http://baliosgc.com/index.asp'
where id = 'gc-2db2d6cad688';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 화성 상록G.C
-- change_name_to: 화성상록GC
update public.golf_courses
set
  name = '화성상록GC',
  phone = '031-371-0100',
  homepage_url = 'https://www.sangnokresort.co.kr/M050000'
where id = 'gc-4905c6ca9b75';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 광릉CC(회원제)
-- change_name_to: 한림광릉CC(회원제)
update public.golf_courses
set
  name = '한림광릉CC(회원제)',
  phone = '031-528-7001',
  homepage_url = 'http://www.kwangneungcc.co.kr/'
where id = 'gc-73a2a3982c35';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 광릉CC(비회원제)
-- change_name_to: 한림광릉CC(퍼블릭)
update public.golf_courses
set
  name = '한림광릉CC(퍼블릭)',
  phone = '031-528-7001',
  homepage_url = 'http://www.kwangneungcc.co.kr/'
where id = 'gc-66517960c8f8';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 더헤븐 컨트리클럽
-- change_name_to: 더헤븐CC
update public.golf_courses
set
  name = '더헤븐CC',
  phone = '032-884-1004',
  homepage_url = 'https://www.theheavenresort.com/'
where id = 'gc-63e74643a178';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 파주 J-Public 골프장
-- change_name_to: 파주제이퍼블릭골프클럽
update public.golf_courses
set
  name = '파주제이퍼블릭골프클럽',
  phone = '031-8071-0808',
  homepage_url = 'http://www.jpublic.co.kr/'
where id = 'gc-81becbdb274e';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 파주컨트리클럽
-- change_name_to: 원더클럽 파주CC
update public.golf_courses
set
  name = '원더클럽 파주CC',
  phone = '031-959-9999',
  homepage_url = 'https://www.onetheclub.com'
where id = 'gc-34f4d067cfc2';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 타이거CC 골프장
-- change_name_to: 타이거CC
update public.golf_courses
set
  name = '타이거CC',
  phone = '031-958-8900',
  homepage_url = 'http://www.tigercc.co.kr/'
where id = 'gc-9eb46dae9c9d';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 레이크우드 골프장(회원제)
-- change_name_to: 레이크우드CC(회원제)
update public.golf_courses
set
  name = '레이크우드CC(회원제)',
  phone = '031-820-1500',
  homepage_url = 'https://lakewood.co.kr/'
where id = 'gc-f2cf5d51eba9';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 레이크우드 골프장(비회원제)
-- change_name_to: 레이크우드CC(퍼블릭)
update public.golf_courses
set
  name = '레이크우드CC(퍼블릭)',
  phone = '031-820-1500',
  homepage_url = 'https://lakewood.co.kr/'
where id = 'gc-310ce4be2e54';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 비에이비스타컨트리클럽(비회원)
-- change_name_to: 비에이비스타CC(퍼블릭)
update public.golf_courses
set
  name = '비에이비스타CC(퍼블릭)',
  phone = '031-636-3577',
  homepage_url = 'http://www.bavista.co.kr/'
where id = 'gc-2f2cc6b9afe3';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 사우스스프링스C.C
-- change_name_to: 사우스스프링스CC
update public.golf_courses
set
  name = '사우스스프링스CC',
  phone = '031-630-7000',
  homepage_url = 'https://www.sscc.co.kr/'
where id = 'gc-06bb9165507c';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 블랙스톤골프장(회원제)
-- change_name_to: 블랙스톤CC
update public.golf_courses
set
  name = '블랙스톤CC',
  phone = '031-643-2000',
  homepage_url = 'https://www.blackstoneresort.com/ic/'
where id = 'gc-014659dabae9';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 이천실크밸리골프클럽
-- change_name_to: 이천실크밸리GC
update public.golf_courses
set
  name = '이천실크밸리GC',
  phone = '031-639-0077',
  homepage_url = 'http://silkvalleygc.co.kr/'
where id = 'gc-403c1dbe574a';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 마이다스레이크 이천 골프&리조트
-- change_name_to: 마이다스레이크 이천 골프앤리조트
update public.golf_courses
set
  name = '마이다스레이크 이천 골프앤리조트',
  phone = '031-640-0123',
  homepage_url = 'http://www.midasgolf.co.kr'
where id = 'gc-fde386e28664';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 파인크리크C.C
-- change_name_to: 파인크리크CC
update public.golf_courses
set
  name = '파인크리크CC',
  phone = '031-672-0071',
  homepage_url = 'http://www.tyleisure.co.kr'
where id = 'gc-cd449267e87f';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 안성컨트리클럽
-- change_name_to: 안성CC
update public.golf_courses
set
  name = '안성CC',
  phone = '031-674-9111',
  homepage_url = 'http://www.ansungcc.co.kr/'
where id = 'gc-adc16ee54b54';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 포천아도니스 C.C
-- change_name_to: 포천아도니스CC
update public.golf_courses
set
  name = '포천아도니스CC',
  phone = '031-530-9100',
  homepage_url = 'http://www.adoniscc.co.kr/'
where id = 'gc-4884a38f1896';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 포천아도니스 대중골프장
-- change_name_to: 포천아도니스CC 퍼블릭
update public.golf_courses
set
  name = '포천아도니스CC 퍼블릭',
  phone = '031-530-9100',
  homepage_url = 'http://www.adoniscc.co.kr/'
where id = 'gc-e2614722e86e';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 몽베르 컨트리클럽(회원제)
-- change_name_to: 몽베르CC(회원제)
update public.golf_courses
set
  name = '몽베르CC(회원제)',
  phone = '031-531-1100',
  homepage_url = 'http://www.montvertcc.com/'
where id = 'gc-1914b4243487';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 일동레이크대중제골프장
-- change_name_to: 일동레이크GC
update public.golf_courses
set
  name = '일동레이크GC',
  phone = '031-539-5900',
  homepage_url = 'http://www.ildonglakes.co.kr/'
where id = 'gc-d569726d2503';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 자유컨트리클럽
-- change_name_to: 자유CC
update public.golf_courses
set
  name = '자유CC',
  phone = '031-887-7700',
  homepage_url = 'https://www.jayucc.co.kr/'
where id = 'gc-51bfec26aa96';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 렉스필드 컨트리클럽(회원)
-- change_name_to: 렉스필드CC(회원제)
update public.golf_courses
set
  name = '렉스필드CC(회원제)',
  phone = '031-880-8700',
  homepage_url = 'https://www.rexfield.com/'
where id = 'gc-61ba4f976442';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 렉스필드 컨트리클럽(비회원)
-- change_name_to: 렉스필드CC(퍼블릭)
update public.golf_courses
set
  name = '렉스필드CC(퍼블릭)',
  phone = '031-880-8700',
  homepage_url = 'https://www.rexfield.com/'
where id = 'gc-657d8f5d1426';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 스카이밸리골프장(회원)
-- change_name_to: 스카이밸리CC(회원제)
update public.golf_courses
set
  name = '스카이밸리CC(회원제)',
  phone = '031-880-8800',
  homepage_url = 'http://www.skyvalley.co.kr/'
where id = 'gc-ddb3947686d1';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 캐슬파인골프클럽
-- change_name_to: 캐슬파인GC
update public.golf_courses
set
  name = '캐슬파인GC',
  phone = '031-880-8656',
  homepage_url = 'http://www.castlepine.co.kr/'
where id = 'gc-2cf253808f7a';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 썬힐G.C
-- change_name_to: 썬힐GC
update public.golf_courses
set
  name = '썬힐GC',
  phone = '031-585-7900',
  homepage_url = 'http://www.sunhillgolf.co.kr/'
where id = 'gc-d14f87b6bb30';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아난티클럽서울
-- change_name_to: 아난티클럽서울
update public.golf_courses
set
  phone = '031-589-3000',
  homepage_url = 'https://ananti.kr/ko/chord/CD0201'
where id = 'gc-aa2c41b33610';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 가평 베네스트G.C
-- change_name_to: 가평 베네스트GC
update public.golf_courses
set
  name = '가평 베네스트GC',
  phone = '1577-9727',
  homepage_url = 'https://www.benestgolf.com'
where id = 'gc-a8d0095f2145';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 리앤리C.C
-- change_name_to: 리앤리CC
update public.golf_courses
set
  name = '리앤리CC',
  phone = '031-580-9000',
  homepage_url = 'http://www.leenleecc.co.kr/'
where id = 'gc-8503021b2f0d';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 에덴밸리컨트리클럽
-- change_name_to: 골프존카운티 이든
update public.golf_courses
set
  name = '골프존카운티 이든',
  phone = '055-379-9000',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=70'
where id = 'gc-68d69c3be5e4';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 고성노벨컨트리클럽
-- change_name_to: 노벨컨트리클럽
update public.golf_courses
set
  name = '노벨컨트리클럽',
  phone = '055-670-8000',
  homepage_url = 'https://www.nobelcc.co.kr/'
where id = 'gc-60336c4fc30b';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 청하이스턴C.C
-- change_name_to: 이스턴CC
update public.golf_courses
set
  name = '이스턴CC',
  phone = '054-253-0070',
  homepage_url = 'https://www.easterncc.co.kr/'
where id = 'gc-dd8a710bd41c';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 경주신라C.C
-- change_name_to: 경주신라CC
update public.golf_courses
set
  name = '경주신라CC',
  phone = '054-740-7114',
  homepage_url = 'http://www.sillacc.co.kr/'
where id = 'gc-4fc6d117b7f4';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 마우나오션C.C
-- change_name_to: 마우나오션CC
update public.golf_courses
set
  name = '마우나오션CC',
  phone = '054-740-0678',
  homepage_url = 'http://www.mauna.co.kr'
where id = 'gc-4826ba3e38b9';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 마우나오션블루
-- change_name_to: 마우나오션CC
update public.golf_courses
set
  name = '마우나오션CC',
  phone = '054-740-0678',
  homepage_url = 'http://www.mauna.co.kr'
where id = 'gc-16c25d6f3f20';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 가든골프클럽
-- change_name_to: 코오롱호텔 가든 골프장
update public.golf_courses
set
  name = '코오롱호텔 가든 골프장',
  phone = '054-746-7900',
  homepage_url = 'https://kolongolf.com/'
where id = 'gc-eb9124b06908';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 디아너스C.C
-- change_name_to: 강동디아너스CC
update public.golf_courses
set
  name = '강동디아너스CC',
  phone = '1588-0776',
  homepage_url = 'https://gj.kangdongcnl.com/'
where id = 'gc-881d18bae24f';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 선리치G.C
-- change_name_to: 선리치골프클럽
update public.golf_courses
set
  name = '선리치골프클럽',
  phone = '054-777-3333',
  homepage_url = 'http://www.sunrichgc.com/'
where id = 'gc-e67c48835b2a';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 이스트힐C.C
-- change_name_to: 이스트힐컨트리클럽
update public.golf_courses
set
  name = '이스트힐컨트리클럽',
  phone = '054-775-1700',
  homepage_url = 'https://www.easthills.co.kr/main/'
where id = 'gc-d69bb1cfadc7';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 애플밸리C.C
-- change_name_to: 애플밸리CC
update public.golf_courses
set
  name = '애플밸리CC',
  phone = '054-429-0700',
  homepage_url = 'https://www.applevalley.co.kr'
where id = 'gc-bd2c2f813e31';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 포도C.C
-- change_name_to: 김천포도CC
update public.golf_courses
set
  name = '김천포도CC',
  phone = '054-420-0200',
  homepage_url = 'http://www.podocc.com'
where id = 'gc-1e3e002ab2ce';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 남안동C.C
-- change_name_to: 남안동CC
update public.golf_courses
set
  name = '남안동CC',
  phone = '054-850-2800',
  homepage_url = 'https://www.namandongcc.com/'
where id = 'gc-8894492ab1a6';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 구미C.C
-- change_name_to: 구미CC
update public.golf_courses
set
  name = '구미CC',
  phone = '054-470-6800',
  homepage_url = 'http://www.gumicc.com/'
where id = 'gc-ddc7e02567ba';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 영천C.C
-- change_name_to: 오션힐스 영천CC
update public.golf_courses
set
  name = '오션힐스 영천CC',
  phone = '054-330-9000',
  homepage_url = 'https://oceanhills.com/'
where id = 'gc-f7e7bf534d31';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 시엘G.C
-- change_name_to: 시엘GC
update public.golf_courses
set
  name = '시엘GC',
  phone = '054-336-7200',
  homepage_url = 'http://www.cielgolf.com/'
where id = 'gc-206bb0d5628c';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 문경레저타운골프장
-- change_name_to: 문경GC
update public.golf_courses
set
  name = '문경GC',
  phone = '054-550-5000',
  homepage_url = 'http://www.mgle.co.kr/'
where id = 'gc-77f7a5893fb0';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 대구C.C
-- change_name_to: 대구컨트리클럽
update public.golf_courses
set
  name = '대구컨트리클럽',
  phone = '053-854-0002',
  homepage_url = 'http://www.daegucc.co.kr/'
where id = 'gc-fe29a1584040';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 오션비치C.C
-- change_name_to: 오션비치 골프앤리조트
update public.golf_courses
set
  name = '오션비치 골프앤리조트',
  phone = '054-730-9000',
  homepage_url = 'https://www.oceanbeachcc.com/'
where id = 'gc-c781c317ede3';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 그레이스C.C
-- change_name_to: 그레이스CC
update public.golf_courses
set
  name = '그레이스CC',
  phone = '054-370-3000',
  homepage_url = 'http://www.grace-cc.co.kr/'
where id = 'gc-911caf331754';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 유니밸리C.C
-- change_name_to: 고령유니밸리CC
update public.golf_courses
set
  name = '고령유니밸리CC',
  phone = '054-956-7575',
  homepage_url = 'http://www.univalley.co.kr/'
where id = 'gc-0665bc0c6cce';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 세븐밸리C.C
-- change_name_to: 세븐밸리CC
update public.golf_courses
set
  name = '세븐밸리CC',
  phone = '054-979-1000',
  homepage_url = 'http://www.sevenvalley.co.kr/'
where id = 'gc-e2e76f635c4a';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 칠곡아이위시C.C
-- change_name_to: 칠곡아이위시CC
update public.golf_courses
set
  name = '칠곡아이위시CC',
  phone = '054-970-9700',
  homepage_url = 'https://www.iwishcc.com'
where id = 'gc-bc41a2489944';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 이지스카이컨트리클럽
-- change_name_to: 이지스카이 골프클럽
update public.golf_courses
set
  name = '이지스카이 골프클럽',
  phone = '054-380-9200',
  homepage_url = 'http://www.easyskycc.co.kr'
where id = 'gc-7b483fb0f2d1';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 대덕복지센터
-- change_name_to: 사이언스대덕골프장
update public.golf_courses
set
  name = '사이언스대덕골프장',
  phone = '042-865-3000',
  homepage_url = 'http://www.ddgolf.co.kr/'
where id = 'gc-4906278997cc';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 해라컨트리클럽
-- change_name_to: 해라CC
update public.golf_courses
set
  name = '해라CC',
  phone = '051-973-7400',
  homepage_url = 'http://www.haeracc.co.kr/'
where id = 'gc-de756338755f';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 더골프골프장
-- change_name_to: 골프존카운티 더골프
update public.golf_courses
set
  name = '골프존카운티 더골프',
  phone = '052-240-0100',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=61'
where id = 'gc-9407b216837c';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 세이지우드 여수경도
-- change_name_to: 세이지우드CC 여수경도
update public.golf_courses
set
  name = '세이지우드CC 여수경도',
  phone = '061-660-1000',
  homepage_url = 'https://www.sagewood.co.kr/yeosu/main'
where id = 'gc-349a94f1be3f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 나주CC
-- change_name_to: 나주CC
update public.golf_courses
set
  phone = '061-335-7722',
  homepage_url = 'http://www.najucc.com'
where id = 'gc-dcb20414b48e';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 오시아노골프클럽
-- change_name_to: 파인비치
update public.golf_courses
set
  name = '파인비치',
  phone = '061-530-7700',
  homepage_url = 'http://www.pinebeachcc.co.kr'
where id = 'gc-050aa8bd6c6f';

-- needs_check: y | rename, fill phone
-- original_name: cosmos 1
-- change_name_to: 코스모스링스(폐업)
update public.golf_courses
set
  name = '코스모스링스(폐업)',
  phone = '031-353-0101'
where id = 'gc-5085ddf672a6';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 에콜리안영광골프장
-- change_name_to: 에콜리안영광CC
update public.golf_courses
set
  name = '에콜리안영광CC',
  phone = '1800-9399',
  homepage_url = 'https://www.ecolian.or.kr/common/main.do'
where id = 'gc-3355d2573fd4';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 푸른솔 골프클럽
-- change_name_to: 푸른솔GC 장성
update public.golf_courses
set
  name = '푸른솔GC 장성',
  phone = '061-399-6000',
  homepage_url = 'https://www.purunsolgc.co.kr/Main/'
where id = 'gc-667fefd06c3f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 군산CC
-- change_name_to: 군산CC
update public.golf_courses
set
  phone = '063-472-3355',
  homepage_url = 'http://www.gunsancc.net/'
where id = 'gc-14ba1ad9ac28';

-- needs_check: y | fill phone
-- original_name: 상떼힐CC
update public.golf_courses
set
  phone = '063-835-2521'
where id = 'gc-7e17709a629a';

-- needs_check: y | fill phone
-- original_name: 에스페란사GC
update public.golf_courses
set
  phone = '063-546-0281'
where id = 'gc-236bf8a0310c';

-- needs_check: y | fill phone
-- original_name: 금과골프장
update public.golf_courses
set
  phone = '063-652-4828'
where id = 'gc-6d34f609ed90';

-- needs_check: y | fill phone
-- original_name: 디케이레저
update public.golf_courses
set
  phone = '055-383-3233'
where id = 'gc-fd40b7bf3b76';

-- needs_check: y | fill phone
-- original_name: 그린필드GC
update public.golf_courses
set
  phone = '064-720-7000'
where id = 'gc-7d2ed71b8086';

-- needs_check: y | fill phone
-- original_name: 테디밸리
update public.golf_courses
set
  phone = '064-793-1131'
where id = 'gc-7860808d29d1';

-- needs_check: y | fill phone
-- original_name: ㈜그랜드부민 꿈드림목장
update public.golf_courses
set
  phone = '02-0120-1100'
where id = 'gc-cf50ab88350d';

-- needs_check: y | fill phone
-- original_name: 아덴힐
update public.golf_courses
set
  phone = '031-612-6000'
where id = 'gc-ad576aa399b4';

-- needs_check: y | fill phone
-- original_name: 플라자CC
update public.golf_courses
set
  phone = '064-727-9000'
where id = 'gc-baa4851e3f89';

-- needs_check: y | fill phone
-- original_name: 스프링데일
update public.golf_courses
set
  phone = '064-800-8000'
where id = 'gc-2372496c2665';

-- needs_check: y | fill phone
-- original_name: 샤인빌파크CC
update public.golf_courses
set
  phone = '064-787-8700'
where id = 'gc-af1917ce6948';

-- needs_check: y | fill phone
-- original_name: 골드리버CC
update public.golf_courses
set
  phone = '041-856-7100'
where id = 'gc-46caa66a0c89';

-- needs_check: y | fill phone
-- original_name: 계룡산골프장
update public.golf_courses
set
  phone = '042-550-6841'
where id = 'gc-25f812ff383a';

-- needs_check: y | fill phone
-- original_name: 플라밍고C.C
update public.golf_courses
set
  phone = '041-353-3000'
where id = 'gc-5df84bcc3bd5';

-- needs_check: y | fill phone
-- original_name: 골든베이골프&리조트
update public.golf_courses
set
  phone = '041-671-8000'
where id = 'gc-b21ce78f76ca';

-- needs_check: y | fill phone
-- original_name: 스톤비치컨트리클럽
update public.golf_courses
set
  phone = '041-670-7000'
where id = 'gc-2abf3143e489';

-- needs_check: y | fill phone
-- original_name: 레인보우힐스
update public.golf_courses
set
  phone = '043-879-7950'
where id = 'gc-d0e3ce523b5f';

-- needs_check: y | fill phone
-- original_name: 로얄포레cc
update public.golf_courses
set
  phone = '043-853-8000'
where id = 'gc-c5f55ef01f20';

-- needs_check: y | fill phone
-- original_name: 모나크cc
update public.golf_courses
set
  phone = '043-927-1400'
where id = 'gc-ab79864b5bdf';

-- needs_check: y | fill phone
-- original_name: 가야컨트리클럽 (회원제)
update public.golf_courses
set
  phone = '055-337-0091'
where id = 'gc-5384133fb9bc';

-- needs_check: y | fill phone
-- original_name: 가야컨트리클럽 (대중제)
update public.golf_courses
set
  phone = '055-337-0091'
where id = 'gc-9bd0f98bfdee';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 힐마루컨트리클럽 (회원제)
-- change_name_to: 힐마루CC(회원제)
update public.golf_courses
set
  name = '힐마루CC(회원제)',
  phone = '055-520-8000',
  homepage_url = 'http://www.hillmaru.com/'
where id = 'gc-49a45667bbb1';

-- needs_check: y | fill phone
-- original_name: 오션힐스포항C.C (회원제)
update public.golf_courses
set
  phone = '054-262-9988'
where id = 'gc-1636db0b5c9f';

-- needs_check: y | fill phone
-- original_name: 서라벌G.C
update public.golf_courses
set
  phone = '054-773-7000'
where id = 'gc-28ff72e3fac8';

-- needs_check: y | fill phone
-- original_name: 엠스클럽의성
update public.golf_courses
set
  phone = '054-830-3300'
where id = 'gc-783a937fe067';

-- needs_check: y | fill phone
-- original_name: 골드레이크CC (대중제)
update public.golf_courses
set
  phone = '02-563-0055'
where id = 'gc-044a801a85d5';

-- needs_check: y | fill phone
-- original_name: 골드레이크CC (회원제)
update public.golf_courses
set
  phone = '061-339-3000'
where id = 'gc-990342c1d90c';

-- needs_check: y | fill phone
-- original_name: 해피니스CC (회원제)
update public.golf_courses
set
  phone = '061-330-5000'
where id = 'gc-660ffc0f1f8d';

-- needs_check: y | fill phone
-- original_name: 태인CC
update public.golf_courses
set
  phone = '063-532-7200'
where id = 'gc-7c780d37c946';

-- needs_check: y | fill phone
-- original_name: 엘리시안제주 (대중제)
update public.golf_courses
set
  phone = '064-798-7000'
where id = 'gc-48b0d3b9c2cb';

-- needs_check: y | fill phone
-- original_name: 에버리스CC (회원제)
update public.golf_courses
set
  phone = '064-795-5000'
where id = 'gc-81f3ec25ee6f';

-- needs_check: y | fill phone
-- original_name: 아난티클럽제주 (회원제)
update public.golf_courses
set
  phone = '064-786-3800'
where id = 'gc-404df8588434';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 캐슬렉스제주 (회원제)
-- change_name_to: 캐슬렉스제주(회원제)
update public.golf_courses
set
  name = '캐슬렉스제주(회원제)',
  phone = '064-793-6630',
  homepage_url = 'https://www.castlexjj.com/'
where id = 'gc-0654fd7fa764';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 해비치CC (회원제)
-- change_name_to: 해비치CC(회원제)
update public.golf_courses
set
  name = '해비치CC(회원제)',
  phone = '064-766-6200',
  homepage_url = 'https://www.haevichi.com/ccjeju/ko/'
where id = 'gc-e51deb9a5cbf';

-- needs_check: y | fill phone
-- original_name: 롯데스카이힐제주 (회원제)
update public.golf_courses
set
  phone = '064-731-2000'
where id = 'gc-834f306ba4e2';

-- needs_check: y | fill phone
-- original_name: 사이프러스골프 (회원제)
update public.golf_courses
set
  phone = '064-787-8888'
where id = 'gc-85e4c645a34a';

-- needs_check: y | fill phone
-- original_name: 사이프러스골프 (대중제)
update public.golf_courses
set
  phone = '064-787-8888'
where id = 'gc-4365b50502ef';

-- needs_check: y | fill phone
-- original_name: 나인브릿지 (회원제)
update public.golf_courses
set
  phone = '031-887-9999'
where id = 'gc-029535a99281';

-- needs_check: y | fill phone
-- original_name: SK핀크스 (회원제)
update public.golf_courses
set
  phone = '064-792-5200'
where id = 'gc-41a0194846f8';

-- needs_check: y | fill phone
-- original_name: SK핀크스 (대중제)
update public.golf_courses
set
  phone = '064-792-5200'
where id = 'gc-b825d1073c5d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 라데나골프클럽
update public.golf_courses
set
  phone = '033-260-1114',
  homepage_url = 'https://www.ladena.co.kr'
where id = 'gc-18f9f355721d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 엘리시안 강촌컨트리클럽
update public.golf_courses
set
  phone = '033-260-2122',
  homepage_url = 'https://www.elysian.co.kr/about-gangchon/golf'
where id = 'gc-669d8ad13333';

-- needs_check: y | fill phone, fill homepage
-- original_name: 제이드팰리스 골프클럽
update public.golf_courses
set
  phone = '033-260-8000',
  homepage_url = 'http://www.jadepalacegc.com'
where id = 'gc-5acca8d60a68';

-- needs_check: y | fill phone, fill homepage
-- original_name: 남춘천컨트리클럽
update public.golf_courses
set
  phone = '033-269-3000',
  homepage_url = 'http://www.namchuncheon.co.kr/'
where id = 'gc-fa1419df8b1e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 휘슬링락컨트리클럽
update public.golf_courses
set
  phone = '033-269-2101',
  homepage_url = 'http://www.whistlingrockcc.com/'
where id = 'gc-3526f59318a4';

-- needs_check: y | fill phone, fill homepage
-- original_name: 오너스골프클럽
update public.golf_courses
set
  phone = '033-260-1900',
  homepage_url = 'http://www.ownersgc.co.kr/'
where id = 'gc-3ae54b5361c3';

-- needs_check: y | fill phone, fill homepage
-- original_name: 파가니카컨트리클럽
update public.golf_courses
set
  phone = '033-261-6556',
  homepage_url = 'https://www.onetheclub.com/paganica/main'
where id = 'gc-9e436bbbf364';

-- needs_check: y | fill phone, fill homepage
-- original_name: 로드힐스골프클럽
update public.golf_courses
set
  phone = '033-269-8888',
  homepage_url = 'https://lordhills.co.kr'
where id = 'gc-6b8298356e4e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 라비에벨컨트리클럽
update public.golf_courses
set
  phone = '033-245-7000',
  homepage_url = 'https://lavieestbellegolfnresort.com/default.asp'
where id = 'gc-a78a36b9d428';

-- needs_check: y | fill phone, fill homepage
-- original_name: 베어크리크 춘천
update public.golf_courses
set
  phone = '1899-0115',
  homepage_url = 'https://www.bearcreek.co.kr/'
where id = 'gc-d7a401a860d3';

-- needs_check: y | fill phone, fill homepage
-- original_name: 센추리21컨트리클럽
update public.golf_courses
set
  phone = '033-733-1000',
  homepage_url = 'http://www.century21cc.co.kr/'
where id = 'gc-920a66bac706';

-- needs_check: y | fill phone, fill homepage
-- original_name: 파크밸리골프클럽
update public.golf_courses
set
  phone = '033-744-4000',
  homepage_url = 'http://www.parkvalley.co.kr/'
where id = 'gc-52110494ceac';

-- needs_check: y | fill phone, fill homepage
-- original_name: 인터불고원주골프클럽
update public.golf_courses
set
  phone = '033-769-8280',
  homepage_url = 'https://ibgolfclub.com/view/index.do'
where id = 'gc-cbe46e8a03a2';

-- needs_check: y | fill phone, fill homepage
-- original_name: 오로라 골프 앤 리조트
update public.golf_courses
set
  phone = '033-810-8800',
  homepage_url = 'https://www.auroragolfnresort.co.kr'
where id = 'gc-aca146079a3b';

-- needs_check: y | fill phone, fill homepage
-- original_name: 샌드파인골프클럽
update public.golf_courses
set
  phone = '1644-3001',
  homepage_url = 'https://www.lakaisandpine.co.kr/golf'
where id = 'gc-076abf5ece38';

-- needs_check: y | fill phone, fill homepage
-- original_name: O2리조트 골프장
update public.golf_courses
set
  phone = '033-580-7700',
  homepage_url = 'https://band.us/@ryangolf'
where id = 'gc-5b16502994d3';

-- needs_check: y | fill phone, fill homepage
-- original_name: 설악프라자컨트리클럽
update public.golf_courses
set
  phone = '033-630-5511',
  homepage_url = 'https://www.plazacc.co.kr/'
where id = 'gc-716535d8799a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 영랑호컨트리클럽
update public.golf_courses
set
  phone = '033-633-0003',
  homepage_url = 'https://www.yrhresort.com'
where id = 'gc-d4f47a219511';

-- needs_check: y | fill phone, fill homepage
-- original_name: 파인밸리컨트리클럽
update public.golf_courses
set
  phone = '033-573-0874',
  homepage_url = 'http://www.tyleisure.co.kr/mobile_pinevalley.asp'
where id = 'gc-5d96ff075544';

-- needs_check: y | fill phone, fill homepage
-- original_name: 블랙밸리컨트리클럽
update public.golf_courses
set
  phone = '033-540-5300',
  homepage_url = 'http://www.blackcc.co.kr/'
where id = 'gc-788ff880fb4f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 비콘힐스골프클럽
update public.golf_courses
set
  phone = '033-439-5114',
  homepage_url = 'http://www.beaconhills.co.kr/'
where id = 'gc-3447dbe87ddc';

-- needs_check: y | fill phone, fill homepage
-- original_name: 힐드로사이컨트리클럽
update public.golf_courses
set
  phone = '033-439-3300',
  homepage_url = 'https://www.hilldeloci.co.kr'
where id = 'gc-d7beeda963dd';

-- needs_check: y | fill phone, fill homepage
-- original_name: 세이지우드CC홍천
update public.golf_courses
set
  phone = '033-439-1000',
  homepage_url = 'https://www.sagewood.co.kr/hongcheon/main'
where id = 'gc-8322ca96ec3b';

-- needs_check: y | fill phone, fill homepage
-- original_name: 샤인데일골프&리조트
update public.golf_courses
set
  phone = '033-430-1000',
  homepage_url = 'http://www.shinedale.com/'
where id = 'gc-690b34d2b582';

-- needs_check: y | fill phone, fill homepage
-- original_name: 카스카디아 골프클럽
update public.golf_courses
set
  phone = '033-430-0000',
  homepage_url = 'http://www.cascadia.kr'
where id = 'gc-568fcaa60a5e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 웰리힐리컨트리클럽
update public.golf_courses
set
  phone = '1544-8833',
  homepage_url = 'http://www.wellihillipark.com/wellihillicc/'
where id = 'gc-bbf51fd6cc91';

-- needs_check: y | fill phone, fill homepage
-- original_name: 동원썬밸리컨트리클럽
update public.golf_courses
set
  phone = '033-344-5308',
  homepage_url = 'https://www.sunvalley.co.kr/dongwon/golf/intro'
where id = 'gc-e494f9e1ff69';

-- needs_check: y | fill phone, fill homepage
-- original_name: 알프스대영컨트리클럽
update public.golf_courses
set
  phone = '033-340-8032',
  homepage_url = 'http://www.alpsdy.com/'
where id = 'gc-17aba5f4eb83';

-- needs_check: y | fill phone, fill homepage
-- original_name: 벨라스톤컨트리클럽
update public.golf_courses
set
  phone = '033-340-9000',
  homepage_url = 'http://www.bellastonecc.com/'
where id = 'gc-43114c6913bc';

-- needs_check: y | fill phone, fill homepage
-- original_name: 올데이 옥스필드
update public.golf_courses
set
  phone = '033-340-7700',
  homepage_url = 'http://oxfield.co.kr/'
where id = 'gc-535182f1f0fa';

-- needs_check: y | fill phone, fill homepage
-- original_name: 동강시스타 골프장
update public.golf_courses
set
  phone = '033-905-2030',
  homepage_url = 'http://www.cistar.co.kr/'
where id = 'gc-908385d35939';

-- needs_check: y | fill phone, fill homepage
-- original_name: 휘닉스 컨트리클럽
update public.golf_courses
set
  phone = '1577-0755',
  homepage_url = 'https://phoenixhnr.co.kr/static/pyeongchang/golf/phoenix-intro'
where id = 'gc-98e23645d4c7';

-- needs_check: y | fill phone, fill homepage
-- original_name: 태기산 나인CC
update public.golf_courses
set
  phone = '1577-0755',
  homepage_url = 'https://phoenixhnr.co.kr/static/pyeongchang/golf/taegisan-intro'
where id = 'gc-716264430902';

-- needs_check: y | fill phone, fill homepage
-- original_name: 알펜시아컨트리클럽
update public.golf_courses
set
  phone = '033-339-3300',
  homepage_url = 'https://www.alpensia.com'
where id = 'gc-2b5762bfc60c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 알펜시아 700골프클럽
update public.golf_courses
set
  phone = '033-339-3300',
  homepage_url = 'https://www.alpensia.com'
where id = 'gc-88fd5807de80';

-- needs_check: y | fill phone, fill homepage
-- original_name: 하이원컨트리클럽
update public.golf_courses
set
  phone = '1588-7789',
  homepage_url = 'http://high1.com/golf/index.do'
where id = 'gc-658a43bb77b8';

-- needs_check: y | fill phone, fill homepage
-- original_name: 한탄강컨트리클럽
update public.golf_courses
set
  phone = '033-452-5700',
  homepage_url = 'http://www.hantancc.co.kr/'
where id = 'gc-57059262e040';

-- needs_check: y | fill phone, fill homepage
-- original_name: 설악썬밸리컨트리클럽
update public.golf_courses
set
  phone = '033-638-5362',
  homepage_url = 'https://www.sunvalley.co.kr/seorak/golf/intro'
where id = 'gc-af74a0cb154f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 소노펠리체 컨트리클럽 델피노
update public.golf_courses
set
  phone = '033-1644-0063',
  homepage_url = 'http://www.sonofelicecc.com/dp'
where id = 'gc-da4ac7ff9f91';

-- needs_check: y | fill phone, fill homepage
-- original_name: 파인리즈컨트리클럽
update public.golf_courses
set
  phone = '1577-6399',
  homepage_url = 'http://www.pineridge.co.kr'
where id = 'gc-4454a258c3a6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 설해원
update public.golf_courses
set
  phone = '033-670-7700',
  homepage_url = 'https://www.seolhaeone.com/'
where id = 'gc-318abdb864d5';

-- needs_check: y | fill phone, fill homepage
-- original_name: 한원컨트리클럽
update public.golf_courses
set
  phone = '031-379-8111',
  homepage_url = 'https://www.hanwoncc.co.kr/'
where id = 'gc-9a7ff16abcee';

-- needs_check: y | fill phone, fill homepage
-- original_name: 양지파인골프클럽
update public.golf_courses
set
  phone = '031-329-9500',
  homepage_url = 'https://www.pineresort.com/Golf/CourseInfo.aspx'
where id = 'gc-897c73dbf41b';

-- needs_check: y | fill phone, fill homepage
-- original_name: 수원컨트리클럽
update public.golf_courses
set
  phone = '031-281-6613',
  homepage_url = 'http://www.suwoncc.co.kr'
where id = 'gc-38b838344176';

-- needs_check: y | fill phone, fill homepage
-- original_name: 한성컨트리클럽
update public.golf_courses
set
  phone = '031-284-3831',
  homepage_url = 'http://www.hansung-cc.co.kr/'
where id = 'gc-c2ad879f8193';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골드컨트리클럽
update public.golf_courses
set
  phone = '031-286-8111',
  homepage_url = 'http://www.gakorea.com/'
where id = 'gc-254a1c054bbe';

-- needs_check: y | fill phone, fill homepage
-- original_name: 남부컨트리클럽
update public.golf_courses
set
  phone = '031-280-4100',
  homepage_url = 'http://www.namboocc.co.kr/'
where id = 'gc-1475a1d902d7';

-- needs_check: y | fill phone, fill homepage
-- original_name: 신원CC
update public.golf_courses
set
  phone = '031-333-1800',
  homepage_url = 'http://www.swcc.co.kr/'
where id = 'gc-a53c3fecd592';

-- needs_check: y | fill phone, fill homepage
-- original_name: 은화삼컨트리클럽
update public.golf_courses
set
  phone = '031-335-8255',
  homepage_url = 'http://www.ehscc.co.kr/'
where id = 'gc-120c785ee7a3';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아시아나컨트리클럽
update public.golf_courses
set
  phone = '031-334-8800',
  homepage_url = 'http://www.asianacc.co.kr/'
where id = 'gc-25de9ff08a30';

-- needs_check: y | fill phone, fill homepage
-- original_name: 코리아컨트리클럽
update public.golf_courses
set
  phone = '031-334-7111',
  homepage_url = 'http://www.gakorea.com/'
where id = 'gc-0086afc84101';

-- needs_check: y | fill phone, fill homepage
-- original_name: 지산컨트리클럽
update public.golf_courses
set
  phone = '031-330-1400',
  homepage_url = 'http://www.jisangolf.com/'
where id = 'gc-20c1df4aa8fb';

-- needs_check: y | fill phone, fill homepage
-- original_name: 화산컨트리클럽
update public.golf_courses
set
  phone = '031-329-7114',
  homepage_url = 'http://www.hwasancc.com/'
where id = 'gc-ab63350a5577';

-- needs_check: y | fill phone, fill homepage
-- original_name: 한림용인CC
update public.golf_courses
set
  phone = '031-336-8350',
  homepage_url = 'http://www.hanlimgolf.co.kr/'
where id = 'gc-8b59a320f132';

-- needs_check: y | fill phone, fill homepage
-- original_name: 글렌로스 골프클럽
update public.golf_courses
set
  phone = '031-320-9601',
  homepage_url = 'https://www.benestgolf.com'
where id = 'gc-748b687096d1';

-- needs_check: y | fill phone, fill homepage
-- original_name: 용인CC
update public.golf_courses
set
  phone = '031-332-3323',
  homepage_url = 'http://www.yongincc.com/'
where id = 'gc-928514cac4c6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 써닝포인트 컨트리클럽
update public.golf_courses
set
  phone = '031-329-0800',
  homepage_url = 'http://www.sunningpoint.com/'
where id = 'gc-c45d3f5d316d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 해솔리아 컨트리클럽
update public.golf_courses
set
  phone = '031-321-7755',
  homepage_url = 'http://www.haesoliacc.co.kr/'
where id = 'gc-f4bb9638f567';

-- needs_check: y | fill phone, fill homepage
-- original_name: 세현CC
update public.golf_courses
set
  phone = '031-670-8800',
  homepage_url = 'https://www.sehyeoncc.com'
where id = 'gc-af63c289d999';

-- needs_check: y | fill phone, fill homepage
-- original_name: 뉴코리아 컨트리클럽
update public.golf_courses
set
  phone = '031-281-6613',
  homepage_url = 'http://www.newkoreacc.co.kr/'
where id = 'gc-3b60b2dadb3f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 올림픽 골프장
update public.golf_courses
set
  phone = '031-962-0101',
  homepage_url = 'http://www.olympicgolf.co.kr/'
where id = 'gc-18640b625b94';

-- needs_check: y | fill phone, fill homepage
-- original_name: 일산스프링힐스 컨트리클럽
update public.golf_courses
set
  phone = '031-969-2000',
  homepage_url = 'http://springhills.co.kr'
where id = 'gc-41b5c15f44da';

-- needs_check: y | fill phone, fill homepage
-- original_name: 한양파인컨트리클럽
update public.golf_courses
set
  phone = '031-930-9100',
  homepage_url = 'http://www.hypine.co.kr/'
where id = 'gc-1faa083d0616';

-- needs_check: y | fill phone, fill homepage
-- original_name: 남서울컨트리클럽
update public.golf_courses
set
  phone = '031-709-6000',
  homepage_url = 'http://www.nscc.co.kr/'
where id = 'gc-210de13c89f8';

-- needs_check: y | fill phone, fill homepage
-- original_name: 리베라컨트리클럽
update public.golf_courses
set
  phone = '031-8047-8000',
  homepage_url = 'https://www.shinangolf.com/'
where id = 'gc-4731f8c98a6d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 기흥컨트리클럽
update public.golf_courses
set
  phone = '031-376-4001',
  homepage_url = 'http://www.ghcc.kr/'
where id = 'gc-7701abd77260';

-- needs_check: y | fill phone, fill homepage
-- original_name: 라비돌컨트리클럽
update public.golf_courses
set
  phone = '031-352-4457',
  homepage_url = 'https://www.laviedor.com/la_cc1.asp'
where id = 'gc-ee03e5ddbe9f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 화성골프클럽
update public.golf_courses
set
  phone = '031-369-8900',
  homepage_url = 'http://www.hwaseonggc.com/'
where id = 'gc-5ec5b76d3c22';

-- needs_check: y | fill phone, fill homepage
-- original_name: 링크나인골프클럽
update public.golf_courses
set
  phone = '031-831-0900',
  homepage_url = 'http://www.linknine.co.kr/'
where id = 'gc-c77232b99bd6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 양주 컨트리클럽
update public.golf_courses
set
  phone = '031-592-6060',
  homepage_url = 'http://www.yangjucc.co.kr/'
where id = 'gc-24a9087d99d6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 비전힐스CC
update public.golf_courses
set
  phone = '031-595-3355',
  homepage_url = 'http://www.visionhillscc.co.kr/'
where id = 'gc-7471c8142b1e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 해비치 컨트리클럽
update public.golf_courses
set
  phone = '064-766-6200',
  homepage_url = 'https://www.haevichi.com/ccjeju/ko/'
where id = 'gc-01a5e4501db9';

-- needs_check: y | fill phone, fill homepage
-- original_name: 남양주CC
update public.golf_courses
set
  phone = '031-529-6060',
  homepage_url = 'http://www.namyangjucc.co.kr/'
where id = 'gc-29fa36946d15';

-- needs_check: y | fill phone, fill homepage
-- original_name: 제일컨트리클럽
update public.golf_courses
set
  phone = '031-400-2500',
  homepage_url = 'http://www.jaeil-cc.co.kr/'
where id = 'gc-5e74f5c1f4b5';

-- needs_check: y | fill phone, fill homepage
-- original_name: 솔트베이 골프클럽
update public.golf_courses
set
  phone = '031-400-0000',
  homepage_url = 'https://www.saltbay.co.kr'
where id = 'gc-df2b984b36c9';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아세코밸리골프클럽
update public.golf_courses
set
  phone = '031-488-8000',
  homepage_url = 'https://www.asecovalley.co.kr/'
where id = 'gc-d5533edff8e8';

-- needs_check: y | fill phone, fill homepage
-- original_name: 서서울 컨트리클럽
update public.golf_courses
set
  phone = '031-943-0040',
  homepage_url = 'http://www.seoseoul.co.kr/'
where id = 'gc-962dc7cafd46';

-- needs_check: y | fill phone, fill homepage
-- original_name: 서원밸리 골프장
update public.golf_courses
set
  phone = '031-940-9400',
  homepage_url = 'http://www.seowongolf.co.kr/'
where id = 'gc-0ab02fc6c813';

-- needs_check: y | fill phone, fill homepage
-- original_name: 서원힐스 골프장
update public.golf_courses
set
  phone = '031-940-9400',
  homepage_url = 'http://www.seowongolf.co.kr/'
where id = 'gc-fabeaa53a815';

-- needs_check: y | fill phone, fill homepage
-- original_name: 노스팜 컨트리클럽
update public.golf_courses
set
  phone = '031-950-6900',
  homepage_url = 'http://www.npcc.co.kr/'
where id = 'gc-d5cd483c8c94';

-- needs_check: y | fill phone, fill homepage
-- original_name: 스마트KU 골프 파빌리온
update public.golf_courses
set
  phone = '031-930-1600',
  homepage_url = 'http://kugolf.co.kr/'
where id = 'gc-d0e431ff250c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 남촌컨트리클럽
update public.golf_courses
set
  phone = '031-769-0333',
  homepage_url = 'https://www.youtube.com/@NamchonGolfClub'
where id = 'gc-e04bb1d7bba9';

-- needs_check: y | fill phone, fill homepage
-- original_name: 이스트밸리CC
update public.golf_courses
set
  phone = '031-760-3800',
  homepage_url = 'http://www.eastvalley.co.kr/'
where id = 'gc-b37c66474de6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 그린힐 컨트리클럽
update public.golf_courses
set
  phone = '031-799-8500',
  homepage_url = 'https://www.shinangolf.com/'
where id = 'gc-bed5fc0dc1f2';

-- needs_check: y | fill phone, fill homepage
-- original_name: 강남300 컨트리클럽
update public.golf_courses
set
  phone = '031-719-0300',
  homepage_url = 'https://www.instagram.com/kangnam300cc/'
where id = 'gc-2fa514959418';

-- needs_check: y | fill phone, fill homepage
-- original_name: 로제비앙GC
update public.golf_courses
set
  phone = '031-799-6000',
  homepage_url = 'https://www.logebiengc.com/'
where id = 'gc-4cbc2f4feecc';

-- needs_check: y | fill phone, fill homepage
-- original_name: 곤지암GC
update public.golf_courses
set
  phone = '031-760-3556',
  homepage_url = 'https://www.konjiamgolfclub.co.kr/index.dev'
where id = 'gc-14e8979016a9';

-- needs_check: y | fill phone, fill homepage
-- original_name: 중부컨트리클럽
update public.golf_courses
set
  phone = '031-762-6588',
  homepage_url = 'https://hansol4222.tistory.com/1'
where id = 'gc-f28133275bb9';

-- needs_check: y | fill phone, fill homepage
-- original_name: 뉴서울컨트리클럽
update public.golf_courses
set
  phone = '031-762-5672',
  homepage_url = 'https://www.newseoulgolf.co.kr'
where id = 'gc-3c54aee76615';

-- needs_check: y | fill phone, fill homepage
-- original_name: 캐슬렉스골프클럽
update public.golf_courses
set
  phone = '064-793-6688',
  homepage_url = 'http://www.castlexseoul.com'
where id = 'gc-3e570fca0614';

-- needs_check: y | fill phone, fill homepage
-- original_name: 안양컨트리클럽
update public.golf_courses
set
  phone = '031-460-3301',
  homepage_url = 'https://www.benestgolf.com'
where id = 'gc-9944c1872c71';

-- needs_check: y | fill phone, fill homepage
-- original_name: 송추 컨트리클럽
update public.golf_courses
set
  phone = '031-871-9410',
  homepage_url = 'http://www.songchoo.co.kr/'
where id = 'gc-9bb0cbe01084';

-- needs_check: y | fill phone, fill homepage
-- original_name: 에이치원 클럽
update public.golf_courses
set
  phone = '031-640-8114',
  homepage_url = 'http://www.h1club.co.kr'
where id = 'gc-82563fee9804';

-- needs_check: y | fill phone, fill homepage
-- original_name: 뉴스프링빌골프장
update public.golf_courses
set
  phone = '031-630-7500',
  homepage_url = 'http://www.newspringvillecc.co.kr/'
where id = 'gc-eb40a22304aa';

-- needs_check: y | fill phone, fill homepage
-- original_name: 더반 골프클럽
update public.golf_courses
set
  phone = '031-645-6100',
  homepage_url = 'http://www.theban.co.kr/'
where id = 'gc-b046571c4182';

-- needs_check: y | fill phone, fill homepage
-- original_name: 웰링턴컨트리클럽
update public.golf_courses
set
  phone = '031-645-1800',
  homepage_url = 'https://youtu.be/hoLzH1revMg?si=ABzG-AaOjwdkjD6R'
where id = 'gc-085e92730123';

-- needs_check: y | fill phone, fill homepage
-- original_name: 더크로스비골프클럽
update public.golf_courses
set
  phone = '031-730-8600',
  homepage_url = 'http://www.thecrosbygc.co.kr'
where id = 'gc-d76bd69feda5';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프클럽Q
update public.golf_courses
set
  phone = '031-8046-7000',
  homepage_url = 'http://www.golfclubq.com'
where id = 'gc-152613ee89f3';

-- needs_check: y | fill phone, fill homepage
-- original_name: 마에스트로 CC
update public.golf_courses
set
  phone = '031-8046-1000',
  homepage_url = 'http://www.maestrocc.co.kr/'
where id = 'gc-0151ec2b5b3a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 신안컨트리클럽
update public.golf_courses
set
  phone = '031-8046-0777',
  homepage_url = 'https://www.shinangolf.com/'
where id = 'gc-2c8ffe1e182d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 윈체스트 골프클럽 대중
update public.golf_courses
set
  phone = '031-671-7909',
  homepage_url = 'https://pf.kakao.com/_xhyTxgn'
where id = 'gc-a026faeee8ac';

-- needs_check: y | fill phone, fill homepage
-- original_name: 포웰CC 안성
update public.golf_courses
set
  phone = '031-612-6000',
  homepage_url = 'http://as.4wellcc.com/'
where id = 'gc-5062dbcbfa1c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 한림안성
update public.golf_courses
set
  phone = '031-671-7153',
  homepage_url = 'http://www.hanlimgolf.co.kr/'
where id = 'gc-16fca0551d98';

-- needs_check: y | fill phone, fill homepage
-- original_name: 에덴블루 컨트리클럽
update public.golf_courses
set
  phone = '031-678-7000',
  homepage_url = 'http://www.edenblue.co.kr/'
where id = 'gc-5495f8d48bf7';

-- needs_check: y | fill phone, fill homepage
-- original_name: 이글몬트CC
update public.golf_courses
set
  phone = '031-288-0900',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=64'
where id = 'gc-1f3e33adbac2';

-- needs_check: y | fill phone, fill homepage
-- original_name: 필로스 골프클럽
update public.golf_courses
set
  phone = '031-539-8900',
  homepage_url = 'http://www.philosgc.com/'
where id = 'gc-b46ed64b80b6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 일동레이크 골프클럽
update public.golf_courses
set
  phone = '031-539-5900',
  homepage_url = 'http://www.ildonglakes.co.kr/'
where id = 'gc-02352ab50684';

-- needs_check: y | fill phone, fill homepage
-- original_name: 푸른솔 골프클럽 포천
update public.golf_courses
set
  phone = '031-850-3000',
  homepage_url = 'https://www.purunsol.co.kr/'
where id = 'gc-f2158c0fa417';

-- needs_check: y | fill phone, fill homepage
-- original_name: 포천힐스 컨트리클럽
update public.golf_courses
set
  phone = '031-538-7000',
  homepage_url = 'http://www.fortunehills.co.kr/'
where id = 'gc-564e2ae6067a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 포레스트힐 컨트리클럽
update public.golf_courses
set
  phone = '031-530-8000',
  homepage_url = 'http://www.foresthill.kr/'
where id = 'gc-b7fd5ee009ca';

-- needs_check: y | fill phone, fill homepage
-- original_name: 샴발라 컨트리클럽
update public.golf_courses
set
  phone = '031-535-5045',
  homepage_url = 'http://www.shambhalacc.co.kr'
where id = 'gc-7c76a7546834';

-- needs_check: y | fill phone, fill homepage
-- original_name: 라싸 골프클럽
update public.golf_courses
set
  phone = '031-538-0600',
  homepage_url = 'http://www.lassagc.com'
where id = 'gc-81ecacc0ae41';

-- needs_check: y | fill phone, fill homepage
-- original_name: 힐마루 골프앤리조트 포천
update public.golf_courses
set
  phone = '1899-5800',
  homepage_url = 'https://pocheon.hillmaru.com/'
where id = 'gc-7ef394db717b';

-- needs_check: y | fill phone, fill homepage
-- original_name: 양평TPC GC
update public.golf_courses
set
  phone = '031-772-3000',
  homepage_url = 'http://www.tpcgolf.co.kr/'
where id = 'gc-5ca66aa29c0b';

-- needs_check: y | fill phone, fill homepage
-- original_name: YJC골프클럽
update public.golf_courses
set
  phone = '031-883-7000',
  homepage_url = 'http://www.yeojuclassic.co.kr/'
where id = 'gc-88f7a6754606';

-- needs_check: y | fill phone, fill homepage
-- original_name: 소피아그린
update public.golf_courses
set
  phone = '031-887-8100',
  homepage_url = 'http://www.sophiagreen.co.kr/'
where id = 'gc-7e1dadf46eaa';

-- needs_check: y | fill phone, fill homepage
-- original_name: 솔모로골프장
update public.golf_courses
set
  phone = '031-884-7000',
  homepage_url = 'http://www.solmoro.com/'
where id = 'gc-b55900a1fcf9';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아리지 골프장
update public.golf_courses
set
  phone = '031-887-5678',
  homepage_url = 'http://www.ariji.co.kr/'
where id = 'gc-c0e3c44b953c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 이포골프장
update public.golf_courses
set
  phone = '031-886-8100',
  homepage_url = 'https://www.ipocc.com/'
where id = 'gc-75ecca302d46';

-- needs_check: y | fill phone, fill homepage
-- original_name: 신라컨트리클럽
update public.golf_courses
set
  phone = '031-886-3030',
  homepage_url = 'https://www.onetheclub.com'
where id = 'gc-d388a17be449';

-- needs_check: y | fill phone, fill homepage
-- original_name: 해슬리나인브릿지 컨트리클럽
update public.golf_courses
set
  phone = '031-887-9999',
  homepage_url = 'http://www.haesley.com/'
where id = 'gc-c6db7aa6cbe6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 세라지오GC
update public.golf_courses
set
  phone = '031-887-8700',
  homepage_url = 'https://thesiena.co.kr/content/velluto'
where id = 'gc-30fa81244c96';

-- needs_check: y | fill phone, fill homepage
-- original_name: 360도 컨트리클럽
update public.golf_courses
set
  phone = '031-880-3600',
  homepage_url = 'http://www.360cc.co.kr/'
where id = 'gc-13ed08c1c42b';

-- needs_check: y | fill phone, fill homepage
-- original_name: 여주썬밸리 컨트리클럽
update public.golf_courses
set
  phone = '031-887-5300',
  homepage_url = 'https://www.sunvalley.co.kr/yeoju/golf/intro'
where id = 'gc-417ae947fa4c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 페럼클럽
update public.golf_courses
set
  phone = '031-887-7000',
  homepage_url = 'http://www.ferrumclub.com/'
where id = 'gc-bd3f6011928e';

-- needs_check: y | fill phone, fill homepage
-- original_name: ROUTE52CC
update public.golf_courses
set
  phone = '031-882-0052',
  homepage_url = 'http://www.route52cc.com'
where id = 'gc-41b908991867';

-- needs_check: y | fill phone, fill homepage
-- original_name: 티클라우드컨트리클럽
update public.golf_courses
set
  phone = '031-869-7777',
  homepage_url = 'http://www.teecloud.co.kr/'
where id = 'gc-79abd327c051';

-- needs_check: y | fill phone, fill homepage
-- original_name: 마이다스밸리 청평 골프클럽
update public.golf_courses
set
  phone = '031-589-9000',
  homepage_url = 'http://www.midasgolf.co.kr/'
where id = 'gc-14a40331e62c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 프리스틴밸리 골프클럽
update public.golf_courses
set
  phone = '031-589-2000',
  homepage_url = 'http://www.pristinevalley.co.kr/'
where id = 'gc-b4f940680084';

-- needs_check: y | fill phone, fill homepage
-- original_name: 크리스탈밸리C.C
update public.golf_courses
set
  phone = '02-563-0055',
  homepage_url = 'https://kko.to/4TQREpz4mM'
where id = 'gc-f0e079a5a368';

-- needs_check: y | fill phone, fill homepage
-- original_name: 베뉴지CC
update public.golf_courses
set
  phone = '031-582-5999',
  homepage_url = 'http://www.venuegcc.com'
where id = 'gc-068617149ff3';

-- needs_check: y | fill phone, fill homepage
-- original_name: 자유로컨트리클럽
update public.golf_courses
set
  phone = '031-839-1500',
  homepage_url = 'http://www.jayurocc.com/'
where id = 'gc-1635f231cd12';

-- needs_check: y | fill phone, fill homepage
-- original_name: 창원컨트리클럽
update public.golf_courses
set
  phone = '055-288-4112',
  homepage_url = 'http://www.changwoncountryclub.co.kr/'
where id = 'gc-ba63455c375f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 용원컨트리클럽
update public.golf_courses
set
  phone = '055-552-0080',
  homepage_url = 'https://www.ywcc.co.kr/'
where id = 'gc-bfc85ba9acd0';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아라미르골프앤리조트
update public.golf_courses
set
  phone = '055-548-9999',
  homepage_url = 'https://n.news.naver.com/article/009/0005338128'
where id = 'gc-745bb2ca1c75';

-- needs_check: y | fill phone, fill homepage
-- original_name: 진주컨트리클럽
update public.golf_courses
set
  phone = '055-758-0400',
  homepage_url = 'http://www.chinjucc.co.kr/'
where id = 'gc-25bf0a715d27';

-- needs_check: y | fill phone, fill homepage
-- original_name: 삼삼컨트리클럽
update public.golf_courses
set
  phone = '055-958-3333',
  homepage_url = 'https://www.samsamcc.co.kr'
where id = 'gc-d052d2018eeb';

-- needs_check: y | fill phone, fill homepage
-- original_name: 김해정산컨트리클럽
update public.golf_courses
set
  phone = '055-338-8300',
  homepage_url = 'http://www.jeongsancc.co.kr/'
where id = 'gc-7c631a53804f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 포웰CC 김해
update public.golf_courses
set
  phone = '055-340-9000',
  homepage_url = 'https://www.4wellcc.com/'
where id = 'gc-60d067e583df';

-- needs_check: y | fill phone, fill homepage
-- original_name: 리더스컨트리클럽
update public.golf_courses
set
  phone = '055-350-3000',
  homepage_url = 'https://www.leaderscc.co.kr'
where id = 'gc-57ce42c5a27d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 밀양컨트리클럽
update public.golf_courses
set
  phone = '055-350-3300',
  homepage_url = 'http://www.miryangcc.co.kr/'
where id = 'gc-db7809fe87b9';

-- needs_check: y | fill phone, fill homepage
-- original_name: 밀양노벨컨트리클럽
update public.golf_courses
set
  phone = '055-359-8500',
  homepage_url = 'https://www.miryangnobelcc.co.kr'
where id = 'gc-a33f55e2efe0';

-- needs_check: y | fill phone, fill homepage
-- original_name: 거제드비치골프클럽
update public.golf_courses
set
  phone = '055-736-3000',
  homepage_url = 'http://www.debeach.co.kr/'
where id = 'gc-2b0f0302ba03';

-- needs_check: y | fill phone, fill homepage
-- original_name: 거제뷰컨트리클럽
update public.golf_courses
set
  phone = '0507-1447-2232',
  homepage_url = 'http://www.geojeview.co.kr/'
where id = 'gc-cc0251be98e6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 통도파인이스트컨트리클럽
update public.golf_courses
set
  phone = '055-370-1300',
  homepage_url = 'http://www.tongdocc.co.kr/'
where id = 'gc-37a17c98d697';

-- needs_check: y | fill phone, fill homepage
-- original_name: 동부산컨트리클럽
update public.golf_courses
set
  phone = '055-388-1315',
  homepage_url = 'http://www.dongpusancc.co.kr/'
where id = 'gc-7031ce912de8';

-- needs_check: y | fill phone, fill homepage
-- original_name: 에이원컨트리클럽
update public.golf_courses
set
  phone = '055-371-3500',
  homepage_url = 'http://www.aonecc.co.kr/'
where id = 'gc-e85969d2e40c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 양산컨트리클럽
update public.golf_courses
set
  phone = '055-379-0000',
  homepage_url = 'https://www.yangsancc.co.kr/'
where id = 'gc-68aed81d1384';

-- needs_check: y | fill phone, fill homepage
-- original_name: 다이아몬드컨트리클럽
update public.golf_courses
set
  phone = '055-392-0700',
  homepage_url = 'http://www.diamondcc.co.kr/'
where id = 'gc-e33531fed221';

-- needs_check: y | fill phone, fill homepage
-- original_name: 양산동원로얄CC
update public.golf_courses
set
  phone = '055-389-7000',
  homepage_url = 'http://www.dongwonroyalcc.co.kr/'
where id = 'gc-afaf2442a07f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 의령친환경골프장
update public.golf_courses
set
  phone = '055-570-2888',
  homepage_url = 'https://의령친환경골프장.kr'
where id = 'gc-1a979a076b10';

-- needs_check: y | fill phone, fill homepage
-- original_name: 의령 리온컨트리클럽
update public.golf_courses
set
  phone = '055-570-7000',
  homepage_url = 'http://www.rieoncc.co.kr'
where id = 'gc-f2927c01eff1';

-- needs_check: y | fill phone, fill homepage
-- original_name: 부곡컨트리클럽
update public.golf_courses
set
  phone = '055-521-0707',
  homepage_url = 'http://www.bkcc.co.kr/'
where id = 'gc-5aff806af4f9';

-- needs_check: y | fill phone, fill homepage
-- original_name: 고성컨트리클럽
update public.golf_courses
set
  phone = '1666-0072',
  homepage_url = 'http://www.gosungcc.com/'
where id = 'gc-5eecfb4b22ad';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아난티남해CC
update public.golf_courses
set
  phone = '055-860-0555',
  homepage_url = 'https://ananti.kr'
where id = 'gc-11e571536868';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아난티남해GC
update public.golf_courses
set
  phone = '055-860-0555',
  homepage_url = 'https://ananti.kr'
where id = 'gc-a2ecc8249f1d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 경남스카이뷰CC
update public.golf_courses
set
  phone = '055-960-7000',
  homepage_url = 'http://www.skyviewcc.co.kr/'
where id = 'gc-64e6bf7be0a4';

-- needs_check: y | fill phone, fill homepage
-- original_name: 클럽디거창
update public.golf_courses
set
  phone = '055-945-2222',
  homepage_url = 'https://www.clubd.com/geochang/index.do'
where id = 'gc-993e536ad4ee';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아델스코트 컨트리클럽
update public.golf_courses
set
  phone = '055-930-7777',
  homepage_url = 'https://www.adelscott.co.kr/'
where id = 'gc-2a08fd4bdc5e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 보문G.C
update public.golf_courses
set
  phone = '054-745-1672',
  homepage_url = 'https://golf.gtc.co.kr/intro/intro.asp'
where id = 'gc-4b9a9d1f37d8';

-- needs_check: y | fill phone, fill homepage
-- original_name: 안강레전드G.C
update public.golf_courses
set
  phone = '054-760-0707',
  homepage_url = 'https://www.legendgolf.co.kr/'
where id = 'gc-6ec3dc97bc62';

-- needs_check: y | fill phone, fill homepage
-- original_name: 안동레이크골프클럽
update public.golf_courses
set
  phone = '054-821-9191',
  homepage_url = 'http://hugreen.gtc.co.kr/'
where id = 'gc-94b561c2c97d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 인터불고컨트리클럽
update public.golf_courses
set
  phone = '053-819-6100',
  homepage_url = 'http://www.haenaedacc.co.kr'
where id = 'gc-addca096eb8a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 펜타뷰골프클럽
update public.golf_courses
set
  phone = '1644-8053',
  homepage_url = 'http://www.pentaview.co.kr/'
where id = 'gc-96fce8122d04';

-- needs_check: y | fill phone, fill homepage
-- original_name: 마스터피스CC
update public.golf_courses
set
  phone = '054-955-7575',
  homepage_url = 'https://www.masterpiecegc.com/'
where id = 'gc-8809b27cc2be';

-- needs_check: y | fill phone, fill homepage
-- original_name: 대가야CC
update public.golf_courses
set
  phone = '054-956-0009',
  homepage_url = 'https://www.daegayacc.com/'
where id = 'gc-043cdfb2fdcd';

-- needs_check: y | fill phone, fill homepage
-- original_name: 마린CC
update public.golf_courses
set
  phone = '054-781-0000',
  homepage_url = 'http://www.marinecc.co.kr'
where id = 'gc-078c6e56af3a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 빛고을컨트리클럽
update public.golf_courses
set
  phone = '062-672-7400',
  homepage_url = 'https://www.bitgoeulcc.co.kr/web/index.do'
where id = 'gc-abff7021616b';

-- needs_check: y | fill phone, fill homepage
-- original_name: 어등산컨트리클럽
update public.golf_courses
set
  phone = '062-605-3000',
  homepage_url = 'http://www.eodeungsancc.com/'
where id = 'gc-96881a9924c5';

-- needs_check: y | fill phone, fill homepage
-- original_name: 팔공컨트리클럽
update public.golf_courses
set
  phone = '053-982-8080',
  homepage_url = 'https://palgong-cc.co.kr/'
where id = 'gc-3b059ef8ec97';

-- needs_check: y | fill phone, fill homepage
-- original_name: 냉천컨트리클럽
update public.golf_courses
set
  phone = '053-768-5511',
  homepage_url = 'http://www.nc-golf.co.kr'
where id = 'gc-7b7b0fc1d2dd';

-- needs_check: y | fill phone, fill homepage
-- original_name: 구니컨트리클럽
update public.golf_courses
set
  phone = '054-380-0000',
  homepage_url = 'http://www.gunicc.co.kr/'
where id = 'gc-5164e33152d9';

-- needs_check: y | fill phone, fill homepage
-- original_name: 유성컨트리클럽
update public.golf_courses
set
  phone = '044-156-2023',
  homepage_url = 'https://www.yscc.co.kr/'
where id = 'gc-28ed803e0e26';

-- needs_check: y | fill phone, fill homepage
-- original_name: 금실대덕밸리CC
update public.golf_courses
set
  phone = '042-250-6661',
  homepage_url = 'https://www.hanmircc.com/'
where id = 'gc-c9369c96907d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 부산컨트리클럽
update public.golf_courses
set
  phone = '051-509-0707',
  homepage_url = 'http://www.bscc.co.kr/'
where id = 'gc-485bb35864fb';

-- needs_check: y | fill phone, fill homepage
-- original_name: 동래베네스트골프클럽
update public.golf_courses
set
  phone = '051-580-0300',
  homepage_url = 'https://www.benestgolf.com'
where id = 'gc-38215b654b62';

-- needs_check: y | fill phone, fill homepage
-- original_name: 하이스트컨트리클럽
update public.golf_courses
set
  phone = '051-314-7000',
  homepage_url = 'http://www.highestcc.co.kr/'
where id = 'gc-9262179bfeaa';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아시아드컨트리클럽
update public.golf_courses
set
  phone = '051-720-6000',
  homepage_url = 'https://www.asiadcc.co.kr'
where id = 'gc-2070c1511760';

-- needs_check: y | fill phone, fill homepage
-- original_name: 해운대컨트리클럽
update public.golf_courses
set
  phone = '051-726-8000',
  homepage_url = 'http://www.haeundaecc.com/'
where id = 'gc-0cacc131d4d7';

-- needs_check: y | fill phone, fill homepage
-- original_name: 베이사이드골프클럽
update public.golf_courses
set
  phone = '051-930-0000',
  homepage_url = 'http://www.bayside.co.kr/'
where id = 'gc-dceb317bb674';

-- needs_check: y | fill phone, fill homepage
-- original_name: 기장동원로얄컨트리클럽
update public.golf_courses
set
  phone = '051-750-6000',
  homepage_url = 'http://www.dongwongolf.co.kr/'
where id = 'gc-80348568c7d7';

-- needs_check: y | fill phone, fill homepage
-- original_name: 스톤게이트컨트리클럽
update public.golf_courses
set
  phone = '051-722-7000',
  homepage_url = 'http://www.stonegatecc.co.kr/'
where id = 'gc-4fba6a0ae29e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 인서울27골프클럽
update public.golf_courses
set
  phone = '02-6395-8000',
  homepage_url = 'http://inseoul27.co.kr/'
where id = 'gc-dd6fca373d1b';

-- needs_check: y | fill phone, fill homepage
-- original_name: 세종에머슨컨트리클럽
update public.golf_courses
set
  phone = '044-862-4004',
  homepage_url = 'http://www.sejongemerson.co.kr/'
where id = 'gc-2b09ff38b37c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 세종레이캐슬골프&리조트
update public.golf_courses
set
  phone = '044-279-3300',
  homepage_url = 'http://www.sjraycastle.com'
where id = 'gc-1e8879a575c1';

-- needs_check: y | fill phone, fill homepage
-- original_name: 보라골프장
update public.golf_courses
set
  phone = '052-255-1000',
  homepage_url = 'http://www.boracc.com/'
where id = 'gc-312ef6603be3';

-- needs_check: y | fill phone, fill homepage
-- original_name: 베이스타즈CC
update public.golf_courses
set
  phone = '052-280-8800',
  homepage_url = 'http://www.baystars.co.kr'
where id = 'gc-bb197f80e910';

-- needs_check: y | fill phone, fill homepage
-- original_name: 오르비스골프클럽
update public.golf_courses
set
  phone = '052-939-2000',
  homepage_url = 'https://www.southcape.co.kr/golf.asp'
where id = 'gc-442afb70220e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 인천국제컨트리클럽
update public.golf_courses
set
  phone = '032-562-6666',
  homepage_url = 'https://www.incheoncc.com/'
where id = 'gc-fa1a5b7b0f98';

-- needs_check: y | fill phone, fill homepage
-- original_name: 송도골프클럽
update public.golf_courses
set
  phone = '032-833-0500',
  homepage_url = 'http://www.songdogolf.co.kr/'
where id = 'gc-68bd427a4957';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 인천그랜드컨트리클럽
-- change_name_to: 인천그랜드CC
update public.golf_courses
set
  name = '인천그랜드CC',
  phone = '032-584-3111',
  homepage_url = 'http://www.incheongrand.cc/'
where id = 'gc-60319bf1693c';

-- needs_check: y | rename, fill phone, fill homepage
-- original_name: 베어즈베스트청라골프클럽
-- change_name_to: 베어즈베스트 청라GC
update public.golf_courses
set
  name = '베어즈베스트 청라GC',
  phone = '032-560-2000',
  homepage_url = 'http://www.bearsbestcheongnagc.com/'
where id = 'gc-fa55dbc73e9b';

-- needs_check: y | fill phone, fill homepage
-- original_name: 석모도컨트리클럽
update public.golf_courses
set
  phone = '032-934-9344',
  homepage_url = 'https://naver.me/xI2TooVO'
where id = 'gc-781728826076';

-- needs_check: y | fill phone, fill homepage
-- original_name: 오렌지듄스 영종골프클럽
update public.golf_courses
set
  phone = '0507-1433-3026',
  homepage_url = 'http://www.orangedunesyj.com'
where id = 'gc-496303f3c77c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 강화 선두리 골프장
update public.golf_courses
set
  phone = '032-933-1010',
  homepage_url = 'http://www.gakorea.com'
where id = 'gc-868a31e611a3';

-- needs_check: y | fill phone, fill homepage
-- original_name: 베르힐CC 영종
update public.golf_courses
set
  phone = '032-257-8000',
  homepage_url = 'https://www.verthillccyj.com'
where id = 'gc-043ae5d51851';

-- needs_check: y | fill phone, fill homepage
-- original_name: 디오션CC
update public.golf_courses
set
  phone = '061-689-0410',
  homepage_url = 'https://www.theoceanresort.co.kr/country'
where id = 'gc-4c57c6fd7298';

-- needs_check: y | fill phone, fill homepage
-- original_name: 포라이즌
update public.golf_courses
set
  phone = '061-740-8181',
  homepage_url = 'http://www.fourizon.co.kr'
where id = 'gc-295d6bb19311';

-- needs_check: y | fill phone, fill homepage
-- original_name: 파인힐스CC
update public.golf_courses
set
  phone = '061-750-9000',
  homepage_url = 'https://www.pinehills.co.kr'
where id = 'gc-95d86b96417d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 순천부영CC
update public.golf_courses
set
  phone = '061-816-5500',
  homepage_url = 'http://www.scbooyoungcc.co.kr/index.asp'
where id = 'gc-a4b9d0a94686';

-- needs_check: y | fill phone, fill homepage
-- original_name: 나주힐스CC
update public.golf_courses
set
  phone = '061-337-5700',
  homepage_url = 'http://www.najuhills.com/'
where id = 'gc-2042973e4c2d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 광양CC
update public.golf_courses
set
  phone = '061-817-0707',
  homepage_url = 'http://www.gygc.kr'
where id = 'gc-e87bc5cc22aa';

-- needs_check: y | fill phone, fill homepage
-- original_name: 창평CC
update public.golf_courses
set
  phone = '061-380-8800',
  homepage_url = 'http://www.cppc.co.kr/'
where id = 'gc-1236a882f178';

-- needs_check: y | fill phone, fill homepage
-- original_name: 레이나CC
update public.golf_courses
set
  phone = '061-380-7600',
  homepage_url = 'http://www.reinacc.co.kr'
where id = 'gc-98d4ad236944';

-- needs_check: y | fill phone, fill homepage
-- original_name: 죽향CC
update public.golf_courses
set
  phone = '061-382-7200',
  homepage_url = 'http://jhcc.co.kr/'
where id = 'gc-353e04416544';

-- needs_check: y | fill phone, fill homepage
-- original_name: 광주CC
update public.golf_courses
set
  phone = '061-339-7100',
  homepage_url = 'http://www.kjcc.co.kr/'
where id = 'gc-7be0893151f7';

-- needs_check: y | fill phone, fill homepage
-- original_name: 옥과기안CC
update public.golf_courses
set
  phone = '061-363-9700',
  homepage_url = 'http://www.okgwakiancc.co.kr/'
where id = 'gc-39d4525a34c6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 르오네뜨CC
update public.golf_courses
set
  phone = '061-362-2500',
  homepage_url = 'http://www.lehonnetecc.com'
where id = 'gc-8c40f9db402e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 보성CC
update public.golf_courses
set
  phone = '061-804-1000',
  homepage_url = 'http://www.bosungcc.co.kr/'
where id = 'gc-496a04b9cf3f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 보성에덴CC
update public.golf_courses
set
  phone = '061-852-2200',
  homepage_url = 'http://edencc.co.kr'
where id = 'gc-2d39844d8485';

-- needs_check: y | fill phone, fill homepage
-- original_name: 엘리체CC
update public.golf_courses
set
  phone = '061-373-7733',
  homepage_url = 'http://www.elichecc.co.kr'
where id = 'gc-658ae3503358';

-- needs_check: y | fill phone, fill homepage
-- original_name: 조아밸리CC
update public.golf_courses
set
  phone = '061-370-9000',
  homepage_url = 'http://www.joavalleycc.co.kr/'
where id = 'gc-ecd9077e6622';

-- needs_check: y | fill phone, fill homepage
-- original_name: 무등산CC
-- change_name_to: 무등산CC
update public.golf_courses
set
  phone = '061-379-1000',
  homepage_url = 'https://mudeungsancc.com'
where id = 'gc-e8468ec9b024';

-- needs_check: y | fill phone, fill homepage
-- original_name: JNJ골프리조트
update public.golf_courses
set
  phone = '061-860-9000',
  homepage_url = 'http://www.jnjgolfresort.co.kr/'
where id = 'gc-9885ff9a556f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 파인비치골프링크스
update public.golf_courses
set
  phone = '061-530-7700',
  homepage_url = 'http://www.pinebeachcc.co.kr'
where id = 'gc-437ea8156737';

-- needs_check: y | fill phone, fill homepage
-- original_name: 솔라시도CC
update public.golf_courses
set
  phone = '0507-1474-9520',
  homepage_url = 'http://www.solaseadocc.com'
where id = 'gc-5b534d8afc35';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아크로CC
update public.golf_courses
set
  phone = '061-470-7000',
  homepage_url = 'http://www.acrogolf.co.kr/'
where id = 'gc-068d49f9d08c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 무안CC
update public.golf_courses
set
  phone = '061-450-9000',
  homepage_url = 'http://www.muangc.co.kr/'
where id = 'gc-138f4498623e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 클린밸리CC
update public.golf_courses
set
  phone = '061-452-3100',
  homepage_url = 'http://www.muancleanvalley.com/'
where id = 'gc-a043a2488af5';

-- needs_check: y | fill phone, fill homepage
-- original_name: 엘리체CC
update public.golf_courses
set
  phone = '061-373-7733',
  homepage_url = 'http://www.elichecc.co.kr'
where id = 'gc-80a626b2053e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 베르힐컨트리클럽
update public.golf_courses
set
  phone = '032-257-8000',
  homepage_url = 'http://pf.kakao.com/_QjxhQxj'
where id = 'gc-e50b3c8c38c0';

-- needs_check: y | fill phone, fill homepage
-- original_name: 웨스트오션CC
update public.golf_courses
set
  phone = '061-350-2000',
  homepage_url = 'http://www.westoceancc.co.kr'
where id = 'gc-cc31ca848991';

-- needs_check: y | fill phone, fill homepage
-- original_name: 백양우리CC
update public.golf_courses
set
  phone = '061-392-2300',
  homepage_url = 'http://www.woori-cc.co.kr/'
where id = 'gc-db3f5634c5ee';

-- needs_check: y | fill phone, fill homepage
-- original_name: 전주월드컵골프장
update public.golf_courses
set
  phone = '063-239-2997',
  homepage_url = 'http://golf.jjss.or.kr/'
where id = 'gc-0b047be49f03';

-- needs_check: y | fill phone, fill homepage
-- original_name: 익산컨트리클럽
update public.golf_courses
set
  phone = '063-835-2521',
  homepage_url = 'http://www.santehill.com/'
where id = 'gc-e66e37a5892a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 포세븐금강컨트리클럽
update public.golf_courses
set
  phone = '063-720-7777',
  homepage_url = 'https://www.fourseven.co.kr'
where id = 'gc-11d936495fd4';

-- needs_check: y | fill phone, fill homepage
-- original_name: 내장산골프&리조트
update public.golf_courses
set
  phone = '063-570-7700',
  homepage_url = 'http://www.naejangsancc.com'
where id = 'gc-db9ee81a1a70';

-- needs_check: y | fill phone, fill homepage
-- original_name: 남원상록골프장
update public.golf_courses
set
  phone = '063-630-1400',
  homepage_url = 'https://www.sangnokresort.co.kr/'
where id = 'gc-555dca97c252';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아네스빌CC
update public.golf_courses
set
  phone = '063-547-1553',
  homepage_url = 'http://www.anesville.co.kr/'
where id = 'gc-93d79516b4dd';

-- needs_check: y | fill phone, fill homepage
-- original_name: 김제스파힐스CC
update public.golf_courses
set
  phone = '063-547-8300',
  homepage_url = 'http://www.spahillscc.co.kr/'
where id = 'gc-8cda6b72d361';

-- needs_check: y | fill phone, fill homepage
-- original_name: 더나인골프클럽
update public.golf_courses
set
  phone = '063-548-3650',
  homepage_url = 'http://theninegc.co.kr/'
where id = 'gc-51bc2ed864d2';

-- needs_check: y | fill phone, fill homepage
-- original_name: OKCC
update public.golf_courses
set
  phone = '063-711-5555',
  homepage_url = 'http://okcc.co.kr/'
where id = 'gc-3dc796a63edd';

-- needs_check: y | fill phone, fill homepage
-- original_name: 써미트CC
update public.golf_courses
set
  phone = '063-432-5000',
  homepage_url = 'http://www.summitcc.co.kr/'
where id = 'gc-af220a47e9ad';

-- needs_check: y | fill phone, fill homepage
-- original_name: 무주덕유산CC
update public.golf_courses
set
  phone = '063-322-9000',
  homepage_url = 'http://www.mdysresort.com/golf/golf_intro.asp'
where id = 'gc-dede5bb789cf';

-- needs_check: y | fill phone, fill homepage
-- original_name: 장수골프리조트
update public.golf_courses
set
  phone = '063-350-1004',
  homepage_url = 'http://www.jangsugolf.com/'
where id = 'gc-6d636874e191';

-- needs_check: y | fill phone, fill homepage
-- original_name: 전주샹그릴라CC
update public.golf_courses
set
  phone = '063-643-1000',
  homepage_url = 'http://www.jeonjucc.co.kr/'
where id = 'gc-a2c85434539e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 고창CC
update public.golf_courses
set
  phone = '063-560-7744',
  homepage_url = 'http://www.gochangcc.co.kr/'
where id = 'gc-e6f654f8efb6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 석정힐CC
update public.golf_courses
set
  phone = '063-560-7000',
  homepage_url = 'http://www.hillcc.com/'
where id = 'gc-8f5c8d0f5d46';

-- needs_check: y | fill phone, fill homepage
-- original_name: 타미우스cc
update public.golf_courses
set
  phone = '064-793-0707',
  homepage_url = 'http://tameuscc.co.kr/'
where id = 'gc-c96a1655bd5c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 라헨느CC
update public.golf_courses
set
  phone = '064-729-7777',
  homepage_url = 'http://www.lareine.co.kr/'
where id = 'gc-aff117457c45';

-- needs_check: y | fill phone, fill homepage
-- original_name: 볼카노골프앤리조트
update public.golf_courses
set
  phone = '1533-3888',
  homepage_url = 'http://www.volcanocc.co.kr/'
where id = 'gc-ed4f10d4c149';

-- needs_check: y | fill phone, fill homepage
-- original_name: 에코랜드
update public.golf_courses
set
  phone = '064-802-8000',
  homepage_url = 'http://www.ecolandjeju.co.kr'
where id = 'gc-464e4a545027';

-- needs_check: y | fill phone, fill homepage
-- original_name: 라온골프클럽
update public.golf_courses
set
  phone = '0507-1404-8000',
  homepage_url = 'http://www.raon.co.kr/'
where id = 'gc-0e0131544801';

-- needs_check: y | fill phone, fill homepage
-- original_name: 크라운CC
update public.golf_courses
set
  phone = '064-784-4811',
  homepage_url = 'http://www.jejucrowncc.co.kr/'
where id = 'gc-84bb21f2b77e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 더시에나CC
update public.golf_courses
set
  phone = '064-702-2999',
  homepage_url = 'https://thesiena.co.kr/content/cc'
where id = 'gc-5f82bbc964a8';

-- needs_check: y | fill phone, fill homepage
-- original_name: 한라산CC
update public.golf_courses
set
  phone = '064-754-5678',
  homepage_url = 'http://www.hallasancc.co.kr/'
where id = 'gc-d03e2b710be0';

-- needs_check: y | fill phone, fill homepage
-- original_name: 부영CC
update public.golf_courses
set
  phone = '064-766-5500',
  homepage_url = 'http://www.booyoungcc.co.kr/'
where id = 'gc-e0165d4e49cd';

-- needs_check: y | fill phone, fill homepage
-- original_name: 서귀포팬텀 골프앤리조트
update public.golf_courses
set
  phone = '064-766-7777',
  homepage_url = 'https://spgr.co.kr/'
where id = 'gc-7dcfb1b60ab9';

-- needs_check: y | fill phone, fill homepage
-- original_name: 중문GC
update public.golf_courses
set
  phone = '064-738-1202',
  homepage_url = 'http://jungmungolf.visitkorea.or.kr/'
where id = 'gc-c96f2da1a4dc';

-- needs_check: y | fill phone, fill homepage
-- original_name: 더클래식CC
update public.golf_courses
set
  phone = '064-766-7100',
  homepage_url = 'http://www.theclassicresort.com/'
where id = 'gc-a441de4b462a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 우정힐스 컨트리클럽
update public.golf_courses
set
  phone = '041-559-6630',
  homepage_url = 'http://whcc.kolon.co.kr/'
where id = 'gc-e401cda7a8ad';

-- needs_check: y | fill phone, fill homepage
-- original_name: 천안상록 골프장
update public.golf_courses
set
  phone = '041-560-9100',
  homepage_url = 'https://www.sangnokresort.co.kr/M040000'
where id = 'gc-7681bcbcf45d';

-- needs_check: y | fill phone, fill homepage
-- original_name: 마론컨트리클럽
update public.golf_courses
set
  phone = '041-623-5555',
  homepage_url = 'http://www.maronnewday.com/'
where id = 'gc-2c27b8854e6b';

-- needs_check: y | fill phone, fill homepage
-- original_name: 보령베이스CC
update public.golf_courses
set
  phone = '041-939-3800',
  homepage_url = 'https://www.boryeongbase.co.kr/'
where id = 'gc-5631e69db45e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 에스앤 골프리조트
update public.golf_courses
set
  phone = '041-934-0100',
  homepage_url = 'http://www.sngolfresort.co.kr/'
where id = 'gc-de2b5fc511da';

-- needs_check: y | fill phone, fill homepage
-- original_name: 서산수 골프앤리조트
update public.golf_courses
set
  phone = '041-689-7700',
  homepage_url = 'http://www.seosansoo.com/'
where id = 'gc-c9dda49e7539';

-- needs_check: y | fill phone, fill homepage
-- original_name: 더힐 컨트리클럽
update public.golf_courses
set
  phone = '041-736-2580',
  homepage_url = 'http://www.thehill.co.kr/'
where id = 'gc-e3f0db78167a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아리스타 CC
update public.golf_courses
set
  phone = '041-741-0100',
  homepage_url = 'http://www.aristacc.co.kr/'
where id = 'gc-c0cdb2271518';

-- needs_check: y | fill phone, fill homepage
-- original_name: 파인스톤 컨트리클럽
update public.golf_courses
set
  phone = '041-350-0000',
  homepage_url = 'http://www.pinestonecc.com/'
where id = 'gc-699579941cf6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 파나시아 골프클럽
update public.golf_courses
set
  phone = '041-350-0900',
  homepage_url = 'http://www.panaceagc.com/'
where id = 'gc-95696dbd5d40';

-- needs_check: y | fill phone, fill homepage
-- original_name: 에딘버러 컨트리클럽
update public.golf_courses
set
  phone = '041-750-0114',
  homepage_url = 'http://www.edinburgh.co.kr/'
where id = 'gc-b48ba0827aa2';

-- needs_check: y | fill phone, fill homepage
-- original_name: 백제컨트리클럽
update public.golf_courses
set
  phone = '041-830-0700',
  homepage_url = 'http://www.baekjecc.co.kr/'
where id = 'gc-19f328d2bc87';

-- needs_check: y | fill phone, fill homepage
-- original_name: 로얄링스 CC
update public.golf_courses
set
  phone = '041-670-0300',
  homepage_url = 'http://www.royallinks.co.kr'
where id = 'gc-bf183cd699c7';

-- needs_check: y | fill phone, fill homepage
-- original_name: 솔라고CC
update public.golf_courses
set
  phone = '041-670-8888',
  homepage_url = 'http://sollago.co.kr/'
where id = 'gc-167a7f95d402';

-- needs_check: y | fill phone, fill homepage
-- original_name: 내포골프클럽
update public.golf_courses
set
  phone = '041-337-7155',
  homepage_url = 'http://naepogc.com/'
where id = 'gc-04b372ccad13';

-- needs_check: y | fill phone, fill homepage
-- original_name: 그랜드cc
update public.golf_courses
set
  phone = '043-212-7111',
  homepage_url = 'http://www.grandgolf.co.kr/'
where id = 'gc-81f36c789316';

-- needs_check: y | fill phone, fill homepage
-- original_name: 아난티 중앙골프클럽
update public.golf_courses
set
  phone = '043-533-6666',
  homepage_url = 'https://ananti.kr/ko/joongang'
where id = 'gc-6ea98adb1954';

-- needs_check: y | fill phone, fill homepage
-- original_name: 천 룡cc
update public.golf_courses
set
  phone = '043-536-1001',
  homepage_url = 'http://www.crcc.co.kr/'
where id = 'gc-a81df4ea7927';

-- needs_check: y | fill phone, fill homepage
-- original_name: 세레니티cc
update public.golf_courses
set
  phone = '043-277-5000',
  homepage_url = 'https://www.serenitycc.co.kr/'
where id = 'gc-8ccf3d19f9bb';

-- needs_check: y | fill phone, fill homepage
-- original_name: 스 타cc
update public.golf_courses
set
  phone = '043-724-9000',
  homepage_url = 'http://www.starcc.net'
where id = 'gc-ce7b0e81cf22';

-- needs_check: y | fill phone, fill homepage
-- original_name: 천 룡cc
update public.golf_courses
set
  phone = '043-536-1001',
  homepage_url = 'http://www.crcc.co.kr/'
where id = 'gc-760b850e4451';

-- needs_check: y | fill phone, fill homepage
-- original_name: 썬밸리cc
update public.golf_courses
set
  phone = '043-881-5307',
  homepage_url = 'https://www.sunvalley.co.kr/iljuk/golf/intro'
where id = 'gc-ac8ec878e912';

-- needs_check: y | fill phone, fill homepage
-- original_name: 중 원cc
update public.golf_courses
set
  phone = '043-849-8000',
  homepage_url = 'http://www.joongwongolf.co.kr/'
where id = 'gc-54e8d6f41d3b';

-- needs_check: y | fill phone, fill homepage
-- original_name: 히든밸리cc
update public.golf_courses
set
  phone = '043-539-7900',
  homepage_url = 'https://www.hiddenvalley.co.kr'
where id = 'gc-8ded1998e36a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골드나인cc
update public.golf_courses
set
  phone = '043-229-1000',
  homepage_url = 'http://www.gold-9.co.kr/'
where id = 'gc-663ebcd52f5e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 센테리움cc
update public.golf_courses
set
  phone = '043-849-7000',
  homepage_url = 'http://www.centeriumcc.com/'
where id = 'gc-3d68f1ae46e5';

-- needs_check: y | fill phone, fill homepage
-- original_name: 대호단양cc
update public.golf_courses
set
  phone = '043-420-7100',
  homepage_url = 'http://www.daehocc.co.kr/'
where id = 'gc-f261ddd7cd1a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 대영베이스cc
update public.golf_courses
set
  phone = '043-850-8600',
  homepage_url = 'https://basecc.co.kr/'
where id = 'gc-6bee4df56cf5';

-- needs_check: y | fill phone, fill homepage
-- original_name: 오창 에딘버러
update public.golf_courses
set
  phone = '043-210-1900',
  homepage_url = 'https://www.ochangedincc.com/'
where id = 'gc-facbcadf0522';

-- needs_check: y | fill phone, fill homepage
-- original_name: 이븐데일cc
update public.golf_courses
set
  phone = '043-288-1000',
  homepage_url = 'http://www.evendale.co.kr/'
where id = 'gc-9c36390d43ba';

-- needs_check: y | fill phone, fill homepage
-- original_name: 킹즈락cc
update public.golf_courses
set
  phone = '043-640-9000',
  homepage_url = 'http://kingsrockcc.com/'
where id = 'gc-717efe03426f';

-- needs_check: y | fill phone, fill homepage
-- original_name: 젠스필드cc
update public.golf_courses
set
  phone = '043-880-1000',
  homepage_url = 'http://www.zensfield.com/'
where id = 'gc-eec2e96ca1a7';

-- needs_check: y | fill phone, fill homepage
-- original_name: 대영힐스cc
update public.golf_courses
set
  phone = '043-850-8600',
  homepage_url = 'https://basecc.co.kr'
where id = 'gc-1cfb7d6583c7';

-- needs_check: y | fill phone, fill homepage
-- original_name: 진양밸리cc
update public.golf_courses
set
  phone = '043-880-8000',
  homepage_url = 'http://www.chinyangvalley.co.kr/'
where id = 'gc-617f2f73c737';

-- needs_check: y | fill phone, fill homepage
-- original_name: 코스카cc
update public.golf_courses
set
  phone = '043-870-1000',
  homepage_url = 'http://www.koscacc.kr/'
where id = 'gc-e02aaeea09ed';

-- needs_check: y | fill phone, fill homepage
-- original_name: 클럽디속리산
update public.golf_courses
set
  phone = '043-540-8000',
  homepage_url = 'http://www.songnisancc.co.kr'
where id = 'gc-914eaef995a0';

-- needs_check: y | fill phone, fill homepage
-- original_name: 동 촌cc
update public.golf_courses
set
  phone = '043-722-0707',
  homepage_url = 'http://www.dongchongc.co.kr/'
where id = 'gc-2bace244ca44';

-- needs_check: y | fill phone, fill homepage
-- original_name: 세 일cc
update public.golf_courses
set
  phone = '043-841-6000',
  homepage_url = 'https://www.mokacc.co.kr/index.asp'
where id = 'gc-0a89c1c9b286';

-- needs_check: y | fill phone, fill homepage
-- original_name: 클럽디보은
update public.golf_courses
set
  phone = '043-540-8888',
  homepage_url = 'https://www.clubd.co.kr/boeun/index.do'
where id = 'gc-746ebce39dd0';

-- needs_check: y | fill phone, fill homepage
-- original_name: 올데이 골프앤리조트
update public.golf_courses
set
  phone = '043-851-5500',
  homepage_url = 'http://www.ilcc.co.kr'
where id = 'gc-ca6baf196057';

-- needs_check: y | fill phone, fill homepage
-- original_name: 감곡CC
update public.golf_courses
set
  phone = '043-882-1600',
  homepage_url = 'http://www.gamgokcc.com'
where id = 'gc-b86dec31683a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 일라이트 컨트리클럽
update public.golf_courses
set
  phone = '043-740-0000',
  homepage_url = 'https://illitegolfnresort.co.kr/golf/main'
where id = 'gc-a8e246e93ac3';

-- needs_check: y | fill phone, fill homepage
-- original_name: 일레븐cc
update public.golf_courses
set
  phone = '0507-1348-3502',
  homepage_url = 'https://www.elevencc.co.kr/'
where id = 'gc-e14661a32922';

-- needs_check: y | fill phone, fill homepage
-- original_name: 킹스데일cc
update public.golf_courses
set
  phone = '043-870-4100',
  homepage_url = 'https://www.kingsdale.co.kr'
where id = 'gc-8d9ee33d1f22';

-- needs_check: y | fill phone, fill homepage
-- original_name: 음성 힐데스하임cc
update public.golf_courses
set
  phone = '043-750-4000',
  homepage_url = 'https://www.hildesheimcc.cc/'
where id = 'gc-cf2911a3e910';

-- needs_check: y | fill phone, fill homepage
-- original_name: 세레니티cc
update public.golf_courses
set
  phone = '043-277-5000',
  homepage_url = 'https://www.serenitycc.co.kr/'
where id = 'gc-736ecb0e589a';

-- needs_check: y | fill phone, fill homepage
-- original_name: 서경타니CC
update public.golf_courses
set
  phone = '0507-1423-7013',
  homepage_url = 'https://www.tanicc.co.kr/'
where id = 'gc-a043ad4dfcf6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 해피니스CC (대중제)
update public.golf_courses
set
  phone = '061-330-5000',
  homepage_url = 'http://www.happinesscc.com/'
where id = 'gc-53f5c270575b';

-- needs_check: y | fill phone, fill homepage
-- original_name: 나인브릿지 (대중제)
update public.golf_courses
set
  phone = '031-384-0912',
  homepage_url = 'https://nine-bridge.co.kr/'
where id = 'gc-06c10aaf3618';

-- needs_check: y | fill phone, fill homepage
-- original_name: 시그너스cc
update public.golf_courses
set
  phone = '043-857-5001',
  homepage_url = 'http://www.cygnuscc.com/'
where id = 'gc-1ce1b36ed2da';

-- needs_check: y | fill phone, fill homepage
-- original_name: 스프링베일리조트
update public.golf_courses
set
  phone = '033-254-7900',
  homepage_url = 'http://www.springvale.co.kr'
where id = 'gc-17fef5525b26';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 안성H
update public.golf_courses
set
  phone = '031-8056-0700',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=53'
where id = 'gc-ba3362c686e4';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 안성W
update public.golf_courses
set
  phone = '031-670-0500',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=2'
where id = 'gc-411771a420e7';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 사천
update public.golf_courses
set
  phone = '055-851-5000',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=56'
where id = 'gc-945ef0204a99';

-- needs_check: y | fill phone, fill homepage
-- original_name: 밀양에스파크골프리조트
update public.golf_courses
set
  phone = '055-353-5513',
  homepage_url = 'https://my.s-parkcc.kr'
where id = 'gc-968de8ceffeb';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 경남
update public.golf_courses
set
  phone = '055-589-8888',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=49'
where id = 'gc-09693194d3fb';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 감포
update public.golf_courses
set
  phone = '054-777-9000',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=1'
where id = 'gc-96bed6159452';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 선산
update public.golf_courses
set
  phone = '054-473-6200',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=28'
where id = 'gc-6a587177a23c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 구미
update public.golf_courses
set
  phone = '054-473-8161',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=50'
where id = 'gc-a944350f5db1';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 청통
update public.golf_courses
set
  phone = '054-339-8000',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=58'
where id = 'gc-01d6a94bf335';

-- needs_check: y | fill phone, fill homepage
-- original_name: 잭 니클라우스 골프클럽 코리아
update public.golf_courses
set
  phone = '032-850-8000',
  homepage_url = 'http://www.jacknicklausgolfclubkorea.com/'
where id = 'gc-3f766167d45e';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 송도 골프장
update public.golf_courses
set
  phone = '032-830-8888',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=68'
where id = 'gc-4005648f63d2';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티
update public.golf_courses
set
  phone = '031-8056-0700',
  homepage_url = 'https://www.golfzoncounty.com/anseong_h'
where id = 'gc-3269edc70897';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 영암
update public.golf_courses
set
  phone = '061-460-6000',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=59'
where id = 'gc-982325a51789';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티무주
update public.golf_courses
set
  phone = '063-320-3200',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=54'
where id = 'gc-2a867c283a2c';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티선운
update public.golf_courses
set
  phone = '063-560-2000',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=5'
where id = 'gc-1f1578e897f2';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 천안
update public.golf_courses
set
  phone = '041-558-9900',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=47'
where id = 'gc-adeec421c374';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 진천cc
update public.golf_courses
set
  phone = '043-531-3000',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=4'
where id = 'gc-226b2263c6f6';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티 화랑cc
update public.golf_courses
set
  phone = '043-539-5000',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=52'
where id = 'gc-ab22b2f16924';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존 카운티 드래곤
update public.golf_courses
set
  phone = '063-630-3000',
  homepage_url = 'https://www.golfzoncounty.com/golfclub/main?golfclubSeq=55'
where id = 'gc-01762fe809b0';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티오라 (회원제)
update public.golf_courses
set
  phone = '064-747-5100',
  homepage_url = 'https://ora.golfzoncounty.com'
where id = 'gc-d780ed19a4d0';

-- needs_check: y | fill phone, fill homepage
-- original_name: 골프존카운티오라 (대중제)
update public.golf_courses
set
  phone = '064-747-5100',
  homepage_url = 'https://ora.golfzoncounty.com'
where id = 'gc-4949c11c28bf';

-- needs_check: y | fill phone, fill homepage
-- original_name: 블랙스톤제주
update public.golf_courses
set
  phone = '064-795-2121',
  homepage_url = 'http://www.blackstoneresort.com/'
where id = 'gc-74de2175f831';

-- ok | fill phone, fill homepage
-- original_name: 더플레이어스 골프클럽
update public.golf_courses
set
  phone = '033-250-5000',
  homepage_url = 'https://www.clubd.com/theplayers/index.do'
where id = 'gc-56c3be8c5a61';

-- ok | fill phone, fill homepage
-- original_name: 성문안 컨트리클럽
update public.golf_courses
set
  phone = '033-769-7330',
  homepage_url = 'https://www.ittimes.com/news/articleView.html?idxno=85149'
where id = 'gc-3b9faaf01e87';

-- ok | fill phone, fill homepage
-- original_name: 동서울레스피아
update public.golf_courses
set
  phone = '031-595-5168',
  homepage_url = 'http://www.respia.com'
where id = 'gc-3eb069c5fb2a';

-- ok | fill phone, fill homepage
-- original_name: 클럽모우골프 &라이프스타일
update public.golf_courses
set
  phone = '033-439-9000',
  homepage_url = 'https://naver.me/IDkgvaK3'
where id = 'gc-426fc575906a';

-- ok | fill phone, fill homepage
-- original_name: 벨라45마스터스 컨트리클럽
update public.golf_courses
set
  phone = '02-0120-2400',
  homepage_url = 'http://www.bella45.com'
where id = 'gc-a09581c58781';

-- ok | fill phone, fill homepage
-- original_name: 에콜리안정선골프장
update public.golf_courses
set
  phone = '033-378-7514',
  homepage_url = 'https://www.youtube.com/channel/UCE0kz3LFeT1dq41XmWfIGmQ/join'
where id = 'gc-c97aebfdffe3';

-- ok | fill phone, fill homepage
-- original_name: 석천CC
update public.golf_courses
set
  phone = '031-332-3323',
  homepage_url = 'https://naver.me/5huOa2Hn'
where id = 'gc-fc0e80550b95';

-- ok | fill phone, fill homepage
-- original_name: 한양컨트리클럽
update public.golf_courses
set
  phone = '031-960-6900',
  homepage_url = 'https://gongu.copyright.or.kr/'
where id = 'gc-27324df1736a';

-- ok | fill phone, fill homepage
-- original_name: 김포SEASIDE 컨트리클럽
update public.golf_courses
set
  phone = '031-987-9992',
  homepage_url = 'http://www.gimpocc.co.kr'
where id = 'gc-a68be6870289';

-- ok | fill phone, fill homepage
-- original_name: 베스트밸리 골프클럽
update public.golf_courses
set
  phone = '031-950-7777',
  homepage_url = 'http://www.dennisgc.com'
where id = 'gc-fb2e8a3b34d8';

-- ok | fill phone, fill homepage
-- original_name: 안성베네스트G.C
update public.golf_courses
set
  phone = '031-670-0700',
  homepage_url = 'https://naver.me/Ge7dXvsh'
where id = 'gc-2e3210c9d979';

-- ok | fill phone, fill homepage
-- original_name: 안성베네스트골프클럽 일반대중홀
update public.golf_courses
set
  phone = '031-670-0703',
  homepage_url = 'https://www.benestgolf.com'
where id = 'gc-8f72ace0d89a';

-- ok | fill phone, fill homepage
-- original_name: 신안 퍼블릭 CC
update public.golf_courses
set
  phone = '031-672-0071',
  homepage_url = 'https://open.kakao.com/o/srV0xGMb'
where id = 'gc-2c90528d411e';

-- ok | fill phone, fill homepage
-- original_name: 베어크리크골프클럽
update public.golf_courses
set
  phone = '031-533-9575',
  homepage_url = 'https://naver.me/GpazYX8d'
where id = 'gc-fb0d61e3914d';

-- ok | fill phone, fill homepage
-- original_name: 참밸리 컨트리클럽
update public.golf_courses
set
  phone = '031-861-6123',
  homepage_url = 'https://band.us/n/a0a8b0SaE6HbL'
where id = 'gc-825e9c261de2';

-- ok | fill phone, fill homepage
-- original_name: 더스타휴 컨트리클럽
update public.golf_courses
set
  phone = '031-770-9900',
  homepage_url = 'https://www.youtube.com/channel/UCkKRXhkY6fcLVT8MLc3FH3Q/join'
where id = 'gc-a15f33b9f89a';

-- ok | fill phone, fill homepage
-- original_name: 남여주대중골프장
update public.golf_courses
set
  phone = '031-880-6700',
  homepage_url = 'http://www.namyeoju.co.kr'
where id = 'gc-59ee5f28d2c8';

-- ok | fill phone, fill homepage
-- original_name: 통영동원로얄컨트리클럽
update public.golf_courses
set
  phone = '02-0120-1800',
  homepage_url = 'https://band.us'
where id = 'gc-d18fa63ecde3';

-- ok | fill phone, fill homepage
-- original_name: 김해상록컨트리클럽
update public.golf_courses
set
  phone = '055-340-1400',
  homepage_url = 'https://naver.me/5bV6n988'
where id = 'gc-49239d9192d1';

-- ok | fill phone, fill homepage
-- original_name: 포항C.C
update public.golf_courses
set
  phone = '054-230-2000',
  homepage_url = 'https://www'
where id = 'gc-9c3aa425a935';

-- ok | fill phone, fill homepage
-- original_name: 오펠G.C
update public.golf_courses
set
  phone = '054-333-2100',
  homepage_url = 'https://www.leaderscc.com/'
where id = 'gc-dac303292dae';

-- ok | fill phone, fill homepage
-- original_name: 블루원상주골프리조트
update public.golf_courses
set
  phone = '054-1899-1888',
  homepage_url = 'https://sj.blueone.com/'
where id = 'gc-91f353d46004';

-- ok | fill phone, fill homepage
-- original_name: 다산 샤인힐CC
update public.golf_courses
set
  phone = '053-744-7477',
  homepage_url = 'http://www.imaeil.com/sub_news/sub_news_view.php?news_id=40699'
where id = 'gc-385ee578118d';

-- ok | fill phone, fill homepage
-- original_name: 한맥C.C&노블리아
update public.golf_courses
set
  phone = '054-650-7000',
  homepage_url = 'http://www.hmcn.co.kr/'
where id = 'gc-a1c00071e4b8';

-- ok | fill phone, fill homepage
-- original_name: 해운대비치골프앤리조트
update public.golf_courses
set
  phone = '051-726-0707',
  homepage_url = 'https://n.news.naver.com/mnews/article/082/0001367765#'
where id = 'gc-a9d6992e56d4';

-- ok | fill phone, fill homepage
-- original_name: 건설공제조합세종필드골프클럽
update public.golf_courses
set
  phone = '044-861-5678',
  homepage_url = 'http://www.sejongcc.com/'
where id = 'gc-dc3aed15fe4c';

-- ok | fill phone, fill homepage
-- original_name: 삼남골프장
update public.golf_courses
set
  phone = '055-382-7821',
  homepage_url = 'http://www.goldgreen.co.kr/'
where id = 'gc-8c92f9985671';

-- ok | fill phone, fill homepage
-- original_name: 웅포컨트리클럽
update public.golf_courses
set
  phone = '063-720-7000',
  homepage_url = 'http://www.bearportcc.co.kr/'
where id = 'gc-45a6c468cd91';

-- ok | fill phone, fill homepage
-- original_name: 케이밸리컨트리클럽
update public.golf_courses
set
  phone = '063-263-2555',
  homepage_url = 'https://www.kvalleycc.co.kr/mobile/index.asp'
where id = 'gc-0bd7dd5c03df';

-- ok | fill phone, fill homepage
-- original_name: 프린세스 골프클럽
update public.golf_courses
set
  phone = '041-851-6300',
  homepage_url = 'https://www.princessgc.co.kr'
where id = 'gc-9655898af6a6';

-- ok | fill phone, fill homepage
-- original_name: 도고컨트리 구락부
update public.golf_courses
set
  phone = '041-542-6031',
  homepage_url = 'https://www.dogocc.co.kr/'
where id = 'gc-e91593f65b4b';

-- ok | fill phone, fill homepage
-- original_name: 임페리얼레이크
update public.golf_courses
set
  phone = '043-853-5555',
  homepage_url = 'https://naver.me/xjYVIOSx'
where id = 'gc-ae86fbe36e97';

-- ok | fill phone, fill homepage
-- original_name: 에콜리안제천
update public.golf_courses
set
  phone = '043-642-9474',
  homepage_url = 'https://www.daehocc.co.kr/index.asp'
where id = 'gc-3d728357d622';

-- ok | rename, fill phone, fill homepage
-- original_name: 드림파크골프장
-- change_name_to: 드림파크CC
update public.golf_courses
set
  name = '드림파크CC',
  phone = '032-560-9449',
  homepage_url = 'https://www.dreamparkcc.or.kr/'
where id = 'gc-fa86c43067e7';
