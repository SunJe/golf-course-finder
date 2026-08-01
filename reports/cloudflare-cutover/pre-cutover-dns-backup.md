# GolfMap DNS backup (pre-Cloudflare cutover)

Backed up at: 2026-08-01T07:12:41.516Z

## Authoritative NS
- ns4.hosting.co.kr
- ns1.hosting.co.kr
- ns2.hosting.co.kr
- ns3.hosting.co.kr

## Apex (golfmap.kr)
- A: 216.198.79.1
- AAAA: ENODATA
- TXT: [["google-site-verification=pckZA68xtmu4xLgkeSUhRuKx5tUckg4KcmwcvYJj-jc"]]
- MX: {"error":"ENODATA"}
- DNSSEC DS: {"error":"ERR_INVALID_ARG_VALUE"}
- SOA minttl: 180

## www.golfmap.kr
- CNAME: 6d570a1bc5749edb.vercel-dns-017.com
- A (resolved): 216.198.79.1, 64.29.17.1

## Current HTTP
- apex: 200 server=Vercel
- www: 308 location=https://golfmap.kr/
- Production provider: Vercel

## Vercel rollback URLs (keep ≥14 days)
- https://golf-course-finder.vercel.app/ (200)
- https://golfmap.vercel.app/ (200; smaller/older page — verify which project owns golfmap.kr)
- Do **not** remove Vercel project/custom domain immediately after cutover.

## Protected records (do not delete)
- TXT google-site-verification=pckZA68xtmu4xLgkeSUhRuKx5tUckg4KcmwcvYJj-jc

## Rollback procedure
1. At registrar/DNS (hosting.co.kr), restore:
   - apex A → 216.198.79.1
   - www CNAME → 6d570a1bc5749edb.vercel-dns-017.com
2. If nameservers were moved to Cloudflare, restore NS:
   - ns1.hosting.co.kr
   - ns2.hosting.co.kr
   - ns3.hosting.co.kr
   - ns4.hosting.co.kr
3. Disable/remove Cloudflare Worker custom domains for golfmap.kr / www.golfmap.kr
4. Confirm https://golfmap.kr returns Server: Vercel and 200
5. Keep workers.dev for fixes; do not delete secrets
