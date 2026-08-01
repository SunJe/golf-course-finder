# GolfMap Production Health — Cloudflare Dashboard Setup

**Auto-create status (2026-08-01 audit):** Custom Dashboards API unavailable with current Wrangler OAuth (`analytics_dashboard` 404 / Observability query 403).  
→ **Manual setup required.** This file is the source of truth for clicks + chart definitions.

Dashboard name: **`GolfMap Production Health`**  
Default range: **Last 24 hours** + compare to previous period  
Worker: `golfmap-korea-preview`  
Production hostnames: `golfmap.kr`, `www.golfmap.kr`  
Exclude `*.workers.dev` from Production charts (add a separate comparison chart).

---

## 0) Required API token (for CLI reports; Dashboard uses your login)

If CLI `npm run cf:health:24h` returns 403, create a token with:

- Account → **Account Analytics** → Read
- Account → **Workers Scripts** → Read
- Zone → **Analytics** → Read (`golfmap.kr`)
- Zone → **Zone** → Read
- Optional: Workers Observability / Tail → Read

Do **not** paste token values into chat. Use `.env.cloudflare-analytics.local`.

---

## 1) Create the dashboard

### Path A — Analytics & Logs → Dashboards (if visible)

1. Cloudflare Dashboard → left nav **Analytics & Logs**
2. **Dashboards** → **Create dashboard**
3. Name: `GolfMap Production Health`
4. Save

### Path B — Workers Metrics + pinned tabs (Free fallback)

If Custom Dashboards is not on Free / not visible:

1. **Workers & Pages** → **golfmap-korea-preview** → **Metrics**
2. Bookmark this URL as “Production Health”
3. Use **Observability** → **Query Builder** for path/CPU charts below
4. Keep this markdown as the checklist of required widgets

### Natural Language prompt (paste into CF NL analytics if available)

```
Create a 24h operations dashboard named "GolfMap Production Health" for Worker script golfmap-korea-preview on hostnames golfmap.kr and www.golfmap.kr. Exclude workers.dev from production charts. Show: total requests, success rate, exceededResources count, HTTP 5xx, CPU p95 and p99 in ms, timeseries of invocation status, CPU p50/p95/p99, wall p50/p95/p99, memory p50/p90/p99 if available, HTTP status classes, top error paths, top CPU paths by pathname (strip query), top wall-time paths, cache HIT/MISS/DYNAMIC, and a separate workers.dev comparison panel. Compare to previous period.
```

---

## 2) KPI widgets (6)

| # | Title | Dataset / source | Calc | Healthy |
|---|---|---|---|---|
| 1 | Worker 요청 | Workers Invocations | sum(requests) | trend |
| 2 | 정상 실행률 | Workers Invocations | success / total | ≈100% |
| 3 | 리소스 초과 | status=`exceededResources` (or outcome exceededCpu) | count | **0** |
| 4 | 5xx 응답 | Zone HTTP / edge status 500–599, host golfmap.kr|www | count | **0** |
| 5 | CPU p95 | quantiles.cpuTimeP95 → **ms** (µs/1000) | ms | Free: watch ≥8ms |
| 6 | CPU p99 | quantiles.cpuTimeP99 → ms | ms | Free: watch ≥10ms |

Filter every Worker chart:

- `scriptName = golfmap-korea-preview`
- Prefer production host when dimension exists; otherwise document Workers Metrics (all routes on script) + Zone HTTP hostname filter separately.

---

## 3) Charts (7–16)

### 7. Worker 실행 결과 추이

- Type: timeseries (5m or 15m)
- Breakdown: `status` / outcome  
  Use **only fields that exist**: currently GraphQL exposes `status` including `success`, `exceededResources`, `clientDisconnected`, …  
  Do **not** invent `exceededCpu` series if UI only has `exceededResources`.
- If Observability Logs show `exceededCpu` / `exceededMemory`, add those as separate Log-based widgets.

### 8. CPU 시간 추이

- Workers Invocations → cpuTime P50 / P95 / P99
- Unit: **milliseconds**
- Bucket: 5m or 15m
- scriptName filter

### 9. Wall time 추이

- wallTime P50 / P95 / P99 (ms)

### 10. Memory 사용

- memoryUsageBytes P50 / P90 / P99 → MB  
- Create **only if** UI/dataset exposes it (GraphQL quantiles include memoryUsageBytesP*)
- Goal: confirm no `exceededMemory` pressure

### 11. HTTP 상태 코드

- Zone analytics, host in `golfmap.kr`, `www.golfmap.kr`
- Stacked 2xx / 3xx / 4xx / 5xx

### 12. 오류 발생 경로 Top 10

- Workers Observability → Query Builder  
- Filter: `outcome != success` OR status in exceeded*/exception  
- Group by pathname (strip query)  
- If Free cannot pin raw logs into Custom Dashboard, save as **Query Builder visualization** and link from this doc.

Suggested query filters:

- `$metadata.service` = `golfmap-korea-preview`
- `$workers.outcome` != `ok` / `success` (match UI labels)
- Exclude `workers.dev` host if host field available

### 13. CPU가 높은 경로 Top 10

- Query Builder: `$workers.cpuTimeMs`
- Group by pathname (no full query string, no PII)
- Show p95 CPU + count

### 14. 느린 경로 Top 10

- p95 wall / duration by pathname  
- Watch: `/`, `/map`, `/courses/*`, `/blog/*`, `/collections/*`

### 15. 캐시 상태

- Zone HTTP → cacheStatus: HIT / MISS / DYNAMIC / BYPASS / etc.
- Optionally split path prefix `/promo-assets` vs HTML

### 16. Production vs workers.dev

- Side-by-side requests + errors by hostname  
- Purpose: Preview load tests must not be mistaken for Production incidents

---

## 4) Incident bookmark — 2026-08-01 08:22–09:22 UTC

Save a dashboard time-range preset or browser bookmark:

- UTC: `2026-08-01 08:22` → `09:22`
- Seoul: `2026-08-01 17:22` → `18:22`

Documented sample:

| metric | value |
|---|---:|
| success | 165 (initial probe window sample) |
| exceededResources | 15 (initial) / higher in later CLI incident run |
| clientDisconnected | 5 |
| spike | 08:52:26–:32 UTC |
| CPU sample | ~108.5 ms then ~10 ms kill pattern |
| Ray | `a2439b786f5afc92` |

In Observability Logs search: `a2439b786f5afc92`  
Record final outcome in `reports/analytics/1102-dashboard-confirmation.md` when viewed.

Until Ray-level outcome is confirmed in UI, describe as:  
**“CPU 초과 가능성이 높은 exceededResources”** (not hard-coded `exceededCpu`).

---

## 5) Worker Observability settings (current audit)

From Worker script settings API (read-only):

| setting | value |
|---|---|
| observability.enabled | true |
| logs.enabled | true |
| invocation_logs | true |
| head_sampling_rate | 1.0 |
| logs.persist | true |
| traces.enabled | false |

**No config change in this PR.**  
If Logs become costly later, propose lowering sampling after 48h diagnosis — requires separate approval.

### Optional future structured logs (proposal only — do not ship here)

Fields: `route_group`, `data_source`, `course_count`, `phase`, `duration_ms`, `cache_mode`  
Never log: Supabase secrets, IP, raw search text, cookies, full headers.
