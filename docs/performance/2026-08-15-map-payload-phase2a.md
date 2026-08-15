# `/map` payload Phase 2A

## Goal and scope

Remove the 532-course catalog from the initial `/map` HTML/RSC delivery while preserving the existing browser-owned search, filter, collection, region, favorites, visited, map/list, marker, and URL behavior.

- Base: `734f0dd1bbf1743a7e716d82e307bfefad789e0d`
- Branch: `perf/map-payload-phase2a`
- Dataset: 532 Production courses
- PR #22: referenced only; not based on, merged, cherry-picked, or closed
- No database schema/RPC/PostGIS, persistent cache, ISR, CDN rule, service-role key, custom domain, DNS, dependency, detail-page, SEO-copy, blog, collection-page, or region-page change

## Before call graph

```text
GET /map
└─ MapPage
   ├─ getCourses() -> Supabase select("*") -> 532 full Course rows
   ├─ toHomeCourses() -> 532 map-facing objects
   └─ HomeClient(courses) -> catalog serialized into initial HTML/RSC
```

The browser already owned all search/filter/map/list behavior, but the server loaded and serialized the entire catalog before the client could start.

## Field audit and DTO

The parity baseline is the existing `HomeCourse` projection, not the full database row. The new public `MapCourse` DTO intentionally retains that exact field/value behavior:

```text
id, name, region, city, address, latitude, longitude, courseType,
holeCount, phone, homepageUrl, tags, priceMin, priceMax, priceText,
weekdayGreenFeeMin, nightRound, noCaddie, twoPlayerAllowed, resort,
description, source, updatedAt
```

Why apparently non-card fields remain:

- `phone` and `homepageUrl`: collection score/count behavior
- `description` and `priceText`: public/par-3/nine-hole and price-aware collection behavior
- `priceMax`: mobile price fallback behavior
- `source` and `updatedAt`: required `Course` bookkeeping fields used by the existing structurally typed client pipeline

The new query lists the matching snake_case columns explicitly. It excludes booking details, weekend/caddie/cart fees, images, business status, price provenance, difficulty, rename/SEO aliases, and search keywords. No raw database rows or credentials are returned.

The automated check compared all 532 objects from the narrow query against the previous `toHomeCourses(getCourses())` result with deep equality. IDs, order, values, and optional-field presence matched exactly.

## After call graph

```text
GET /map
└─ MapPage
   ├─ parse URL state only
   └─ MapDataLoader shell (no catalog props/RSC)

browser hydration
└─ GET /api/map/courses
   └─ getMapCourses()
      └─ Supabase explicit narrow select -> 532 MapCourse DTOs
         └─ HomeClient(courses) -> unchanged browser behavior
```

`GET /api/map/courses` is `force-dynamic`, calls `unstable_noStore()`, sets `revalidate = 0`, and returns `private, no-cache, no-store, max-age=0, must-revalidate`. Errors are logged server-side while the client receives only a generic 500 response.

`MapDataLoader`:

- renders an accessible `aria-busy`/`role=status` shell before data is available
- never renders `HomeClient` with an empty array, preventing a false `0곳` result
- fetches with `cache: "no-store"`
- aborts the request on unmount with `AbortController`
- renders an explicit `role=alert` failure state with a retry button

## Production baseline

Measured from Seoul against `https://golfmap.kr/map` with seven sequential `curl` requests per representation. Sample 1 is the warm-up and excluded from median/p75/min/max. p75 uses nearest rank. Every accepted response was HTTP 200.

Production headers were `private, no-cache, no-store, max-age=0, must-revalidate`; `cf-cache-status`, `x-nextjs-cache`, and `server-timing` were absent.

Raw values are `TTFB ms / total ms`:

| Representation | Warm-up | Samples 2-7 | TTFB median / p75 / min / max | Total median / p75 / min / max | Bytes |
| --- | --- | --- | --- | --- | ---: |
| Raw | 1864.9 / 2274.5 | 1178.7/1635.4, 1846.2/2293.0, 965.4/1444.5, 1117.5/1563.7, 1601.9/2052.5, 1275.6/2280.2 | 1227.1 / 1601.9 / 965.4 / 1846.2 | 1844.0 / 2280.2 / 1444.5 / 2293.0 | 3,119,676 |
| gzip | 1647.0 / 1718.4 | 1114.9/1167.1, 1091.7/1171.1, 1398.5/1527.6, 1364.0/1458.0, 1362.2/1556.6, 1595.2/1693.7 | 1363.1 / 1398.5 / 1091.7 / 1595.2 | 1492.8 / 1556.6 / 1167.1 / 1693.7 | 127,837 |

Production filtered raw sizes:

| URL | Bytes |
| --- | ---: |
| `/map?q=지산` | 487,493 |
| `/map?holes=9홀` | 1,072,599 |
| `/map?view=list` | 3,119,799 |

## Isolated Preview

- Worker: `golfmap-korea-perf-map-phase2a`
- Version: `2736f28f-69a5-4dcd-818a-4290689e851b`
- URL: `https://golfmap-korea-perf-map-phase2a.sun15002000.workers.dev`
- workers.dev only; no routes or custom domains
- `cpu_ms=2000`
- Production dataset guard: 532 courses and known IDs PASS
- `X-Robots-Tag: noindex, nofollow, noarchive`
- `/map` and API retain explicit no-store response headers

The first deploy-propagation sample contained two transient 404s and was discarded. The stabilized set below contains seven consecutive HTTP 200 responses for every series.

### Initial `/map`

| Representation | Warm-up | Samples 2-7 | TTFB median / p75 / min / max | Total median / p75 / min / max | Bytes |
| --- | --- | --- | --- | --- | ---: |
| Raw | 680.8 / 681.1 | 205.6/205.8, 205.2/205.5, 195.8/196.2, 192.9/193.1, 215.9/216.3, 217.6/219.1 | 205.4 / 215.9 / 192.9 / 217.6 | 205.7 / 216.3 / 193.1 / 219.1 | 22,179 |
| gzip | 185.0 / 186.1 | 269.8/270.7, 202.6/203.5, 490.7/491.7, 179.6/180.4, 204.8/204.9, 422.5/422.6 | 237.3 / 422.5 / 179.6 / 490.7 | 237.8 / 422.6 / 180.4 / 491.7 | 4,947 |

### `GET /api/map/courses`

| Representation | Warm-up | Samples 2-7 | TTFB median / p75 / min / max | Total median / p75 / min / max | Bytes |
| --- | --- | --- | --- | --- | ---: |
| Raw | 1069.1 / 1283.2 | 722.2/855.1, 773.7/984.3, 555.5/685.1, 1344.8/1512.7, 546.0/705.4, 527.7/668.6 | 638.9 / 773.7 / 527.7 / 1344.8 | 780.3 / 984.3 / 668.6 / 1512.7 | 344,221 |
| gzip | 791.9 / 799.6 | 580.0/584.1, 752.2/755.3, 570.3/576.2, 687.4/691.5, 709.6/710.3, 505.0/509.6 | 633.7 / 709.6 / 505.0 / 752.2 | 637.8 / 710.3 / 509.6 / 755.3 | 49,724-49,916 |

Filtered Preview responses remained shell-sized:

| URL | Raw bytes | gzip bytes |
| --- | ---: | ---: |
| `/map?q=지산` | 22,233 | 4,991 |
| `/map?holes=9홀` | 22,233 | 4,987 |
| `/map?view=list` | 22,218 | 4,975 |
| `/map?collection=near-seoul` | 22,241 | 4,983 |
| `/map?region=gyeonggi` | 22,227 | 4,980 |

## Payload outcome

| Measure | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Initial raw `/map` | 3,119,676 B | 22,179 B | 99.29% |
| Initial gzip `/map` | 127,837 B | 4,947 B | 96.13% |
| Initial + API raw | 3,119,676 B | 366,400 B | 88.26% |
| Initial + API gzip | 127,837 B | about 54,775 B | about 57.15% |

The initial raw target below 500 KB and at least 70% reduction both pass. The API gzip target below 200 KB passes at about 50 KB.

Ten known Production course IDs were checked against the Preview initial HTML/RSC and none were embedded. The initial HTML contains the accessible loading text but contains neither `검색 결과 0곳` nor `전체 골프장 532곳`.

Network TTFB is indicative only because the workers.dev Preview and Production custom domain are different delivery paths. The deterministic result is the removal of the catalog and DB query from the initial response, plus the measured payload reduction. No Production-vs-Preview TTFB percentage claim is made.

## Behavior parity and browser QA

Automated Production-data parity:

- 532/532 DTO deep equality, ID equality, and order equality: PASS
- DTO allowlist and forbidden-field checks: PASS
- 30 filter cases: PASS
- 24 search queries and suggestion result/order: PASS
- 13 collection filters/counts: PASS
- 9 region counts: PASS
- favorites/visited ID filtering: PASS
- ten list/card/external-map/marker snapshots: PASS
- query contains no `select("*")`: PASS

Preview browser QA:

- `q=지산&view=list`: exactly three expected results and URL state preserved
- combined `region_filter`, `holes`, `operation`, `price`, `tag`, and `view` URL remained intact
- mobile map/list tabs updated the URL and rendered the three expected markers/list entries
- favorites-only and visited-only UI each reduced a controlled saved set to one article; test state was cleaned afterward
- 360x800, 390x844, 430x900, and 1280x800: no horizontal overflow
- data-ready wall time after reload in the same Preview browser session: 929 ms, 901 ms, 826 ms, and 595 ms respectively
- browser console warnings/errors on the representative map load: none
- isolated failure test with Production fallback protection and missing Supabase config: API returned 500 twice; accessible error text and retry button appeared; retry issued the second request and returned to the error state; no false zero-result state

PR #28 regression on Preview:

- 아이위시, 유니밸리, 포웰 프린세스 titles and Production canonicals: PASS
- four visible FAQ entries and four `FAQPage.mainEntity` entries on each target: PASS
- official booking links remained target-scoped: PASS
- 아이위시 9-hole wording, 유니밸리 9-hole registration versus 18-hole booking-product distinction, and 포웰 unverified 18-hole removal remain covered by `check:course-page-overrides`: PASS

General Preview smoke:

- `/`, `/map`, filtered `/map`, collection, region, blog, robots, sitemap, four course details, and `/api/map/courses`: HTTP 200
- course detail Phase 1 nearby parity: 532/532 PASS
- dataset returned by the API: 532 courses

## Verification

- `npm ci`: PASS; existing audit reported 21 vulnerabilities, no dependency changes
- `npm run check:course-page-overrides`: PASS, 3 pages
- `npm run check:course-detail-fetch-phase1`: PASS, 532-course parity
- `npm run check:map-payload-phase2a`: PASS
- `npx tsc --noEmit`: PASS
- `npm run check:blog-posts`: PASS, 32 posts
- `npm run verify:related-blogs`: PASS
- `npm run audit:structured-data`: PASS, no issues
- `npm run build` with Production data: PASS, 532 course routes
- `npm run cf:build`: PASS
- `npm run cf:assert-data`: PASS, 532 courses and known IDs
- `npm run cf:check-build`: PASS
- `npm run cf:smoke` against the isolated Worker: PASS

## Deferred and cleanup

- Server-side map filtering, pagination, viewport queries, and client normalization are deferred to later phases.
- Cache/ISR/CDN and schema/RPC/PostGIS changes remain out of scope.
- The isolated Preview Worker and branch remain available until merge and Production smoke are separately approved and completed.
- Production merge and deployment were not performed in this phase.

Production deployment was NOT performed.
