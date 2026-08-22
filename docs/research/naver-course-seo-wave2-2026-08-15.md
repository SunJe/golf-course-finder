# 네이버 Course Detail SEO Wave 2 사실 확인

조사 패키지 기준일: 2026-08-15

구현 전 재검증일: 2026-08-22

기준 Production master: `b954ada4d16392bf34231976d86982da6fdd77c2`

## Naver opportunity snapshot

네이버 서치어드바이저 TOP 30 전사본에서 이미 노출이 크지만 CTR이 낮고, 현재 정보의 정확성도 보강할 수 있는 네 상세 페이지만 선정했다.

| Course ID | 검색 문서 노출 | 클릭 | CTR |
| --- | ---: | ---: | ---: |
| `gc-825e9c261de2` | 3,294 | 16 | 0.5% |
| `gc-e2614722e86e` | 2,093 | 32 | 1.5% |
| `gc-9bd0f98bfdee` | 2,007 | 22 | 1.1% |
| `gc-411771a420e7` | 1,110 | 10 | 0.9% |

PR #28의 칠곡 아이위시CC·포웰CC 프린세스·고령 유니밸리CC는 이번 변경 대상에서 제외했다.

## Production row before

Production mode에서 저장소의 `getCourseById()`로 2026-08-22에 직접 읽은 값이다. 빈 칸은 row mapping 결과 `undefined`였다.

| Course ID | name / changeNameTo | aliases | address | phone | homepage / booking | holes / type | price fields |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `gc-825e9c261de2` | 코브스윙(참밸리CC) / 동일 | 자동 생성 6개 | 경기도 포천시 삼육사로 1982 | 1899-6200 | `https://coveswing.com/` / — | 18 / 대중제 | 100,000~200,000원, source Naver, 2026-06-23 |
| `gc-e2614722e86e` | 포천아도니스CC 퍼블릭 / 동일 | 자동 생성 6개 | 경기도 포천시 신북면 포천로 2499 | 031-530-9100 | `http://www.adoniscc.co.kr/` / — | 9 / 대중제 | 평일 90,000~100,000원·주말 120,000~130,000원, reservation_reference, 2026-06-26 |
| `gc-9bd0f98bfdee` | 가야CC(퍼블릭) / 동일 | 가야CC 등 5개 | 김해시 인제로 495 | 055-337-0091 | `http://www.gayacc.com/` / — | 9 / 대중제 | 평일 55,000~60,000원·주말 90,000원, reservation_reference, 2026-06-26 |
| `gc-411771a420e7` | 골프존카운티 안성W / 동일 | 자동 생성 6개 | 경기도 안성시 양성면 교동길 19-70 | 031-670-0500 | 공식 club URL / — | 18 / 대중제 | 80,000~220,000원, source Naver, 2026-06-23 |

가격 필드는 row audit 목적으로만 기록했다. 변동 가능성이 있어 SEO title, meta description, FAQ에는 고정 금액을 사용하지 않는다.

## Source ledger summary and field decisions

### 코브스윙 (`gc-825e9c261de2`)

- [공식 홈페이지](https://coveswing.com/)에서 현재 브랜드 `COVE Swing`, 대표번호 1899-6200을 재확인했다.
- [공식 코스 소개](https://www.coveswing.com/mobile/course/courseIntro.asp)는 코브 9홀 파36과 스윙 9홀 파36을 안내한다.
- [공식 이용 안내](https://coveswing.com/mobile/guide/guide.asp)는 홈페이지 예약이 이용일 3주 전에 열린다고 안내한다.
- Production의 주소·전화·홈페이지·18홀은 이미 유효하므로 덮어쓰지 않는다. 상세 표시명과 검색 별칭만 현재 브랜드/구 명칭 조합으로 보강한다.
- canonical ID와 URL은 유지한다.

### 아도니스 퍼블릭 (`gc-e2614722e86e`)

- [공식 퍼블릭 홈](https://www.adoniscc.co.kr/public)에서 현재 명칭, 주소, 퍼블릭 전화 031-530-9140을 재확인했다.
- [공식 소개](https://www.adoniscc.co.kr/public/intro)는 퍼블릭 코스를 9홀로 안내한다.
- [공식 예약 안내](https://www.adoniscc.co.kr/public/booking/guide)는 2~4인 예약, 2인·9홀 2주 전 오픈, 3·4인 18홀 3주 전 오픈, 1~3인 조인, 당일 전화 예약을 함께 안내한다.
- 공식 메뉴의 `퍼블릭 예약`을 실제 브라우저에서 클릭해 `https://www.adoniscc.co.kr/public/booking`으로 이동하고, 비로그인 상태에서는 정상 로그인 안내를 표시하는 것을 확인했다.
- Production의 이름·전화·HTTP 홈페이지가 현재 공식 정보와 달라 상세 페이지 범위에서 표시명·전화·HTTPS 홈페이지를 보강한다.

### 가야컨트리클럽 퍼블릭 (`gc-9bd0f98bfdee`)

- [공식 홈페이지](https://www.gayacc.com/main_new.php) footer에서 경상남도 김해시 인제로 502와 대표전화 055-337-0091을 재확인했다.
- [한국관광공사 VisitKorea](https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=95767)는 회원제 45홀과 일반 이용 퍼블릭 9홀, 인제로 502를 함께 안내한다.
- [경상남도 공공데이터](https://www.data.go.kr/data/15142826/fileData.do?recommendDataYn=Y)는 2026-06-24 기준 자료이며, 패키지 원문 대조에서 퍼블릭 9홀 주소 502와 회원제 45홀 주소 495를 구분했다.
- 공식 메뉴가 노출한 퍼블릭 9홀 예약 href를 브라우저에서 열어 `https://www.gayacc.com/reserve.php?location=04`의 제목과 H1이 `퍼블릭 9홀 인터넷예약`임을 확인했다.
- 이미 정확한 전화는 덮어쓰지 않고, 이 퍼블릭 상세에만 표시명·주소·HTTPS 홈페이지·별칭을 보강한다. `gc-5384133fb9bc` 가야CC 회원제는 변경하지 않는다.

### 골프존카운티 안성W (`gc-411771a420e7`)

- [공식 골프장 소개](https://www.golfzoncounty.com/golfclub/intro?golfclubSeq=2)에서 18홀 파72, 주소, 대표번호 031-670-0500을 재확인했다.
- [공식 예약 안내](https://www.golfzoncounty.com/golfclub/resvGuide?golfclubSeq=2)는 매주 월요일 09:00, 오픈 주 포함 4주 뒤 일정 오픈과 전화 예약 09:00~17:00을 안내한다.
- [공식 통합 예약](https://www.golfzoncounty.com/reserve/main)은 현재 운영 중이다.
- Production의 표시 데이터는 이미 정확하므로 예약 URL과 SEO/FAQ만 보강한다.

## Copy decisions

- research package의 title, meta description, 코스별 FAQ 4개를 그대로 사용했다.
- FAQ visible UI와 FAQPage JSON-LD는 기존 구조대로 같은 `pageOverride.faq` 배열을 사용한다.
- 코브스윙 title·FAQ·별칭에는 구 명칭 `참밸리CC`를 남겼다.
- 아도니스는 `2인 예약 가능`과 `1~3인 조인`을 같은 FAQ에서 함께 설명한다.
- 가야는 퍼블릭 9홀과 회원제 45홀을 분리하고, 퍼블릭 주소 502를 명시한다.
- 안성W는 공식 예약 오픈 규칙과 전화 업무시간만 evergreen 정보로 사용한다.

## Excluded claims

- 네 코스 모두 고정 그린피를 title, meta description, FAQ에 사용하지 않았다.
- 아도니스의 기간 한정 `2인 단독 플레이` 프로모션을 상시 조건으로 쓰지 않았다.
- 안성W의 야간·셀프 상품을 상시 노캐디/상시 셀프로 단정하지 않았다.
- 골드리버CC는 최신 홀 구성에 관한 공식 검증이 충분하지 않아 Wave 2에서 제외했다.
- 전역 DB mapper, map DTO, 검색·필터 알고리즘과 Production DB는 변경하지 않았다.

## Tests and Preview

### Local / production-data checks

- `npm ci`: PASS
- `npm run check:course-page-overrides`: PASS — override ID 7개, PR #28 exact hash, 비대상 6개 보호
- `npm run check:course-detail-fetch-phase1`: PASS — Production 532/532 parity
- `npm run check:map-payload-phase2a`: PASS — Production 532개, filter/search/suggestion/collection/region parity
- `npx tsc --noEmit`: PASS
- `npm run check:blog-posts`: PASS — 32 posts
- `npm run verify:related-blogs`: PASS
- `npm run audit:structured-data`: PASS — Production 532개, issue 0
- `npm run build`: PASS — 601 static pages, course detail 532개
- sitemap course URL count: 532, 변경 없음
- `npm run cf:build`: PASS — Production data guard 532, OpenNext bundle 생성
- `npm run cf:check-build`: PASS
- `git diff --check`: PASS

저장소에 ESLint 설정이 없어 `npm run lint`는 검사를 실행하지 않고 초기 설정 선택 prompt에서 종료됐다. Next build의 내장 lint/type 단계와 별도 TypeScript 검사는 통과했다.

### Isolated workers.dev Preview

- Worker: `golfmap-korea-seo-wave2`
- Version: `8d0f29f7-b0c7-4847-a22c-2781ab9a805e`
- URL: `https://golfmap-korea-seo-wave2.sun15002000.workers.dev`
- custom domain / DNS route: 없음
- `X-Robots-Tag`: `noindex, nofollow, noarchive`
- `/api/map/courses`: HTTP 200, Production DTO 532개
- 기본 Cloudflare smoke: home, map, collections, blog, robots, sitemap 모두 PASS

네 target 모두 HTTP 200이며 예상 title, meta description, canonical, H1, 주소·전화, 공식 booking URL, FAQ 4개가 확인됐다. 각 visible FAQ와 FAQPage JSON-LD의 질문·답변 배열은 exact match다.

PR #28 세 target은 validator의 기준 SHA-256과 Preview의 title/meta/canonical/H1/FAQ/JSON-LD가 모두 기존 Production과 일치했다. 지산·태광·골드리버·계룡산·가야 회원제·인천그랜드 비대상 샘플도 title/meta/canonical/H1/Course JSON-LD가 Production과 일치하고 FAQ 누출이 없다. 가야 회원제는 주소 495를 유지하며 퍼블릭 주소 502가 누출되지 않았다.

네 target을 360, 390, 430, 1280 폭에서 확인했고 수평 overflow, hydration 오류, console warning/error가 없었다. workers.dev에서는 외부 Kakao Map 도메인 설정 차이로 지도 fallback 문구가 보일 수 있으나 상세 SEO/데이터 및 페이지 기능 검증에는 영향이 없고, 코드·Production 설정은 변경하지 않았다.
