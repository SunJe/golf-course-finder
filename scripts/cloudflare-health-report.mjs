#!/usr/bin/env node
/**
 * Cloudflare Workers + Zone HTTP health report (sampled analytics).
 * Secrets are never printed.
 *
 * Env:
 *   CLOUDFLARE_API_TOKEN (preferred) or Wrangler OAuth fallback
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_ZONE_ID
 *   CLOUDFLARE_WORKER_NAME (default: golfmap-korea-preview)
 *
 * Usage:
 *   node scripts/cloudflare-health-report.mjs --window 24h
 *   node scripts/cloudflare-health-report.mjs --window 7d
 *   node scripts/cloudflare-health-report.mjs --window incident
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  loadCloudflareAnalyticsEnv,
  requireKeys,
} from "./lib/loadCloudflareAnalyticsEnv.mjs";

const DEFAULT_ACCOUNT = "208630068c7c4124a52d62fc6d9039b0";
const DEFAULT_ZONE = "e48bdfb7e100858f8f391a4b2338ec63";
const DEFAULT_WORKER = "golfmap-korea-preview";

/** @typedef {'PASS'|'WARN'|'FAIL'|'UNKNOWN'} Status */

function parseArgs(argv) {
  /** @type {{ window: '24h'|'7d'|'incident' }} */
  const out = { window: "24h" };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--window" && argv[i + 1]) {
      out.window = /** @type {any} */ (argv[++i]);
    } else if (a === "24h" || a === "7d" || a === "incident") {
      out.window = a;
    }
  }
  if (!["24h", "7d", "incident"].includes(out.window)) {
    throw new Error(`Unsupported window: ${out.window}`);
  }
  return out;
}

function loadToken() {
  if (process.env.CLOUDFLARE_API_TOKEN?.trim()) {
    return { kind: "CLOUDFLARE_API_TOKEN", token: process.env.CLOUDFLARE_API_TOKEN.trim() };
  }
  const candidates = [
    join(process.env.APPDATA || "", "xdg.config/.wrangler/config/default.toml"),
    join(process.env.HOME || "", ".wrangler/config/default.toml"),
  ];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    const match = text.match(/oauth_token\s*=\s*"([^"]+)"/);
    if (match) return { kind: "wrangler-oauth", token: match[1] };
  }
  return null;
}

function windowRange(kind) {
  if (kind === "incident") {
    return {
      label: "incident",
      from: "2026-08-01T08:22:00.000Z",
      to: "2026-08-01T09:22:00.000Z",
      note: "Fixed bookmark: 2026-08-01 08:22–09:22 UTC (1102 / exceededResources cluster)",
    };
  }
  const to = new Date();
  const from = new Date(to);
  if (kind === "7d") from.setUTCDate(from.getUTCDate() - 7);
  else from.setUTCHours(from.getUTCHours() - 24);
  return {
    label: kind,
    from: from.toISOString(),
    to: to.toISOString(),
    note: "Rolling window ending now (UTC)",
  };
}

function seoulLabel(iso) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function usToMs(us) {
  if (us == null || Number.isNaN(Number(us))) return null;
  return Number(us) / 1000;
}

function bytesToMb(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return null;
  return Number(bytes) / (1024 * 1024);
}

function fmt(n, digits = 2) {
  if (n == null || Number.isNaN(n)) return "UNKNOWN";
  if (typeof n === "number" && Number.isInteger(n)) return String(n);
  return Number(n).toFixed(digits);
}

function pct(part, whole) {
  if (whole == null || whole === 0 || part == null) return null;
  return (part / whole) * 100;
}

/**
 * @param {number|null} value
 * @param {(v:number)=>Status} grader
 * @returns {Status}
 */
function grade(value, grader) {
  if (value == null || Number.isNaN(value)) return "UNKNOWN";
  return grader(value);
}

async function graphql(token, query, variables) {
  const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  return { http: response.status, ...json };
}

function permissionHelp(errors) {
  const messages = (errors || []).map((e) => e.message || String(e)).join("; ");
  return [
    "Cloudflare Analytics API authorization failed.",
    messages ? `API message: ${messages}` : null,
    "Create an API token (do not paste the value into chat) with at least:",
    "- Account → Account Analytics → Read",
    "- Account → Workers Scripts → Read (or Workers Observability Read if listed)",
    "- Account → Workers Tail → Read (optional, for Logs UI correlation)",
    "- Zone → Analytics → Read (zone: golfmap.kr)",
    "- Zone → Zone → Read",
    "Store as CLOUDFLARE_API_TOKEN in gitignored .env.cloudflare-analytics.local",
  ]
    .filter(Boolean)
    .join("\n");
}

function aggregateWorkerRows(rows) {
  /** @type {Record<string, number>} */
  const byStatus = {};
  let requests = 0;
  let errors = 0;
  let subrequests = 0;
  /** @type {number[]} */
  const cpuP50 = [];
  /** @type {number[]} */
  const cpuP95 = [];
  /** @type {number[]} */
  const cpuP99 = [];
  /** @type {number[]} */
  const wallP50 = [];
  /** @type {number[]} */
  const wallP95 = [];
  /** @type {number[]} */
  const wallP99 = [];
  /** @type {number[]} */
  const memP50 = [];
  /** @type {number[]} */
  const memP99 = [];

  for (const row of rows || []) {
    const status = row.dimensions?.status || "unknown";
    const req = row.sum?.requests || 0;
    byStatus[status] = (byStatus[status] || 0) + req;
    requests += req;
    errors += row.sum?.errors || 0;
    subrequests += row.sum?.subrequests || 0;
    const q = row.quantiles || {};
    if (q.cpuTimeP50 != null) cpuP50.push(q.cpuTimeP50);
    if (q.cpuTimeP95 != null) cpuP95.push(q.cpuTimeP95);
    if (q.cpuTimeP99 != null) cpuP99.push(q.cpuTimeP99);
    if (q.wallTimeP50 != null) wallP50.push(q.wallTimeP50);
    if (q.wallTimeP95 != null) wallP95.push(q.wallTimeP95);
    if (q.wallTimeP99 != null) wallP99.push(q.wallTimeP99);
    if (q.memoryUsageBytesP50 != null) memP50.push(q.memoryUsageBytesP50);
    if (q.memoryUsageBytesP99 != null) memP99.push(q.memoryUsageBytesP99);
  }

  const maxOrNull = (arr) => (arr.length ? Math.max(...arr) : null);
  // Weighted-ish summary: use max of bucket quantiles as conservative ops signal
  return {
    requests,
    errors,
    subrequests,
    byStatus,
    success: byStatus.success || 0,
    exceededResources: byStatus.exceededResources || 0,
    clientDisconnected: byStatus.clientDisconnected || 0,
    scriptThrewException: byStatus.scriptThrewException || 0,
    internalError: byStatus.internalError || 0,
    // Quantiles are per analytics bucket; use median for central tendency and
    // max of high percentiles as a conservative ops "worst bucket" signal.
    cpuP50Ms: usToMs(median(cpuP50)),
    cpuP95Ms: usToMs(maxOrNull(cpuP95)),
    cpuP99Ms: usToMs(maxOrNull(cpuP99)),
    wallP50Ms: usToMs(median(wallP50)),
    wallP95Ms: usToMs(maxOrNull(wallP95)),
    wallP99Ms: usToMs(maxOrNull(wallP99)),
    memoryP50Mb: bytesToMb(median(memP50)),
    memoryP99Mb: bytesToMb(maxOrNull(memP99)),
    empty: !rows || rows.length === 0,
  };
}

function median(arr) {
  if (!arr?.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function evaluate(worker, zoneHttp) {
  const successRate = pct(worker.success, worker.requests);
  /** @type {Record<string, { value: string|number|null, status: Status, note?: string }>} */
  const metrics = {
    workerRequests: {
      value: worker.empty ? null : worker.requests,
      status: worker.empty ? "UNKNOWN" : "PASS",
    },
    successRatePct: {
      value: successRate == null ? null : Number(successRate.toFixed(3)),
      status: grade(successRate, (v) => (v < 99.9 ? "FAIL" : "PASS")),
    },
    exceededResources: {
      value: worker.empty ? null : worker.exceededResources,
      status: grade(worker.exceededResources, (v) => (v > 0 ? "FAIL" : "PASS")),
    },
    http5xx: {
      value: zoneHttp?.status5xx ?? null,
      status:
        zoneHttp?.status5xx == null
          ? "UNKNOWN"
          : grade(zoneHttp.status5xx, (v) => (v > 0 ? "WARN" : "PASS")),
    },
    cpuP50Ms: {
      value: worker.cpuP50Ms,
      status: grade(worker.cpuP50Ms, () => "PASS"),
    },
    cpuP95Ms: {
      value: worker.cpuP95Ms,
      status: grade(worker.cpuP95Ms, (v) => (v >= 8 ? "WARN" : "PASS")),
      note: "Free plan CPU budget is tight (~10ms nominal; rollover may allow higher samples)",
    },
    cpuP99Ms: {
      value: worker.cpuP99Ms,
      status: grade(worker.cpuP99Ms, (v) => (v >= 10 ? "FAIL" : "PASS")),
    },
    wallP95Ms: {
      value: worker.wallP95Ms,
      status: worker.wallP95Ms == null ? "UNKNOWN" : "PASS",
    },
    memoryP99Mb: {
      value: worker.memoryP99Mb,
      status: worker.memoryP99Mb == null ? "UNKNOWN" : "PASS",
    },
  };

  const ranks = { FAIL: 3, WARN: 2, UNKNOWN: 1, PASS: 0 };
  let overall = /** @type {Status} */ ("PASS");
  for (const m of Object.values(metrics)) {
    if (ranks[m.status] > ranks[overall]) overall = m.status;
  }
  return { metrics, overall, successRate };
}

function renderMarkdown(report) {
  const { window, worker, zoneHttp, evaluation, authKind, topPaths, cache } = report;
  const m = evaluation.metrics;
  const lines = [];
  lines.push(`# GolfMap Cloudflare Health — ${window.label}`);
  lines.push("");
  lines.push(`- Generated: ${report.generatedAtUtc} (UTC) / ${report.generatedAtSeoul} (Asia/Seoul)`);
  lines.push(`- Window: ${window.from} → ${window.to}`);
  lines.push(`- Window (Seoul): ${seoulLabel(window.from)} → ${seoulLabel(window.to)}`);
  lines.push(`- Note: ${window.note}`);
  lines.push(`- Worker: \`${report.workerName}\``);
  lines.push(`- Auth: \`${authKind}\` (token value not printed)`);
  lines.push(`- **Analytics are sampled / adaptive — use for trends, not exact event accounting.**`);
  lines.push(`- Overall: **${evaluation.overall}**`);
  lines.push("");
  lines.push("| 지표 | 현재 | 상태 |");
  lines.push("|---|---:|:---:|");
  lines.push(`| Worker requests | ${fmt(m.workerRequests.value, 0)} | ${m.workerRequests.status} |`);
  lines.push(`| success rate | ${m.successRatePct.value == null ? "UNKNOWN" : `${m.successRatePct.value}%`} | ${m.successRatePct.status} |`);
  lines.push(`| exceeded resources | ${fmt(m.exceededResources.value, 0)} | ${m.exceededResources.status} |`);
  lines.push(`| 5xx | ${fmt(m.http5xx.value, 0)} | ${m.http5xx.status} |`);
  lines.push(`| CPU p50 | ${fmt(m.cpuP50Ms.value)} ms | ${m.cpuP50Ms.status} |`);
  lines.push(`| CPU p95 | ${fmt(m.cpuP95Ms.value)} ms | ${m.cpuP95Ms.status} |`);
  lines.push(`| CPU p99 | ${fmt(m.cpuP99Ms.value)} ms | ${m.cpuP99Ms.status} |`);
  lines.push(`| wall p95 | ${fmt(m.wallP95Ms.value)} ms | ${m.wallP95Ms.status} |`);
  lines.push(`| memory p99 | ${m.memoryP99Mb.value == null ? "UNKNOWN" : `${fmt(m.memoryP99Mb.value)} MB`} | ${m.memoryP99Mb.status} |`);
  lines.push("");
  lines.push("## Worker status breakdown");
  lines.push("");
  lines.push("| status | requests |");
  lines.push("|---|---:|");
  for (const [status, count] of Object.entries(worker.byStatus).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${status} | ${count} |`);
  }
  if (!Object.keys(worker.byStatus).length) {
    lines.push("| _(no rows)_ | 0 |");
  }
  lines.push("");
  lines.push("## Zone HTTP (golfmap.kr scope when available)");
  lines.push("");
  if (!zoneHttp || zoneHttp.empty) {
    lines.push("- Zone HTTP summary: **UNKNOWN** (empty or unauthorized)");
  } else {
    lines.push(`- Requests: ${zoneHttp.requests}`);
    lines.push(`- Cached requests: ${zoneHttp.cachedRequests}`);
    lines.push(`- Threats: ${zoneHttp.threats}`);
    lines.push(`- 5xx (adaptive edge status when available): ${zoneHttp.status5xx ?? "UNKNOWN"}`);
  }
  lines.push("");
  if (cache?.length) {
    lines.push("### Cache status (sampled)");
    lines.push("");
    lines.push("| cacheStatus | count |");
    lines.push("|---|---:|");
    for (const row of cache) lines.push(`| ${row.cacheStatus} | ${row.count} |`);
    lines.push("");
  }
  if (topPaths?.length) {
    lines.push("### Top paths (sampled, pathname only)");
    lines.push("");
    lines.push("| path | count |");
    lines.push("|---|---:|");
    for (const row of topPaths) lines.push(`| ${row.path} | ${row.count} |`);
    lines.push("");
  }
  lines.push("## Ops tips");
  lines.push("");
  lines.push("- Dashboard: Cloudflare → Workers & Pages → `golfmap-korea-preview` → Metrics / Observability");
  lines.push("- If `exceededResources` > 0: open Logs, filter outcome/status, check `/map` and `/courses/*` CPU");
  lines.push("- Production hostnames only for cutover health; compare workers.dev separately");
  lines.push("- See `docs/operations/analytics.md`");
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv);
  loadCloudflareAnalyticsEnv();

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || DEFAULT_ACCOUNT;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim() || DEFAULT_ZONE;
  const workerName =
    process.env.CLOUDFLARE_WORKER_NAME?.trim() || DEFAULT_WORKER;

  const auth = loadToken();
  if (!auth) {
    console.error(
      [
        "Missing Cloudflare credentials.",
        "Set CLOUDFLARE_API_TOKEN in .env.cloudflare-analytics.local (gitignored),",
        "or login with `npx wrangler login` for OAuth fallback.",
        "",
        permissionHelp([]),
      ].join("\n"),
    );
    process.exit(2);
  }

  // Soft require — defaults exist for known GolfMap account/zone
  const missingOptional = requireKeys([]);
  void missingOptional;

  const window = windowRange(args.window);

  const workerQuery = `
    query($accountTag: string!, $from: Time!, $to: Time!, $scriptName: string) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          workersInvocationsAdaptive(
            limit: 5000
            filter: {
              datetime_geq: $from
              datetime_leq: $to
              scriptName: $scriptName
            }
            orderBy: [datetime_ASC]
          ) {
            dimensions { datetime status scriptName datetimeFiveMinutes }
            sum { requests errors subrequests }
            quantiles {
              cpuTimeP50 cpuTimeP95 cpuTimeP99
              wallTimeP50 wallTimeP95 wallTimeP99
              memoryUsageBytesP50 memoryUsageBytesP99
            }
          }
        }
      }
    }
  `;

  const workerRes = await graphql(auth.token, workerQuery, {
    accountTag: accountId,
    from: window.from,
    to: window.to,
    scriptName: workerName,
  });

  if (workerRes.errors?.length || workerRes.http === 401 || workerRes.http === 403) {
    console.error(permissionHelp(workerRes.errors));
    process.exit(3);
  }

  const workerRows =
    workerRes.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive || [];
  const worker = aggregateWorkerRows(workerRows);

  // Zone hourly totals
  const zoneHourlyQuery = `
    query($zoneTag: string!, $from: Time!, $to: Time!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequests1hGroups(
            limit: 200
            filter: { datetime_geq: $from, datetime_lt: $to }
            orderBy: [datetime_ASC]
          ) {
            dimensions { datetime }
            sum { requests cachedRequests threats bytes }
          }
        }
      }
    }
  `;
  const zoneHourly = await graphql(auth.token, zoneHourlyQuery, {
    zoneTag: zoneId,
    from: window.from,
    to: window.to,
  });

  let zoneHttp = { empty: true, requests: null, cachedRequests: null, threats: null, status5xx: null };
  if (!zoneHourly.errors?.length) {
    const groups = zoneHourly.data?.viewer?.zones?.[0]?.httpRequests1hGroups || [];
    if (groups.length) {
      zoneHttp = {
        empty: false,
        requests: groups.reduce((a, g) => a + (g.sum?.requests || 0), 0),
        cachedRequests: groups.reduce((a, g) => a + (g.sum?.cachedRequests || 0), 0),
        threats: groups.reduce((a, g) => a + (g.sum?.threats || 0), 0),
        status5xx: null,
      };
    }
  }

  /** @type {{ path: string, count: number }[]} */
  let topPaths = [];
  /** @type {{ cacheStatus: string, count: number }[]} */
  let cache = [];
  let status5xx = null;

  const adaptiveQuery = `
    query($zoneTag: string!, $from: Time!, $to: Time!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          paths: httpRequestsAdaptiveGroups(
            limit: 20
            filter: {
              datetime_geq: $from
              datetime_leq: $to
              clientRequestHTTPHost: "golfmap.kr"
            }
            orderBy: [count_DESC]
          ) {
            count
            dimensions { clientRequestPath }
          }
          cache: httpRequestsAdaptiveGroups(
            limit: 20
            filter: {
              datetime_geq: $from
              datetime_leq: $to
              clientRequestHTTPHost: "golfmap.kr"
            }
            orderBy: [count_DESC]
          ) {
            count
            dimensions { cacheStatus }
          }
          statuses: httpRequestsAdaptiveGroups(
            limit: 50
            filter: {
              datetime_geq: $from
              datetime_leq: $to
              clientRequestHTTPHost: "golfmap.kr"
            }
            orderBy: [count_DESC]
          ) {
            count
            dimensions { edgeResponseStatus }
          }
        }
      }
    }
  `;

  const adaptive = await graphql(auth.token, adaptiveQuery, {
    zoneTag: zoneId,
    from: window.from,
    to: window.to,
  });

  if (!adaptive.errors?.length) {
    const z = adaptive.data?.viewer?.zones?.[0];
    topPaths = (z?.paths || [])
      .filter((r) => r.dimensions?.clientRequestPath)
      .map((r) => ({
        path: String(r.dimensions.clientRequestPath).split("?")[0],
        count: r.count || 0,
      }))
      .reduce((acc, row) => {
        const existing = acc.find((x) => x.path === row.path);
        if (existing) existing.count += row.count;
        else acc.push(row);
        return acc;
      }, /** @type {{path:string,count:number}[]} */ ([]))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    /** @type {Record<string, number>} */
    const cacheMap = {};
    for (const row of z?.cache || []) {
      const key = row.dimensions?.cacheStatus || "unknown";
      cacheMap[key] = (cacheMap[key] || 0) + (row.count || 0);
    }
    cache = Object.entries(cacheMap)
      .map(([cacheStatus, count]) => ({ cacheStatus, count }))
      .sort((a, b) => b.count - a.count);

    status5xx = 0;
    for (const row of z?.statuses || []) {
      const code = Number(row.dimensions?.edgeResponseStatus);
      if (code >= 500 && code <= 599) status5xx += row.count || 0;
    }
    if (!zoneHttp.empty) zoneHttp.status5xx = status5xx;
    else {
      zoneHttp = {
        empty: false,
        requests: null,
        cachedRequests: null,
        threats: null,
        status5xx,
      };
    }
  }

  const evaluation = evaluate(worker, zoneHttp);
  const generatedAt = new Date();
  const day = generatedAt.toISOString().slice(0, 10);

  const report = {
    generatedAtUtc: generatedAt.toISOString(),
    generatedAtSeoul: seoulLabel(generatedAt.toISOString()),
    window,
    workerName,
    accountId,
    zoneId,
    authKind: auth.kind,
    sampled: true,
    disclaimer:
      "Cloudflare GraphQL adaptive analytics are sampled. Treat counts/quantiles as trends.",
    worker,
    zoneHttp,
    topPaths,
    cache,
    evaluation,
  };

  const outDir = join(process.cwd(), "reports", "analytics");
  mkdirSync(outDir, { recursive: true });
  const base = `${day}-cloudflare-health-${window.label}`;
  const mdPath = join(outDir, `${base}.md`);
  const jsonPath = join(outDir, `${base}.json`);
  // Also write stable aliases requested by prompt
  const stableMd = join(outDir, `${day}-cloudflare-health.md`);
  const stableJson = join(outDir, `${day}-cloudflare-health.json`);

  const md = renderMarkdown(report);
  writeFileSync(mdPath, md, "utf8");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  writeFileSync(stableMd, md, "utf8");
  writeFileSync(stableJson, JSON.stringify(report, null, 2), "utf8");

  console.log(
    JSON.stringify(
      {
        ok: true,
        overall: evaluation.overall,
        window: window.label,
        files: [mdPath, jsonPath, stableMd, stableJson],
        summary: {
          requests: worker.requests,
          successRatePct: evaluation.metrics.successRatePct.value,
          exceededResources: worker.exceededResources,
          cpuP95Ms: worker.cpuP95Ms,
          cpuP99Ms: worker.cpuP99Ms,
          http5xx: zoneHttp.status5xx,
        },
      },
      null,
      2,
    ),
  );

  // Non-zero exit on FAIL so CI/ops can alert — UNKNOWN does not fail the process
  if (evaluation.overall === "FAIL") process.exit(1);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
