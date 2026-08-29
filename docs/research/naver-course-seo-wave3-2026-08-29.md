# Naver course SEO Wave 3 research ledger

Date: 2026-08-29

Window: latest 7 days supplied from Naver Search Advisor

Scope: course-detail overrides only; no raw dataset or Production write

## Selection decision

The next wave is not a simple lowest-CTR list. Priority combines impression volume, room for improvement, identifiable booking/course intent, and whether official facts can be stated safely.

| Course ID | Page | Clicks | Impressions | CTR | Decision |
| --- | --- | ---: | ---: | ---: | --- |
| `gc-496303f3c77c` | Orange Dunes Yeongjong | 6 | 4,442 | 0.1% | Add a target-scoped override |
| `gc-f7e7bf534d31` | Ocean Hills Yeongcheon | 8 | 3,867 | 0.2% | Add a target-scoped override |
| `gc-783a937fe067` | M's Club Uiseong | 6 | 1,182 | 0.5% | Add a target-scoped override |
| `gc-bc41a2489944` | Iwish CC | 10 | 3,224 | 0.3% | Keep the existing override unchanged |
| `gc-411771a420e7` | Golfzon County Anseong W | 10 | 3,222 | 0.3% | Keep the existing override unchanged |

Iwish and Anseong W already have official-intent titles, descriptions, booking links and four FAQs. Their seven-day CTR alone does not establish a copy defect. They need another crawl window plus query-to-URL/rank and rendered Naver snippet evidence before another rewrite.

The `/map` page is also not changed. Its exact query `전국 골프장 지도` recorded 16 clicks / 364 impressions / 4.4%, so the page-level 1.5% aggregate is insufficient evidence to alter the map architecture or metadata in this wave.

## Production snapshot before implementation

| ID | Raw name | Type / holes | Raw homepage | Raw booking |
| --- | --- | --- | --- | --- |
| `gc-496303f3c77c` | 오렌지듄스 영종골프클럽 | 대중제 / 18 | `http://www.orangedunesyj.com` | null |
| `gc-f7e7bf534d31` | 오션힐스 영천CC | 회원제 / 27 | `https://oceanhills.com/` | null |
| `gc-783a937fe067` | 엠스클럽 의성 CC | 대중제 / 27 | `https://www.msclub.co.kr/` | null |

## Source ledger

### Orange Dunes Yeongjong (`gc-496303f3c77c`)

- Official introduction: <https://www.orangedunesyj.com/introduce>
  - current name: 오렌지듄스 영종골프클럽
  - public 18-hole course
- Official reservation guide: <https://www.orangedunesyj.com/reservation-guide>
  - membership login, lottery reservation and real-time reservation are provided
- Official real-time reservation: <https://www.orangedunesyj.com/calendar>
- Official homepage: <https://www.orangedunesyj.com/>
  - address: 인천광역시 영종구 영종해안남로321번길 184
  - representative phone: 032-745-3000

The Production raw address (`인천 중구 운서동 3215`), phone (`0507-1433-3026`) and HTTP homepage differ from the current official site. This PR corrects only the rendered course detail through the scoped override. A durable raw-data correction should be handled separately through the verified data-hygiene pipeline so the canonical ID remains unchanged.

### Ocean Hills Yeongcheon (`gc-f7e7bf534d31`)

- Official Yeongcheon page: <https://www.oceanhills.com/yc/introduction>
  - identifies 오션힐스 영천CC / 임고개발 주식회사
  - address: 경상북도 영천시 임고면 방목길 34-2
- Official reservation entry: <https://www.oceanhills.com/reservation/intro>
  - login is required
- Official terms: <https://www.oceanhills.com/agree?tab=2>
  - 영천 internet reservation eligibility is assigned to 정회원

The Production 27-hole/member identity is retained. Copy does not imply public or unrestricted non-member booking. The Production representative phone is retained as a GolfMap-registered value because the reviewed official pages do not publish a general course representative number clearly enough to replace it.

### M's Club Uiseong (`gc-783a937fe067`)

- Current official club information: <https://www.clublonge.com/Club/uiseong/Information>
- Current official course page: <https://www.clublonge.com/Club/uiseong/Course>
  - Champion, Master and Challenger courses; 27 holes total
- Current integrated reservation: <https://www.clublonge.com/Reservation>
  - the current service directs existing course members to join the integrated site
- The former official domain `https://www.msclub.co.kr/` redirects to CLUB LONGE.

The course name remains 엠스클럽 의성. CLUB LONGE is represented as the current reservation platform, not as a course rename. Search aliases preserve joined and spaced variants of the existing name.

## Approved copy constraints

- Four FAQs per target; the same override source feeds visible FAQ and FAQPage JSON-LD.
- No fixed green-fee claims. Final prices must be checked in the official reservation flow.
- Booking URLs use HTTPS and the official domains only.
- Existing seven overrides, including the three PR #28 overrides, remain unchanged.
- No override leakage to non-target courses.
- No raw CSV, Supabase, map, blog or shared course-detail implementation changes.

## Follow-up after indexing

Wait for a new Naver crawl/data window, then compare page and query impressions, CTR, query intent, and rendered snippets. Revisit Iwish and Anseong W only if the next dataset shows a specific snippet or intent mismatch rather than low aggregate CTR alone.
