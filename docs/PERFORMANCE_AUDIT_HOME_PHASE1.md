# Home Page Performance Audit — Phase 1

**Project:** GolfMap Korea (`golf-course-finder`)  
**Route focus:** `/`  
**Date:** 2026-06-20  
**Data source:** Vercel Speed Insights (Production, Last 7 Days, South Korea)

---

## 1. Baseline metrics (before Phase 1)

### Desktop

| Metric | Value | Rating |
|--------|-------|--------|
| Real Experience Score | **52** | Needs Improvement |
| Route `/` score | **42** | Poor |
| FCP | 3.04s | Needs Improvement |
| LCP | 4.22s | Needs Improvement |
| **CLS** | **0.55** | **Poor** |
| INP | 144ms | Good |
| TTFB | 0.03s | Good |

### Mobile

| Metric | Value | Rating |
|--------|-------|--------|
| Real Experience Score | **65** | Needs Improvement |
| Route `/` score | **67** | Needs Improvement |
| FCP | 3.31s | Poor |
| LCP | 5.3s | Poor |
| CLS | 0.08 | Good |
| INP | 224ms | Needs Improvement |
| TTFB | 0.17s | Good |

### Other routes (healthy)

- `/collections/[slug]`: 77
- `/courses/[id]`: 86
- `/regions/gyeonggi`: 100

**Conclusion:** Server response is fast. The bottleneck is client-side on `/` only.

---

## 2. Likely bottlenecks

### Desktop CLS (0.55) — highest priority

- Map/sidebar split layout may resize before Kakao map SDK is ready.
- Map container height not fully reserved during SDK/tile load.
- Filter/header rows may shift when client components hydrate or counts update.

### Mobile LCP (5.3s)

- Large `HomeClient` client bundle hydrates map + list + filters + mobile hub together.
- Kakao Maps SDK + tile rendering may become LCP if map is above the fold after scroll.
- If map is below fold, LCP may be delayed by JS execution from `HomeClient` hydration.
- 532 full course objects increase RSC → client payload and hydration cost.

### Bundle / hydration

- `HomeClient.tsx` (~1,200 lines) imports heavy map stack synchronously.
- `KakaoCourseMap.tsx` (~1,400 lines) loads on home mount.
- Desktop and mobile logic share one client tree.

### Data payload

- Home passed full `Course` objects including fields unused on list/map first paint:
  `bookingUrl`, `imageUrl`, `caddieFee`, `cartFee`, `priceType`, `priceSourceUrl`, `priceUpdatedAt`, `businessStatus`, `weekendGreenFeeMin`, etc.

---

## 3. Quick wins

| # | Item | Expected impact | Risk |
|---|------|-----------------|------|
| 1 | Stable desktop map/list dimensions + skeleton | CLS high | Low |
| 2 | `MapSkeleton` placeholder | CLS high, LCP small | Low |
| 3 | `next/dynamic` for `CourseMap` | FCP/LCP moderate | Medium-low |
| 4 | Defer mobile map mount until section visible / CTA | Mobile FCP/LCP high | Medium |
| 5 | Slim `HomeCourse` payload | FCP/hydration moderate | Medium-low |
| 6 | Mobile list initial 25 + “더 보기” | INP moderate | Medium-low |

---

## 4. Medium-term (deferred)

- Split `HomeClient` into `DesktopHomeShell` / `MobileHomeShell` islands.
- List virtualization (`react-virtuoso` or windowing).
- Map init only after stable container measurement (extend existing ResizeObserver guards).
- SSR useful home shell before map JS (structural).

---

## 5. Structural (deferred)

- Region/API-based course loading instead of 532 on first paint.
- Server-rendered home hub without full client hydration.

---

## 6. Phase 1 changes (implemented)

### 6.1 Stable layout + skeleton

- **`components/maps/MapSkeleton.tsx`** — fixed-size map placeholder.
- **`components/HomeClient.tsx`** — desktop filter `min-h-[5.5rem]`, map panel `h-full min-h-[480px]`, sidebar `h-full min-h-0`, flex row `h-0` for stable split.

### 6.2 Dynamic map import

- **`components/HomeClient.tsx`** — `CourseMap` via `next/dynamic` with `MapSkeleton` fallback, `ssr: false`.

### 6.3 Mobile map / SDK defer

- **`components/HomeClient.tsx`** — `CourseMap` not mounted on mobile until `mapSectionInView` (IntersectionObserver or “전체 골프장 지도 보기” CTA).
- **`components/maps/KakaoCourseMap.tsx`** — SDK init effect gated by `deferInitialViewUntilVisible && isMobile && !mapSectionInView`; loading overlay replaced with `MapSkeleton`.

### 6.4 Slim course payload

- **`lib/homeCourse.ts`** — `HomeCourse` DTO + `toHomeCourses()`.
- **`app/page.tsx`** — passes slimmed courses to `HomeClient`.

### 6.5 Mobile list incremental render

- **`components/MobileBottomSheet.tsx`** — initial 25 cards, “더 보기” loads 25 more.

### Not changed in Phase 1

- Supabase schema, SEO metadata, sitemap, robots, cluster algorithm.
- `CourseDetail`, collection/region pages.
- Desktop map behavior (still above fold, immediate mount).

---

## 7. Post-deployment measurement

### Baseline to compare

| | Desktop | Mobile |
|--|---------|--------|
| RES | 52 | 65 |
| FCP | 3.04s | 3.31s |
| LCP | 4.22s | 5.3s |
| CLS | 0.55 | 0.08 |
| INP | 144ms | 224ms |

### After deploy

1. **Lab (immediate):** Chrome DevTools Performance → LCP marker; Lighthouse mobile/desktop on `/`.
2. **Field (3–7 days):** Vercel Speed Insights → filter route `/`, Desktop vs Mobile.
3. **Regression:** `/collections/near-seoul`, one `/courses/[id]`, mobile + desktop `/`.

### LCP verification steps

1. Open `/` in Chrome Incognito (mobile emulation).
2. Performance panel → record reload.
3. Note LCP element: map canvas/tiles, hero text, hub card, or skeleton.
4. Repeat on desktop wide viewport.

### Lab vs field

- Lighthouse may improve immediately after bundle split.
- Speed Insights field data lags and depends on visit volume (~85 desktop KR visits in baseline window).

---

## 8. False paths (avoided in Phase 1)

- Mobile card image optimization (cards are text-only).
- Font changes (no evidence of font-driven LCP/CLS).
- Cluster algorithm rewrite.
- Optimizing collection/detail pages first.
- DB schema changes.

---

## 9. Changelog

| Date | Change |
|------|--------|
| 2026-06-20 | Phase 1: skeleton, dynamic map, mobile defer, HomeCourse slim, mobile list paging |
