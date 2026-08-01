/**
 * Compare Production baseline (be560e3a on golfmap.kr) vs PR #22 Preview Worker.
 * Read-only against Production; never mutates DNS/domains.
 */
import https from "node:https";
import dns from "node:dns";
import { writeFileSync, mkdirSync } from "node:fs";

dns.setDefaultResultOrder("ipv4first");

const BASELINE = (
  process.env.BASELINE_URL || "https://golfmap.kr"
).replace(/\/$/, "");
const PREVIEW = (
  process.env.PR22_PREVIEW_URL ||
  "https://golfmap-korea-map-opt.sun15002000.workers.dev"
).replace(/\/$/, "");

const COURSE_IDS = [
  "gc-60319bf1693c",
  "gc-81f36c789316",
  "gc-81ecacc0ae41",
  "gc-41b5c15f44da",
  "gc-9d709ff43c33",
  "gc-437ea8156737",
  "gc-4487ee52808c",
  "gc-c77232b99bd6",
  "gc-a862e6d054f2",
  "gc-34f4d067cfc2",
];

const MAP_QUERIES = [
  "/map",
  "/map?q=%EC%84%9C%EC%9A%B8",
  "/map?region=%EC%84%9C%EC%9A%B8",
  "/map?holes=9%ED%99%80",
  "/map?holes=18%ED%99%80",
  "/map?price=10%EB%A7%8C%EC%9B%90%20%EC%9D%B4%ED%95%98",
  "/map?tag=beginner",
  "/map?tag=beginner&view=list",
  "/map?collection=near-seoul",
  "/map?collection=near-seoul-beginner",
  "/map?view=list",
  "/map?operation=%EB%8C%80%EC%A4%91%EC%A0%9C",
  "/map?q=%EC%9D%B8%EC%B2%9C&view=list",
  "/map?region=%EA%B2%BD%EA%B8%B0&holes=18%ED%99%80",
  "/map?price=15%EB%A7%8C%EC%9B%90%20%EC%9D%B4%ED%95%98&view=list",
  "/map?tag=night",
  "/map?collection=budget",
  "/map?q=CC",
  "/map?region=%EC%9D%B8%EC%B2%9C&view=map",
  "/map?holes=9%ED%99%80&tag=beginner&view=list",
];

function get(url) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const started = Date.now();
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "GET",
        family: 4,
        headers: {
          "user-agent": "GolfMapPR22Compare/1.0",
          "cache-control": "no-cache",
        },
        timeout: 90000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          const body = buf.toString("utf8");
          const timing = res.headers["server-timing"] || "";
          const cfWorker = timing.match(/cfWorker;dur=([\d.]+)/i);
          resolve({
            url,
            status: res.statusCode,
            wallMs: Date.now() - started,
            cfWorkerMs: cfWorker ? Number(cfWorker[1]) : null,
            server: res.headers.server || null,
            cfRay: res.headers["cf-ray"] || null,
            opennext: res.headers["x-opennext"] || null,
            robots: res.headers["x-robots-tag"] || null,
            bytes: buf.length,
            body,
            looks1102: /Error 1102|exceeded resource/i.test(body),
          });
        });
      },
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ url, error: "timeout", wallMs: Date.now() - started });
    });
    req.on("error", (e) =>
      resolve({ url, error: e.message, wallMs: Date.now() - started }),
    );
    req.end();
  });
}

function mapCount(html) {
  const m = html.match(/전체 골프장[^0-9]*([0-9]{2,4})곳/);
  if (m) return Number(m[1]);
  const ids = html.match(/gc-[a-f0-9]{12}/gi) || [];
  return new Set(ids.map((x) => x.toLowerCase())).size;
}

function courseIds(html) {
  const ids = html.match(/gc-[a-f0-9]{12}/gi) || [];
  return [...new Set(ids.map((x) => x.toLowerCase()))].sort();
}

function nearbyIds(html) {
  // Heuristic: course cards in nearby section — collect course hrefs after "근처" or all /courses/ links excluding self
  const links = [...html.matchAll(/href="\/courses\/(gc-[a-f0-9]{12})"/gi)].map(
    (m) => m[1].toLowerCase(),
  );
  return [...new Set(links)];
}

function pct(sorted, p) {
  if (!sorted.length) return null;
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

function summarize(samples) {
  const walls = samples.map((s) => s.wallMs).filter((n) => n != null).sort((a, b) => a - b);
  const cpus = samples.map((s) => s.cfWorkerMs).filter((n) => n != null).sort((a, b) => a - b);
  return {
    n: samples.length,
    status200: samples.filter((s) => s.status === 200).length,
    status1102ish: samples.filter((s) => s.looks1102 || s.status === 503).length,
    errors: samples.filter((s) => s.error).length,
    wallMs: { p50: pct(walls, 50), p95: pct(walls, 95), p99: pct(walls, 99), max: walls.at(-1) ?? null },
    cfWorkerMs: { p50: pct(cpus, 50), p95: pct(cpus, 95), p99: pct(cpus, 99), max: cpus.at(-1) ?? null },
    avgBytes: samples.length
      ? Math.round(samples.reduce((a, s) => a + (s.bytes || 0), 0) / samples.length)
      : null,
  };
}

async function coldWarm(base, path, n) {
  const cold = [];
  const warm = [];
  for (let i = 0; i < n; i++) {
    const sep = path.includes("?") ? "&" : "?";
    cold.push(await get(`${base}${path}${sep}bench=${Date.now()}-${i}`));
    warm.push(await get(`${base}${path}`));
  }
  return { cold: summarize(cold), warm: summarize(warm) };
}

const report = {
  comparedAt: new Date().toISOString(),
  baseline: BASELINE,
  preview: PREVIEW,
  functional: {},
  filters: [],
  courses: [],
  perf: {},
  mergeCriteria: {},
};

console.error("spot checks...");
const [bHome, pHome, bMap, pMap] = await Promise.all([
  get(`${BASELINE}/`),
  get(`${PREVIEW}/`),
  get(`${BASELINE}/map`),
  get(`${PREVIEW}/map`),
]);

report.functional = {
  baselineMapCount: mapCount(bMap.body || ""),
  previewMapCount: mapCount(pMap.body || ""),
  mapCountMatch532:
    mapCount(bMap.body || "") === 532 && mapCount(pMap.body || "") === 532,
  baselineRecommended: courseIds(bHome.body || "").slice(0, 4),
  previewRecommended: courseIds(pHome.body || "").slice(0, 4),
  recommendedCountPreview: courseIds(pHome.body || "").slice(0, 8).length,
  baselinePayloadBytes: { home: bHome.bytes, map: bMap.bytes },
  previewPayloadBytes: { home: pHome.bytes, map: pMap.bytes },
  mapPayloadReductionPct:
    bMap.bytes && pMap.bytes
      ? Number((((bMap.bytes - pMap.bytes) / bMap.bytes) * 100).toFixed(1))
      : null,
  previewGa4: /G-FMY10PMHEB/.test(pHome.body || ""),
  previewCanonicalGolfmap: /https:\/\/golfmap\.kr/.test(pHome.body || ""),
  previewNoNextImage: !/\/_next\/image\?/.test(pHome.body || "") &&
    !/\/_next\/image\?/.test(pMap.body || ""),
  previewLooks1102: !!(pHome.looks1102 || pMap.looks1102),
  // workers.dev preview often has noindex by design — flag separately
  previewRobotsHeader: pHome.robots,
  baselineRobotsHeader: bHome.robots,
};

console.error("filter query parity (20)...");
for (const q of MAP_QUERIES) {
  const [b, p] = await Promise.all([get(`${BASELINE}${q}`), get(`${PREVIEW}${q}`)]);
  const bIds = courseIds(b.body || "");
  const pIds = courseIds(p.body || "");
  const bSet = new Set(bIds);
  const pSet = new Set(pIds);
  const missingInPreview = bIds.filter((id) => !pSet.has(id)).slice(0, 10);
  const extraInPreview = pIds.filter((id) => !bSet.has(id)).slice(0, 10);
  const overlap = bIds.filter((id) => pSet.has(id)).length;
  const union = new Set([...bIds, ...pIds]).size;
  report.filters.push({
    q,
    baselineStatus: b.status,
    previewStatus: p.status,
    baselineCountHint: mapCount(b.body || ""),
    previewCountHint: mapCount(p.body || ""),
    baselineIds: bIds.length,
    previewIds: pIds.length,
    jaccard: union ? Number((overlap / union).toFixed(3)) : null,
    missingInPreview,
    extraInPreview,
    looks1102: !!(b.looks1102 || p.looks1102),
  });
}

console.error("course detail + nearby (10)...");
for (const id of COURSE_IDS) {
  const path = `/courses/${id}`;
  const [b, p] = await Promise.all([
    get(`${BASELINE}${path}`),
    get(`${PREVIEW}${path}`),
  ]);
  const bNear = nearbyIds(b.body || "").filter((x) => x !== id).slice(0, 8);
  const pNear = nearbyIds(p.body || "").filter((x) => x !== id).slice(0, 8);
  const pSet = new Set(pNear);
  const overlap = bNear.filter((x) => pSet.has(x)).length;
  report.courses.push({
    id,
    baselineStatus: b.status,
    previewStatus: p.status,
    baselineNearby: bNear,
    previewNearby: pNear,
    nearbyOverlap: overlap,
    nearbyBaselineN: bNear.length,
    nearbyPreviewN: pNear.length,
    looks1102: !!(b.looks1102 || p.looks1102),
  });
}

console.error("perf /map cold/warm 50...");
report.perf.mapBaseline = await coldWarm(BASELINE, "/map", 50);
report.perf.mapPreview = await coldWarm(PREVIEW, "/map", 50);

console.error("perf query sample cold/warm (first 5 queries × 5)...");
const queryPerf = [];
for (const q of MAP_QUERIES.slice(0, 5)) {
  queryPerf.push({
    q,
    baseline: await coldWarm(BASELINE, q, 5),
    preview: await coldWarm(PREVIEW, q, 5),
  });
}
report.perf.querySamples = queryPerf;

console.error("perf course detail cold/warm 10×10...");
const coursePerf = [];
for (const id of COURSE_IDS) {
  coursePerf.push({
    id,
    baseline: await coldWarm(BASELINE, `/courses/${id}`, 5),
    preview: await coldWarm(PREVIEW, `/courses/${id}`, 5),
  });
}
report.perf.courses = coursePerf;

// Aggregate course wall/cpu
function flattenCourse(side) {
  const walls = [];
  const cpus = [];
  for (const row of coursePerf) {
    for (const s of ["cold", "warm"]) {
      // we only have summaries — use p50 as proxy samples insufficient; re-derive from stored summaries
      const sum = row[side][s];
      if (sum.wallMs.p50 != null) walls.push(sum.wallMs.p50);
      if (sum.cfWorkerMs.p50 != null) cpus.push(sum.cfWorkerMs.p50);
    }
  }
  walls.sort((a, b) => a - b);
  cpus.sort((a, b) => a - b);
  return {
    wallP50median: pct(walls, 50),
    cfWorkerP50median: pct(cpus, 50),
  };
}

const mapBaseP95 = report.perf.mapBaseline.cold.wallMs.p95;
const mapPrevP95 = report.perf.mapPreview.cold.wallMs.p95;
const mapWallImprove =
  mapBaseP95 && mapPrevP95
    ? Number((((mapBaseP95 - mapPrevP95) / mapBaseP95) * 100).toFixed(1))
    : null;

const mapBaseCpuP95 = report.perf.mapBaseline.cold.cfWorkerMs.p95;
const mapPrevCpuP95 = report.perf.mapPreview.cold.cfWorkerMs.p95;
const mapCpuImprove =
  mapBaseCpuP95 && mapPrevCpuP95
    ? Number((((mapBaseCpuP95 - mapPrevCpuP95) / mapBaseCpuP95) * 100).toFixed(1))
    : null;

const filterPass = report.filters.every(
  (f) =>
    f.previewStatus === 200 &&
    !f.looks1102 &&
    (f.jaccard == null || f.jaccard >= 0.85) &&
    f.missingInPreview.length === 0,
);

const coursePass = report.courses.every(
  (c) =>
    c.previewStatus === 200 &&
    !c.looks1102 &&
    c.nearbyPreviewN > 0 &&
    (c.nearbyBaselineN === 0 || c.nearbyOverlap >= Math.min(3, c.nearbyBaselineN)),
);

const zeroErrors =
  report.perf.mapPreview.cold.status1102ish === 0 &&
  report.perf.mapPreview.warm.status1102ish === 0 &&
  report.perf.mapPreview.cold.errors === 0;

report.mergeCriteria = {
  map532: report.functional.mapCountMatch532,
  filterParity: filterPass,
  courseNearbyParity: coursePass,
  mapWallP95ImprovePct: mapWallImprove,
  mapWallP95TargetPct: 25,
  mapWallP95Pass: mapWallImprove != null && mapWallImprove >= 25,
  mapCpuP95ImprovePct: mapCpuImprove,
  mapPayloadReductionPct: report.functional.mapPayloadReductionPct,
  zero1102OnPreviewBenches: zeroErrors,
  previewStatuses200:
    report.perf.mapPreview.cold.status200 === 50 &&
    report.perf.mapPreview.warm.status200 === 50,
  noteMemory:
    "Workers GraphQL has no memory p99 in workersInvocationsAdaptive; payload bytes used as proxy. Dashboard memory not available via OAuth.",
  recommendMerge: null,
};

report.mergeCriteria.recommendMerge =
  report.mergeCriteria.map532 &&
  report.mergeCriteria.filterParity &&
  report.mergeCriteria.courseNearbyParity &&
  report.mergeCriteria.mapWallP95Pass &&
  report.mergeCriteria.zero1102OnPreviewBenches &&
  report.mergeCriteria.previewStatuses200;

report.courseAgg = {
  baseline: flattenCourse("baseline"),
  preview: flattenCourse("preview"),
};

mkdirSync("reports/cloudflare-cutover", { recursive: true });
writeFileSync(
  "reports/cloudflare-cutover/pr22-preview-compare.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
