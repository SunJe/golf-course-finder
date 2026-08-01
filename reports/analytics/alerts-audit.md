# GolfMap alerts audit (Cloudflare Free)

Audited: 2026-08-01  
Plan context: Cloudflare **Free** for Production Worker cutover  
Constraint: no paid feature enablement, no DNS/route changes, no webhook secrets, no email destination changes without approval.

## What we can rely on today

| Mechanism | Available without plan change? | Notes |
|---|---|---|
| Manual daily Metrics check | Yes | `docs/operations/analytics.md` |
| CLI cron `npm run cf:health:24h` | Yes | FAIL exit code when exceededResources/CPU p99 thresholds trip |
| Workers Observability UI | Yes (logs enabled, sampling 1.0) | Best for Ray ID / outcome |
| Exact “Error 1102” notification rule | **Not verified on Free** | Do not claim automatic 1102 alerts |
| Health Checks (external HTTP) | Possibly (product-dependent) | Would need destination approval; not enabled in this PR |
| Notification webhooks / PagerDuty | Usually paid / config-heavy | Out of scope |

## Recommended operating mode (Free-safe)

1. **Daily:** open `GolfMap Production Health` checklist + GA4 Naver glance (1 minute).  
2. **After deploys / incidents:** `npm run cf:health:24h` and `cf:health:incident` when investigating.  
3. **If exceededResources > 0:** Dashboard Logs → path CPU → consider rollback criteria in ops doc.  
4. Optional later (approval required): schedule CI/cron to run health script and email on exit code 1 — **no secrets in git**.

## Not enabled by this PR

- Cloudflare Notification policies  
- Health Check monitors  
- Billing / Workers Paid upgrades  
- Any alert email destination edits
