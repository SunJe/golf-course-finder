# STOP — apex/www DNS conflict delete required

Updated: 2026-08-01 (KST)

## Status

| Item | State |
|---|---|
| Zone | **Active** `golfmap.kr` (`e48bdfb7e100858f8f391a4b2338ec63`) |
| Nameservers | `anton.ns.cloudflare.com`, `priscilla.ns.cloudflare.com` |
| Preview Worker | Redeployed; `cf:smoke` / `cf:data-parity` **PASS** (map 532) |
| Custom Domains | **Blocked** — API 409 / code `100117` |
| Wrangler OAuth | Can deploy Worker; **cannot** edit Zone DNS (`Authentication error` on DNS API) |
| Production today | Still **Vercel** (apex A + www CNAME intact) |

### Exact Custom Domain error

```
Hostname 'golfmap.kr' already has externally managed DNS records (A, CNAME, etc).
Delete them first or try a different hostname. [code: 100117]
```

`override_existing_dns_record=true` does **not** override generic Vercel A/CNAME records (Cloudflare confirmed behavior).

---

## What you need to do (one of two options)

### Option A — Dashboard (recommended, ~1 minute)

Cloudflare Dashboard → **golfmap.kr** → **DNS** → **Records**:

**Delete only these two Vercel traffic records:**

1. **A** `golfmap.kr` → `216.198.79.1`
2. **CNAME** `www` → `6d570a1bc5749edb.vercel-dns-017.com`

**Do NOT delete:**

- TXT `google-site-verification=pckZA68xtmu4xLgkeSUhRuKx5tUckg4KcmwcvYJj-jc`
- Any MX (none expected)
- Any other unknown/verification records

Then reply in chat: `DNS cleared`

I will immediately:

1. `wrangler` / OpenNext deploy with custom domains `golfmap.kr` + `www.golfmap.kr`
2. Confirm SSL Active + Cloudflare `CF-Ray`
3. Verify www→apex 308, map 532, Production smoke
4. Open PR

**Note:** There will be a short window after delete before Worker DNS/cert is ready. I will deploy as soon as you confirm.

### Option B — API token (so agent deletes + deploys)

Create Cloudflare API token with:

- Zone → DNS → Edit (include zone `golfmap.kr`)
- Zone → SSL and Certificates → Edit
- Account → Workers Scripts → Edit

Set locally (do **not** paste the token into chat):

```powershell
$env:CLOUDFLARE_API_TOKEN = "<token>"
```

Reply: `token ready`

---

## Rollback remains available

Vercel project/deployments stay. If cutover fails after DNS delete:

1. Recreate apex **A** `216.198.79.1`
2. Recreate www **CNAME** `6d570a1bc5749edb.vercel-dns-017.com`
3. Remove Worker custom domains if created
4. Confirm `Server: Vercel` + 200

Backup: `reports/cloudflare-cutover/pre-cutover-dns-backup.md`
