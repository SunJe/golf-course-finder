import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import dns from "node:dns/promises";

async function resolveSafe(name, type) {
  try {
    return await dns.resolve(name, type);
  } catch (error) {
    return { error: error.code || String(error.message || error) };
  }
}

async function head(url) {
  try {
    const response = await fetch(url, { method: "GET", redirect: "manual" });
    return {
      url,
      status: response.status,
      server: response.headers.get("server"),
      location: response.headers.get("location"),
      vercelId: response.headers.get("x-vercel-id"),
      cfRay: response.headers.get("cf-ray"),
      robots: response.headers.get("x-robots-tag"),
      cache: response.headers.get("x-vercel-cache") || response.headers.get("cf-cache-status"),
    };
  } catch (error) {
    return { url, error: String(error.message || error) };
  }
}

const out = {
  backedUpAt: new Date().toISOString(),
  domain: "golfmap.kr",
  dns: {
    NS: await resolveSafe("golfmap.kr", "NS"),
    A: await resolveSafe("golfmap.kr", "A"),
    AAAA: await resolveSafe("golfmap.kr", "AAAA"),
    WWW_CNAME: await resolveSafe("www.golfmap.kr", "CNAME"),
    WWW_A: await resolveSafe("www.golfmap.kr", "A"),
    MX: await resolveSafe("golfmap.kr", "MX"),
    TXT: await resolveSafe("golfmap.kr", "TXT"),
    SOA: await resolveSafe("golfmap.kr", "SOA"),
    DS: await resolveSafe("golfmap.kr", "DS"),
    DNSKEY: await resolveSafe("golfmap.kr", "DNSKEY"),
  },
  http: {
    apex: await head("https://golfmap.kr/"),
    www: await head("https://www.golfmap.kr/"),
    map: await head("https://golfmap.kr/map"),
    robots: await head("https://golfmap.kr/robots.txt"),
    adsTxt: await head("https://golfmap.kr/ads.txt"),
    preview: await head(
      "https://golfmap-korea-preview.sun15002000.workers.dev/",
    ),
    vercelCandidates: {
      golfCourseFinder: await head("https://golf-course-finder.vercel.app/"),
      golfmap: await head("https://golfmap.vercel.app/"),
    },
  },
  notes: [
    "Authoritative nameservers are hosting.co.kr — NOT Cloudflare.",
    "No Cloudflare zone exists in account yet (see cloudflare-zone-audit.json).",
    "Do not delete google-site-verification TXT.",
    "No MX records currently.",
    "www already 308 → https://golfmap.kr/ on Vercel.",
    "Rollback: restore apex A 216.198.79.1 and www CNAME 6d570a1bc5749edb.vercel-dns-017.com at hosting.co.kr DNS.",
  ],
};

const dir = join(process.cwd(), "reports/cloudflare-cutover");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "pre-cutover-dns-backup.json"), JSON.stringify(out, null, 2));
writeFileSync(
  join(dir, "pre-cutover-dns-backup.md"),
  `# GolfMap DNS backup (pre-Cloudflare cutover)

Backed up at: ${out.backedUpAt}

## Authoritative NS
${(out.dns.NS.error ? [String(out.dns.NS.error)] : out.dns.NS).map((n) => `- ${n}`).join("\n")}

## Apex (golfmap.kr)
- A: ${(out.dns.A.error ? [out.dns.A.error] : out.dns.A).join(", ")}
- AAAA: ${out.dns.AAAA.error || out.dns.AAAA}
- TXT: ${JSON.stringify(out.dns.TXT)}
- MX: ${JSON.stringify(out.dns.MX)}
- DNSSEC DS: ${JSON.stringify(out.dns.DS)}
- SOA minttl: ${out.dns.SOA?.minttl ?? "n/a"}

## www.golfmap.kr
- CNAME: ${(out.dns.WWW_CNAME.error ? [out.dns.WWW_CNAME.error] : out.dns.WWW_CNAME).join(", ")}
- A (resolved): ${(out.dns.WWW_A.error ? [out.dns.WWW_A.error] : out.dns.WWW_A).join(", ")}

## Current HTTP
- apex: ${out.http.apex.status} server=${out.http.apex.server}
- www: ${out.http.www.status} location=${out.http.www.location}
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
`,
);

console.log(JSON.stringify({ wrote: "reports/cloudflare-cutover/pre-cutover-dns-backup.*" }, null, 2));
