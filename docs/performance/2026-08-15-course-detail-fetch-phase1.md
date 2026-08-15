# Course detail fetch Phase 1

## Goal

Reduce database work for a course-detail HTML request without changing cache policy, nearby ranking, SEO output, `/map`, database schema, or Production routing.

- Base: `536b7311150924eb551e17c7e745fe1aae4ac5dc`
- Branch: `perf/course-detail-fetch-phase1`
- Dataset: 532 Production courses

## Production baseline

Measured from Seoul against `https://golfmap.kr` with seven sequential `curl` requests per page. Sample 1 is shown as warm-up and excluded from median/p75/min/max. p75 uses nearest rank.

Every response was HTTP 200. `cache-control` was `private, no-cache, no-store, max-age=0, must-revalidate`; `cf-cache-status`, `x-nextjs-cache`, and `server-timing` were absent.

Raw values are `TTFB ms / total ms`:

| Course | Warm-up | Samples 2-7 | TTFB median / p75 / min / max | Total median / p75 / min / max |
| --- | --- | --- | --- | --- |
| 지산퍼블릭 | 1831.4 / 1878.7 | 1626.0/1677.1, 911.6/954.8, 791.0/842.6, 972.4/1030.0, 736.8/786.5, 568.1/614.2 | 851.3 / 972.4 / 568.1 / 1626.0 | 898.7 / 1030.0 / 614.2 / 1677.1 |
| 고령유니밸리CC | 705.6 / 766.7 | 1531.5/1618.2, 761.5/823.6, 820.8/971.8, 757.2/814.2, 1035.9/1084.2, 712.5/769.2 | 791.1 / 1035.9 / 712.5 / 1531.5 | 897.7 / 1084.2 / 769.2 / 1618.2 |
| 칠곡아이위시CC | 1182.8 / 1233.6 | 687.2/751.9, 556.2/628.0, 1432.9/1557.0, 1744.9/1820.2, 723.4/780.3, 718.0/769.3 | 720.7 / 1432.9 / 556.2 / 1744.9 | 774.8 / 1557.0 / 628.0 / 1820.2 |

Production response sizes were 90,040, 91,793, and 92,443 bytes respectively.

## Before call graph

The master implementation was confirmed as:

```text
generateMetadata
└─ getCourseById(id) -> Supabase select("*")

CourseDetailPage
├─ getCourseById(id) -> Supabase select("*")
├─ getCourses() -> Supabase select("*") for all 532 rows
└─ getNearbyCourses(allCourses, course, 6)
```

The nearby UI consumes id, name, region/city/address, coordinates, course type, hole count, weekday fee, minimum display price, image, and the required Course bookkeeping fields. It does not consume description, aliases, search keywords, difficulty, contact/booking fields, or enrichment from nearby candidates.

The existing nearby behavior is global nearest six: self and invalid coordinates are excluded, Haversine distance is sorted ascending, and the 50 km preferred branch falls back to the same global ranking when fewer than six exist.

## Existing PR #22 note

PR #22 is an unmerged historical experiment. It was not used as a base, merged, or cherry-picked. Its fixed 50 km candidate-query limitation was not copied. `/map` remains out of scope and unchanged.

## Implementation

### getCourseById request memoization

`getCourseByIdUncached()` retains `unstable_noStore()` and all Production guard/fallback behavior. One module-level React `cache()` wrapper is shared by `generateMetadata` and `CourseDetailPage`. Plain `tsx` maintenance scripts run the uncached function because the installed client React CJS export does not expose `cache`; the actual Next server runtime does.

Temporary request instrumentation, removed before commit, proved:

- Before: the same detail request entered the underlying by-id function twice.
- After: the same detail request entered it once.
- No `unstable_cache`, persistent cache, or cross-request cache was introduced.

### Adaptive nearby candidate query

`getNearbyCoursesForCourse(course, 6)` replaces the detail page's `getCourses()` call.

- Spherical bounding box: Earth angular distance, latitude bounds, and `asin(sin(delta) / cos(latitude))` longitude bounds.
- Antimeridian and polar bounds are handled.
- Radius sequence: 50, 100, 200, 400, 800 km.
- Candidates are ranked by the existing Haversine implementation.
- A radius is accepted only when the sixth actual distance is within that radius, which proves that a closer result cannot be outside the box.
- The final fallback queries every coordinate using the same narrow select, never `select("*")`, then applies the existing global ranker.
- Invalid current coordinates still return `[]` without a query.
- Production errors still fail through `rejectMockFallback`; non-Production retains mock fallback behavior.

Selected columns:

```text
id, name, region, city, address, latitude, longitude, hole_count,
course_type, weekday_green_fee_min, tags, image_url, source,
updated_at, price_min
```

## Query/work comparison

| Operation | Before | After |
| --- | ---: | ---: |
| by-id Supabase read | 2 | 1 |
| full-list DB read for nearby | 1 | 0 |
| nearby-specific reads | 0 | 1-N bounded reads; narrow global fallback only |
| full `select("*")` rows for nearby | 532 | 0 |
| nearby candidate rows | 532 full objects | 32-163 narrow rows in six representative Production fixtures |

All six representative courses completed at the first 50 km radius:

| Course | Candidate rows | Queries |
| --- | ---: | ---: |
| 지산퍼블릭 | 163 | 1 |
| 고령유니밸리CC | 32 | 1 |
| 칠곡아이위시CC | 34 | 1 |
| 포웰CC프린세스 | 56 | 1 |
| 골프존카운티 오라 (제주) | 39 | 1 |
| 123골프클럽 (수도권) | 100 | 1 |

`getCourses()` itself and its `/map` consumer were not changed. The regression script confirms its 532 IDs/order remain the same as the static full-list read.

## Nearby parity

The BEFORE fixture saved exact IDs and names for the four required targets, one 제주 target, and one 수도권 target. The automated check then compared the old full-catalog algorithm with the adaptive algorithm for all 532 Production courses.

- Dataset tested: 532/532
- Exact nearby IDs: PASS
- Exact nearby order: PASS
- Self exclusion and limit: PASS
- Invalid coordinates: PASS, no loader call
- Dense region: PASS, first 50 km query completes
- Sparse synthetic region: PASS, expands through all radii and uses narrow global fallback

## PR #28 SEO regression

Browser-rendered Preview QA confirmed for 아이위시, 포웰, and 유니밸리:

- Existing title, description/canonical path, `pageOverride`, and `displayCourse` flow are unchanged.
- Canonicals still point to `https://golfmap.kr/courses/<id>`.
- Visible FAQ: four `<details>` entries per page.
- `FAQPage`: four entities from the same source.
- Official booking URLs remain scoped to the same three pages.
- Nearby calculations still use the original course while UI and JSON-LD use `displayCourse` as before.

## Tests

- `npm ci`: PASS (existing audit reported 21 dependency vulnerabilities; no dependency changes made)
- `npm run check:course-page-overrides`: PASS, 3 pages
- `npx tsc --noEmit`: PASS
- `npm run check:blog-posts`: PASS, 32 posts
- `npm run verify:related-blogs`: PASS
- `npm run audit:structured-data`: PASS, no issues
- `npm run check:course-detail-fetch-phase1`: PASS, 532-course parity plus actual Production bbox queries
- Request dedupe dev instrumentation: PASS, 2 -> 1 underlying by-id calls
- `npm run build` with Production data: PASS, 532 course routes
- `npm run cf:build`: PASS
- `npm run cf:assert-data`: PASS, 532 courses and known IDs
- `npm run cf:check-build`: PASS

## Preview performance

Isolated Worker:

- Worker: `golfmap-korea-perf-course-detail`
- Version: `bd408b35-a96f-4240-9b1b-736d7b4fd178`
- URL: `https://golfmap-korea-perf-course-detail.sun15002000.workers.dev`
- workers.dev only, no routes/custom domains, `cpu_ms=2000`, Production dataset 532
- `X-Robots-Tag: noindex, nofollow, noarchive`

All main smoke paths and four detail paths returned 200. Browser QA at 390x844 found no horizontal overflow, nearby cards/order and map area rendered, expected CTAs were present, and no console warning/error was captured.

The stabilized Preview run below used the same seven-request method. Sample 1 is warm-up and excluded from statistics. Raw values are `TTFB ms / total ms`:

| Course | Warm-up | Samples 2-7 | TTFB median / p75 / min / max | Total median / p75 / min / max | Bytes |
| --- | --- | --- | --- | --- | ---: |
| 지산퍼블릭 | 998.4/1078.4 | 866.1/915.5, 864.5/912.3, 803.3/852.8, 855.5/918.1, 827.5/876.6, 803.3/854.7 | 841.5 / 864.5 / 803.3 / 866.1 | 894.4 / 915.5 / 852.8 / 918.1 | 84,474 |
| 고령유니밸리CC | 865.1/944.4 | 798.1/848.6, 1055.4/1114.1, 727.1/784.4, 777.0/838.4, 808.8/865.2, 786.7/834.6 | 792.4 / 808.8 / 727.1 / 1055.4 | 843.5 / 865.2 / 784.4 / 1114.1 | 86,119 |
| 칠곡아이위시CC | 771.3/823.4 | 802.1/859.9, 929.9/1013.2, 822.4/880.5, 784.3/835.0, 690.7/743.5, 700.7/754.4 | 793.2 / 822.4 / 690.7 / 929.9 | 847.5 / 880.5 / 743.5 / 1013.2 | 86,676 |

All Preview responses were HTTP 200 with the same detail `cache-control`; `cf-cache-status`, `x-nextjs-cache`, and `server-timing` were absent. HTML response size fell by about 6.2% for all three pages because the six nearby entries no longer serialize unused full-course fields.

A first immediate post-deploy Preview set was noisier, especially for 지산 (post-warm-up TTFB median 1321 ms). A repeat stabilized to the table above. A contemporaneous Production repeat produced TTFB median/p75 of 899/1179 ms (지산), 806/846 ms (유니밸리), and 717/757 ms (아이위시). This is mixed rather than a uniform TTFB win, and does not show a repeatable broad regression.

## Interpretation

The deterministic acceptance signal is DB work: one duplicate by-id query and the 532-row full-object nearby read are removed while all 532 nearby rankings remain identical. Network TTFB is indicative only because the workers.dev Preview and Production custom domain are different delivery paths and Supabase latency varies. Two pages were similar or better in the stabilized comparison; 아이위시는 modestly slower in the contemporaneous comparison. No fixed percentage improvement is claimed.

## Deferred

- Removing `noStore`, ISR, tagged revalidation, or any persistent cache
- OpenNext cache MISS and Cloudflare HTML cache rules
- `/map` RSC/payload redesign
- AdSense deferral
- LCP image priority work
