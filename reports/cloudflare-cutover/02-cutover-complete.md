# Cloudflare Production Cutover — Complete

Cutover time (UTC): around 2026-08-01T08:34:00Z (Worker custom domains attached; apex served by Cloudflare shortly after)

## Summary
- Zone: golfmap.kr Active
- NS: anton.ns.cloudflare.com, priscilla.ns.cloudflare.com
- Worker: golfmap-korea-preview
- Custom domains: golfmap.kr, www.golfmap.kr
- workers.dev retained with noindex
- Vercel project/deployments retained for rollback (≥14 days)
- MX/TXT: Google Search Console TXT preserved; no MX changes

## DNS before → after
| Host | Before | After |
|---|---|---|
| apex | A 216.198.79.1 (Vercel) | Cloudflare proxied Worker (A 104.21.x / 172.67.x observed) |
| www | CNAME vercel-dns-017 | Worker custom domain (308 → apex) |
| TXT | google-site-verification=... | unchanged |

## Verification
- apex Server: cloudflare, CF-Ray present, no X-Robots-Tag
- map 532, home recommended 4 IDs match
- www → apex 308 path/query preserved
- /_next/image: 0 on sampled pages
- ads.txt / robots / sitemap (paju lastmod 2026-08-01) 200
- Preview workers.dev still noindex
- Rollback: restore Vercel A/CNAME from pre-cutover-dns-backup.md; remove Worker custom domains

## Known issues
- workers.dev intermittent 503 under load (does not affect Production)
- Android device QA not executed in this session
