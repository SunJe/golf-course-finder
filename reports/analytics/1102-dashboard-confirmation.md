# 1102 incident — Dashboard confirmation log

## Reported incident

| Field | Value |
|---|---|
| URL | https://golfmap.kr/ |
| UTC | 2026-08-01 08:52:33 |
| Seoul | 2026-08-01 17:52:33 |
| Ray ID | `a2439b786f5afc92` |
| Symptom | Cloudflare Error 1102 (recovered to 200) |

## Analytics confirmation (GraphQL — sampled)

Window probe 08:22–09:22 UTC (earlier diagnosis):

- success ≈ 165 (bucket sample)
- exceededResources ≈ 15
- clientDisconnected ≈ 5

Near Ray time:

| UTC | status | cpuTime (approx) | wall (approx) |
|---|---|---:|---:|
| 08:52:26 | exceededResources | ~108.5 ms | ~727 ms |
| 08:52:29 | exceededResources | ~10.0 ms | ~211 ms |
| 08:52:32 | exceededResources | ~10.0 ms | ~408 ms |

CLI re-run (`npm run cf:health:incident`) may show higher totals because adaptive sampling/buckets differ — treat as **trend**, not exact ledger.

## Ray-level outcome (Observability Logs)

| Check | Status |
|---|---|
| CLI Observability query | **403** with Wrangler OAuth — cannot confirm from automation |
| Dashboard Logs search for `a2439b786f5afc92` | **Manual — pending operator** |

### Operator checklist

1. Cloudflare → Workers → `golfmap-korea-preview` → **Observability** / **Logs**
2. Time: 2026-08-01 08:50–08:55 UTC
3. Search Ray ID `a2439b786f5afc92`
4. Record below:

```
Confirmed at (UTC): ________
outcome: ________ (exceededCpu / exceededMemory / other)
cpuTimeMs: ________
wallTimeMs: ________
path: ________
```

Until filled, public wording remains:

> **CPU 초과 가능성이 높은 exceededResources** (exceededMemory 증거 없음)

Do **not** write “exceededCpu confirmed” until Dashboard outcome is pasted above.
