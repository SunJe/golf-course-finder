# GolfMap 콘텐츠 성장 — GA4 Dashboard Setup

GA4 Measurement ID (code): **`G-FMY10PMHEB`**  
(`app/layout.tsx` → `<GoogleAnalytics gaId="G-FMY10PMHEB" />`)

Auto-provision via API: **not attempted** (no GA Admin automation in this repo). Configure in GA4 UI or Looker Studio.

Dashboard / Explore name: **`GolfMap 콘텐츠 성장`**

---

## Role split

| System | Use for |
|---|---|
| Cloudflare | Worker CPU, 1102/5xx, cache, infra |
| GA4 | Users, sessions, Naver/Google acquisition, content popularity, funnel events |
| Vercel Analytics / Speed Insights | Still mounted in `app/layout.tsx` after Cloudflare cutover — client Web Vitals only. **Not** the hosting source of truth. |

---

## Filters (apply to the dashboard)

1. Hostname include: `golfmap.kr` (and optionally `www.golfmap.kr` if it appears before redirect)
2. Exclude hostname contains: `workers.dev`
3. Internal traffic filter: enable GA4 **Internal traffic** data filter if office IPs are defined; otherwise report as not configured

---

## Audited events (code)

From `lib/analytics.ts` + call sites:

| Event | In code? | Notes |
|---|---|---|
| `page_view` | Yes (automatic via gtag/GA4) | Do not custom-duplicate |
| `mobile_home_search` | Yes | No raw query text |
| `quick_filter_click` | Yes | chip id only |
| `map_filter_apply` | Yes | |
| `map_filter_open` | Yes | |
| `map_list_toggle` | Yes | |
| `course_map_click` | Yes | |
| `course_reservation_click` | Yes | |
| `course_call_click` | Yes | **phone CTA** (not `course_phone_click`) |
| `course_card_open` | Yes | |
| `collection_map_continue` | Yes | |
| `mobile_gallery_swipe` | Yes | |
| `course_phone_click` | **No** | Use `course_call_click` in reports |

Do not create phantom events in the dashboard.

---

## KPI cards

1. Users  
2. Sessions  
3. Views (page_view)  
4. Engagement rate  
5. Average engagement time  
6. Naver users — filter `sessionSource` contains `naver` (or medium/source pair)

---

## Charts

### 7. 유입 채널

- Dimension: Session default channel group  
- Metric: Users / Sessions

### 8. 검색엔진

- Dimension: Session source / medium  
- Highlight: `naver` / `google` / `bing`

### 9. 네이버 유입 추이

- Filter: source contains `naver`  
- Time series: Users, Sessions by day

### 10. 인기 페이지

- Dimension: Page path + query string **or** Page path  
- Prefer **Page path** (no PII query dumps)  
- Metrics: Views, Users, Engagement rate

### 11. 인기 블로그

- Filter: Page path starts with `/blog/`

### 12. 인기 컬렉션

- Filter: Page path starts with `/collections/`

### 13. 인기 코스 상세

- Filter: Page path starts with `/courses/`

### 14. 내부 이동 퍼널 (Explore → Funnel)

Suggested steps:

1. page_view path `/`  
2. page_view path contains `/map`  
3. page_view path starts `/courses/`  
4. event `course_reservation_click` OR `course_map_click` OR `course_call_click`

### 15. 모바일

- Device category  
- OS (Android focus)  
- Compare mobile vs desktop engagement on `/map`

### 16. 이벤트 표

Rows = event name (only audited list above)  
Columns = Event count, Users

---

## Click path (GA4)

1. [Google Analytics](https://analytics.google.com/) → GolfMap property  
2. **Explore** → **Blank** / **Funnel exploration**  
3. Save as `GolfMap 콘텐츠 성장`  
4. Or **Looker Studio** → GA4 connector → same charts

### Looker Studio quick prompt

```
Connect GA4 property for GolfMap (G-FMY10PMHEB). Build a report "GolfMap 콘텐츠 성장" with hostname golfmap.kr only, exclude workers.dev. KPI: users, sessions, views, engagement rate, avg engagement time, naver users. Charts: channel group, source/medium, daily naver users, top pages, top /blog /collections /courses paths, device/OS, events mobile_home_search quick_filter_click map_filter_apply course_map_click course_reservation_click course_call_click. Do not include raw search queries.
```
