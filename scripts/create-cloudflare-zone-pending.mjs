import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function loadOauthToken() {
  const candidates = [
    join(process.env.APPDATA || "", "xdg.config/.wrangler/config/default.toml"),
    join(homedir(), ".wrangler/config/default.toml"),
  ];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    const match = text.match(/oauth_token\s*=\s*"([^"]+)"/);
    if (match) return match[1];
  }
  return null;
}

const token = loadOauthToken();
if (!token) {
  console.error("Missing wrangler OAuth token");
  process.exit(2);
}

const accountId = "208630068c7c4124a52d62fc6d9039b0";
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

const existing = await fetch(
  "https://api.cloudflare.com/client/v4/zones?name=golfmap.kr",
  { headers },
).then((r) => r.json());

if (existing.result?.length) {
  const zone = existing.result[0];
  console.log(
    JSON.stringify(
      {
        action: "already_exists",
        id: zone.id,
        status: zone.status,
        name_servers: zone.name_servers,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const created = await fetch("https://api.cloudflare.com/client/v4/zones", {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "golfmap.kr",
    account: { id: accountId },
    type: "full",
    jump_start: false,
  }),
}).then((r) => r.json());

const dir = join(process.cwd(), "reports/cloudflare-cutover");
mkdirSync(dir, { recursive: true });
writeFileSync(
  join(dir, "cloudflare-zone-create-result.json"),
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      success: created.success,
      errors: created.errors,
      result: created.result
        ? {
            id: created.result.id,
            name: created.result.name,
            status: created.result.status,
            name_servers: created.result.name_servers,
            original_name_servers: created.result.original_name_servers,
            type: created.result.type,
          }
        : null,
    },
    null,
    2,
  ),
);

console.log(
  JSON.stringify(
    {
      success: created.success,
      errors: created.errors,
      status: created.result?.status,
      name_servers: created.result?.name_servers,
      original_name_servers: created.result?.original_name_servers,
      zoneId: created.result?.id,
    },
    null,
    2,
  ),
);

if (!created.success) process.exit(1);
