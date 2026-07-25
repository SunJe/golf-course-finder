# Rollback runbook — GolfMap Cloudflare cutover

## Keep Vercel ≥ 14 days
- Do not delete the Vercel project or remove `golfmap.kr` / `www.golfmap.kr` from Vercel Domains until a separate cleanup task.
- Primary rollback is DNS, not redeploying Vercel.

## Immediate rollback triggers
- Repeated 5xx on apex
- `/map` count ≠ 532 or mock fallback names appear
- Supabase data failures
- Mass asset 404
- Production `noindex`
- Canonical wrong host
- www redirect loop
- Worker CPU/exceptions spike
- CTA (tel/map/booking) broken

## Rollback steps
1. Restore DNS at hosting.co.kr (if NS still on hosting) OR restore records in Cloudflare DNS:
   - apex `A` → `216.198.79.1`
   - www `CNAME` → `6d570a1bc5749edb.vercel-dns-017.com`
2. If nameservers were moved to Cloudflare and rollback must leave Cloudflare:
   - Set NS back to `ns1..ns4.hosting.co.kr`
3. Remove Worker custom domains for `golfmap.kr` / `www.golfmap.kr` (Dashboard or wrangler routes removal + deploy)
4. Verify:
   - `curl -sI https://golfmap.kr` → `Server: Vercel`, 200
   - `curl -sI https://www.golfmap.kr` → 308 → `https://golfmap.kr/`
5. Record root cause; fix on `*.workers.dev`; retry cutover later

## Protected records
- TXT `google-site-verification=pckZA68xtmu4xLgkeSUhRuKx5tUckg4KcmwcvYJj-jc`
- `ads.txt` content path on app (not DNS)
