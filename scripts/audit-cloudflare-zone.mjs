import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function loadOauthToken() {
  const candidates = [
    join(process.env.APPDATA || "", "xdg.config/.wrangler/config/default.toml"),
    join(homedir(), ".wrangler/config/default.toml"),
    join(process.env.APPDATA || "", ".wrangler/config/default.toml"),
  ];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    const match = text.match(/oauth_token\s*=\s*"([^"]+)"/);
    if (match) return { path, token: match[1] };
  }
  return null;
}

const auth = loadOauthToken();
if (!auth) {
  console.error("No wrangler OAuth token found");
  process.exit(2);
}

const accountId = "208630068c7c4124a52d62fc6d9039b0";

async function cf(path) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
      Accept: "application/json",
    },
  });
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = {
      parseError: true,
      status: response.status,
      contentType,
      bodyPreview: text.slice(0, 200),
    };
  }
  return { status: response.status, contentType, json };
}

const zoneProbe = await cf("/zones?name=golfmap.kr");
const accountZones = await cf(`/zones?account.id=${accountId}&per_page=50`);
const worker = await cf(
  `/accounts/${accountId}/workers/scripts/golfmap-korea-preview`,
);

// Alternative: workers domains endpoint
const domains = await cf(`/accounts/${accountId}/workers/domains`);

const out = {
  inspectedAt: new Date().toISOString(),
  accountId,
  oauthConfigPath: auth.path,
  tokenPresent: true,
  tokenLength: auth.token.length,
  zoneProbe: {
    status: zoneProbe.status,
    contentType: zoneProbe.contentType,
    success: zoneProbe.json?.success,
    count: zoneProbe.json?.result?.length,
    errors: zoneProbe.json?.errors,
    result: (zoneProbe.json?.result || []).map((z) => ({
      id: z.id,
      name: z.name,
      status: z.status,
      name_servers: z.name_servers,
      original_name_servers: z.original_name_servers,
    })),
    parseError: zoneProbe.json?.parseError,
    bodyPreview: zoneProbe.json?.bodyPreview,
  },
  accountZones: {
    status: accountZones.status,
    success: accountZones.json?.success,
    names: (accountZones.json?.result || []).map((z) => ({
      name: z.name,
      status: z.status,
    })),
    errors: accountZones.json?.errors,
    bodyPreview: accountZones.json?.bodyPreview,
  },
  worker: {
    status: worker.status,
    success: worker.json?.success,
    errors: worker.json?.errors,
  },
  workerDomains: {
    status: domains.status,
    success: domains.json?.success,
    result: domains.json?.result,
    errors: domains.json?.errors,
    bodyPreview: domains.json?.bodyPreview,
  },
};

const reportDir = join(process.cwd(), "reports/cloudflare-cutover");
mkdirSync(reportDir, { recursive: true });
writeFileSync(
  join(reportDir, "cloudflare-zone-audit.json"),
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
