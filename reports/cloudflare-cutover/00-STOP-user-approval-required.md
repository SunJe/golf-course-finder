# Cloudflare Production Cutover — Status & STOP

Generated: 2026-07-25 (KST)

## STOP — user approval required

DNS cutover **has not** been performed. Two hard stop conditions hit:

| Condition | Finding |
|---|---|
| Active Cloudflare zone | **None.** Account `208630068c7c4124a52d62fc6d9039b0` has **0 zones**. `golfmap.kr` is not on Cloudflare. |
| Zone create permission | Wrangler OAuth token lacks `com.cloudflare.api.account.zone.create`. API zone create failed. |
| Nameserver change | Required at registrar (hosting.co.kr DNS). **Not attempted.** |

### What you need to approve / do

1. **Cloudflare Dashboard** (account `sun15002000@gmail.com`):
   - Add site `golfmap.kr` (Full setup)
   - Copy the assigned Cloudflare nameservers (typically `*.ns.cloudflare.com`)
2. **Registrar / hosting.co.kr DNS panel** for `golfmap.kr`:
   - Change nameservers **from**:
     - `ns1.hosting.co.kr`
     - `ns2.hosting.co.kr`
     - `ns3.hosting.co.kr`
     - `ns4.hosting.co.kr`
   - **to** the Cloudflare-assigned nameservers
3. Confirm:
   - Keep TXT `google-site-verification=pckZA68xtmu4xLgkeSUhRuKx5tUckg4KcmwcvYJj-jc`
   - No MX to preserve currently (none present)
   - DNSSEC: no DS record observed for `golfmap.kr` (low conflict risk; still confirm in registrar UI)
4. Reply in chat with:
   - Cloudflare zone status = Active (or paste NS values + confirmation you updated registrar)
   - Optional: API token with Zone:Edit if you want CLI-driven DNS import

After approval, this agent will: import/preserve TXT → deploy Worker custom domains → verify SSL → production smoke → PR merge notes.

---

## Pre-cutover audit table

| Item | Value |
|---|---|
| Registrar / DNS host | hosting.co.kr (NS SOA `admin.golfmap.kr`) |
| Authoritative NS | ns1–ns4.hosting.co.kr |
| Cloudflare zone | **Missing** (not Active) |
| Cloudflare SSL mode | N/A (no zone) |
| Apex A | `216.198.79.1` (Vercel) |
| www | CNAME `6d570a1bc5749edb.vercel-dns-017.com` → Vercel |
| TTL | SOA minttl **180s** |
| DNSSEC | No DS for `golfmap.kr` observed |
| MX | none |
| TXT (keep) | Google Search Console verification |
| ads.txt | present (`pub-7574651628318443`) |
| www→apex | Vercel **308** → `https://golfmap.kr/` |
| Production server today | **Vercel** |
| Preview Worker | `golfmap-korea-preview` / `*.workers.dev` (noindex) |
| Vercel project (from prior CI) | `sunje-2865s-projects/golf-course-finder` — **keep ≥14 days** |
| `.vercel.app` note | `golf-course-finder.vercel.app` currently serves unrelated UK content; use Vercel Dashboard production deployment URL for rollback testing. DNS rollback to existing Vercel custom domain is the primary path. |

## Expected code changes (safe, pre-approval)

- `wrangler.jsonc` — add custom domain routes for apex/www; keep `keep_vars`, `GOLFMAP_DATA_MODE=production`, `workers_dev`
- `middleware.ts` — www → apex 308 (path/query preserved); workers.dev noindex only
- `reports/cloudflare-cutover/*` — DNS backup + zone audit + this STOP doc
- helper scripts for zone audit / DNS backup

## DNS impact (after approval only)

- Nameservers move to Cloudflare
- Cloudflare will own DNS; Worker custom domains create proxied apex/www records
- Existing hosting.co.kr A/CNAME become inactive once NS switch completes
- TXT verification must be re-created in Cloudflare DNS if not auto-scanned (will preserve from backup)
- Vercel DNS records unused until rollback; **do not delete Vercel project/domain**

## Rollback (prepared)

See `reports/cloudflare-cutover/pre-cutover-dns-backup.md`.

1. Restore NS to hosting.co.kr **or** restore A/CNAME while on Cloudflare
2. Remove Worker custom domains
3. Confirm `Server: Vercel` + 200 on `https://golfmap.kr`
