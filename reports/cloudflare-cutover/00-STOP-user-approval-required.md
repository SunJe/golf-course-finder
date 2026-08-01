# Cloudflare Production Cutover — STOP (user approval required)

Updated: 2026-08-01 (KST)  
Master baseline ready on branch: `2829899` (merged into `infra/cloudflare-golfmap-production-domain`)  
Preview Worker version (synced): `68a58063-e3e7-489d-86d7-c44a1afd180e`  
Preview URL: https://golfmap-korea-preview.sun15002000.workers.dev  
`cf:smoke` / `cf:data-parity`: PASS (532 = 532)

## STOP — hard conditions still blocking DNS cutover

| Condition | Finding (re-checked 2026-08-01) |
|---|---|
| Active Cloudflare zone | **None.** Account `208630068c7c4124a52d62fc6d9039b0` still has **0 zones**. `golfmap.kr` is not on Cloudflare. |
| Zone create via API | Failed: OAuth token lacks `com.cloudflare.api.account.zone.create`. |
| Authoritative nameservers | Still registrar DNS (`ns1–ns4.hosting.co.kr`), **not** Cloudflare. |
| Nameserver change | **Not attempted** (requires your approval + registrar action). |

Worker custom-domain deploy and apex/www DNS rewrite are **paused** until the zone is Active.

---

## Pre-cutover audit table (2026-08-01)

| Item | Value |
|---|---|
| Registrar / DNS host | hosting.co.kr (SOA primary `ns1.hosting.co.kr`) |
| Authoritative NS | `ns1.hosting.co.kr`, `ns2.hosting.co.kr`, `ns3.hosting.co.kr`, `ns4.hosting.co.kr` |
| Cloudflare zone | **Missing** (not Active) |
| Cloudflare SSL mode | N/A (no zone) |
| Apex A | `216.198.79.1` (Vercel) — TTL ~180s |
| www | CNAME `6d570a1bc5749edb.vercel-dns-017.com` → Vercel — TTL ~180s |
| DNSSEC (DS) | No domain DS observed for `golfmap.kr` (low conflict risk; confirm in registrar UI) |
| MX | none |
| TXT (must keep) | `google-site-verification=pckZA68xtmu4xLgkeSUhRuKx5tUckg4KcmwcvYJj-jc` |
| ads.txt | 200 on Production (`pub-7574651628318443` present previously; keep) |
| www→apex | Vercel **308** → `https://golfmap.kr/*` (path/query preserved) |
| Production server today | **Vercel** (`Server: Vercel`, no `CF-Ray`, no Production noindex) |
| Preview Worker | `golfmap-korea-preview` / workers.dev — `X-Robots-Tag: noindex, nofollow, noarchive` |
| Preview canonical | `https://golfmap.kr` |
| Map / home parity | map **532**, home recommended **4**, fallback **0** |
| Vercel rollback | Keep project/deployments ≥14 days. DNS rollback to existing Vercel apex/www is primary. |
| `.vercel.app` | `https://golf-course-finder.vercel.app/` and `https://golfmap.vercel.app/` both 200 (confirm which owns golfmap.kr in Dashboard) |

Backup files refreshed under `reports/cloudflare-cutover/`.

---

## What you need to approve / do

### A) Cloudflare Dashboard (account `sun15002000@gmail.com`)

1. **Add site** `golfmap.kr` (Full / DNS setup — not CNAME-only unless you intentionally choose partial).
2. Copy the assigned Cloudflare nameservers (typically `*.ns.cloudflare.com`).
3. Optional but helpful: create an API token with **Zone:Edit** (+ Zone:Read) for `golfmap.kr` so the agent can import TXT and verify SSL via CLI. Do **not** paste secret values into chat; store locally if needed.

### B) Registrar / hosting.co.kr DNS panel for `golfmap.kr`

Change nameservers **from**:

- `ns1.hosting.co.kr`
- `ns2.hosting.co.kr`
- `ns3.hosting.co.kr`
- `ns4.hosting.co.kr`

**to** the Cloudflare-assigned nameservers from step A.

### C) Preserve before/during import

- Keep TXT `google-site-verification=pckZA68xtmu4xLgkeSUhRuKx5tUckg4KcmwcvYJj-jc`
- Do not add/remove MX (none today)
- Do not delete AdSense / Search Console verification records
- DNSSEC: no DS seen; if registrar shows DNSSEC enabled, tell the agent before enabling Cloudflare proxy

### D) Reply in this chat with

1. Cloudflare zone status = **Active** (or “NS updated, waiting on Active”)
2. The two Cloudflare nameserver hostnames assigned to the zone
3. Confirmation you updated registrar NS (or ask the agent to wait for propagation)

---

## After your approval — agent will continue

1. Re-import/preserve Google verification TXT in Cloudflare DNS  
2. Deploy Worker with wrangler custom domains (`golfmap.kr`, `www.golfmap.kr`)  
3. Confirm certificates Active; SSL mode not Flexible  
4. Verify www→apex permanent redirect (path/query)  
5. Production smoke + parity checks  
6. PR: `infra: route GolfMap production through Cloudflare Workers`  
7. Leave Vercel project/custom domain in place ≥14 days for rollback  

---

## Expected code changes (already prepared on branch; safe)

- `wrangler.jsonc` — custom domain routes; `keep_vars`, `GOLFMAP_DATA_MODE=production`, `workers_dev: true`
- `middleware.ts` — www → apex 308; workers.dev noindex only
- `reports/cloudflare-cutover/*` — DNS backup + zone audit + rollback runbook
- helper scripts: zone audit / DNS backup / cutover smoke

## DNS impact (only after NS cutover)

- Cloudflare becomes authoritative DNS
- Worker custom domains create proxied apex/www records + certificates
- Old hosting.co.kr A/CNAME become inactive once NS switch completes
- Vercel DNS unused until rollback; **do not delete Vercel project/domain**

## Rollback (prepared)

See `reports/cloudflare-cutover/pre-cutover-dns-backup.md` and `rollback-runbook.md`.
