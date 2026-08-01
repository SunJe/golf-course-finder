# PR #22 Preview verification verdict — **NO Production merge**

**Date:** 2026-08-01  
**Baseline Production:** `golfmap-korea-preview` @ **`be560e3a-e842-4dfe-8de7-1c4c55c12078`** (`https://golfmap.kr`) — **unchanged**  
**PR #22 Preview Worker:** `golfmap-korea-map-opt` @ `6d8bc98b-8a40-4643-b684-885a3840acf0` (secrets final)  
**Preview URL:** https://golfmap-korea-map-opt.sun15002000.workers.dev  

DNS / Custom Domains / `cpu_ms=2000` / Vercel: **not modified**.

---

## Verdict

**Do not merge or Production-deploy PR #22 yet.**

Functional nearby/course checks look good and unfiltered `/map` stays at **532**, but merge gates on **≥25% `/map` wall p95 improvement** and **meaningful CPU/payload reduction** are **not reliably met**. A follow-up design is required before Production.

---

## What was deployed (Preview only)

| Item | Value |
|------|--------|
| Config | `wrangler.perf-preview.jsonc` — **no** `golfmap.kr` / `www` routes |
| Worker name | `golfmap-korea-map-opt` (isolated from Production) |
| Deploy script | `scripts/run-cf-deploy-perf-preview.mjs` |
| Production worker after test | still **`be560e3a…`** on `golfmap-korea-preview` |

---

## Functional results

| Check | Result |
|-------|--------|
| `/map` count 532 (re-fetch) | **PASS** (baseline 532 / preview 532 unique `gc-` ids) |
| Home recommended 4 | **PASS** (same 4 ids) |
| Unfiltered `/map` id set | **PASS** (jaccard 1.0) |
| Filter queries (20) | **PARTIAL** — all HTTP 200; jaccard ≥ 0.987; a few id diffs (3–5) likely RSC/HTML extraction noise, not missing catalog rows. Strict “zero missing ids” gate failed on 5/20. |
| Course detail ×10 | **PASS** (200) |
| Nearby vs baseline | **PASS** — overlap **6/6** on all 10 courses |
| GA4 / canonical origin / `/_next/image` | **PASS** on Preview |
| Preview `noindex` | Expected on `workers.dev` (`x-robots-tag: noindex…`) — not a Production regression |
| Pagination omitting courses | N/A in this PR (no list pagination shipped; full marker set still sent) |

---

## Performance results

### Primary 50× cold/warm (`scripts/compare-pr22-preview.mjs`)

| Metric | Baseline `/map` cold | Preview `/map` cold |
|--------|---------------------:|--------------------:|
| wall p50 / p95 / p99 | 1287 / **1637** / 1788 | 1070 / **1200** / 1631 |
| wall p95 Δ | — | **−26.7%** (meets 25% on this run) |
| cfWorker p95 | 1083 | **n/a** (`Server-Timing` absent on workers.dev) |
| avg body bytes | 3,120,099 | 3,066,879 (**−1.7%**) |
| 1102 / 5xx in benches | 0 | 0 |

### Confirmatory 15× cold retest (same machine, immediately after)

| Metric | Baseline | Preview |
|--------|---------:|--------:|
| wall p50 / p95 | 1351 / **1899** | 1277 / **2101** |
| wall p95 Δ | — | **+10.6% (worse)** |
| body p50 | 3,120,087 | 3,066,867 (−1.7%) |
| cfWorker | present | **absent** on workers.dev |

**Interpretation:** The 25% wall win is **not stable**. Payload barely shrinks, so CPU/serialize cost of shipping ~532 rich DTOs remains. Course-detail Preview wall median was **slower** in aggregate (≈452ms vs ≈382ms) despite perfect nearby overlap — bbox round-trip does not yet beat “load all + in-memory” under this Preview path, and/or colo/network noise dominates.

### Memory / CPU GraphQL

- Preview Worker GraphQL memory p99: **not available** via current OAuth.
- Proxy: response bytes ≈ unchanged (−1.7%) → **no evidence of memory win**; also no evidence of large memory regression from payload size.

---

## Merge criteria scorecard

| Criterion | Status |
|-----------|--------|
| 5xx=0 / 1102=0 on Preview benches | PASS |
| exceededResources (Preview window) | Not used as Production gate; benches clean |
| Data / filter parity | PARTIAL (532 OK; strict filter id equality flaky) |
| `/map` wall p95 ≥25% vs ~1.15–1.6s baseline | **FAIL** (unstable; retest regresses) |
| CPU p99 meaningfully below ~695ms | **FAIL / unknown** (no `cfWorker` on workers.dev) |
| Memory not increased | Inconclusive / payload ≈ flat |
| Course detail / nearby regression | Nearby OK; wall slightly worse |

→ **`recommendMerge: false`**

---

## Root cause / next design (do not raise `cpu_ms`)

PR #22 only:

1. Narrows Supabase `select` and drops `description` from `HomeCourse`
2. Replaces full-catalog nearby with bbox query

That does **not** remove the dominant cost: **OpenNext still serializes ~3MB / 532-course client props on every `/map` request**.

### Recommended follow-up (new commits on PR #22 or successor PR)

1. **Map marker DTO** (~8–12 fields, no address paragraphs / tags bloat) + separate list page API  
2. **Build-time / asset `map-index.json`** (or KV) so Worker avoids Supabase `select` + map on each request  
3. **Server-side filter + list pagination** for `view=list`; map markers stay ultra-light  
4. Re-bench on a path that exposes `Server-Timing` (custom domain preview hostname **or** Versioned Preview) so CPU p95/p99 is comparable  
5. Keep Production on **`be560e3a`** until wall p95 improvement is **stable ≥25%** across two independent 50× runs

---

## Artifacts

- `reports/cloudflare-cutover/pr22-preview-compare.json`
- `reports/cloudflare-cutover/pr22-preview-deploy.log`
- `wrangler.perf-preview.jsonc`
- `scripts/run-cf-deploy-perf-preview.mjs`
- `scripts/compare-pr22-preview.mjs`

## Rollback

Not required for Production (never switched). Preview Worker `golfmap-korea-map-opt` can be left for further iteration or deleted later — it does not serve `golfmap.kr`.
