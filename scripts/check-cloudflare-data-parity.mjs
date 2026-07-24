/**
 * Compare Cloudflare Preview vs Production for user-facing course data parity.
 * Env:
 *   CF_PREVIEW_URL (required)
 *   PRODUCTION_URL (default https://golfmap.kr)
 * Never prints secrets.
 */
const previewBase = process.env.CF_PREVIEW_URL?.replace(/\/$/, "");
const productionBase = (
  process.env.PRODUCTION_URL || "https://golfmap.kr"
).replace(/\/$/, "");
const EXPECTED_MAP_COUNT = Number(process.env.EXPECTED_MAP_COUNT || "532");
const KNOWN_IDS = [
  "gc-9d709ff43c33",
  "gc-437ea8156737",
  "gc-60319bf1693c", // 인천그랜드CC — top home recommended
];
const FALLBACK_NAMES = [
  "강남 센트럴 골프클럽",
  "경기 광주CC",
  "한강 컨트리클럽",
  "북한산 시티 골프장",
];

if (!previewBase) {
  console.error("Set CF_PREVIEW_URL");
  process.exit(1);
}

const ua = { "user-agent": "GolfMapCloudflareDataParity/1.0" };

async function fetchText(base, pathname) {
  const url = `${base}${pathname}`;
  const response = await fetch(url, { redirect: "manual", headers: ua });
  const type = response.headers.get("content-type") || "";
  const body = type.includes("text/") || type.includes("json")
    ? await response.text()
    : "";
  return {
    url,
    status: response.status,
    robots: response.headers.get("x-robots-tag") || "",
    body,
  };
}

function extractMapTotal(html) {
  const patterns = [
    /전체 골프장[^0-9]*([0-9]{2,4})곳/,
    /전국 골프장[^0-9]*([0-9]{2,4})곳/,
    /전체 결과[^0-9]*([0-9]{2,4})/,
    /"totalCourses"\s*:\s*([0-9]{2,4})/,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return Number(match[1]);
  }
  // Serialized course arrays in RSC/flight payloads often repeat ids
  const gcIds = html.match(/gc-[a-f0-9]{12}/gi);
  if (gcIds && gcIds.length >= 90) {
    return new Set(gcIds.map((id) => id.toLowerCase())).size;
  }
  return null;
}

function extractRecommendedNames(html) {
  if (!html.includes("추천 골프장")) return [];
  // Carousel items typically link to /courses/gc-...
  const links = [
    ...html.matchAll(/href="\/courses\/(gc-[a-f0-9]+)"[^>]*>([^<]+)</gi),
  ];
  const fromSection = [];
  const idx = html.indexOf("추천 골프장");
  if (idx === -1) return fromSection;
  const slice = html.slice(idx, idx + 12000);
  for (const match of slice.matchAll(
    /href="\/courses\/(gc-[a-f0-9]+)"[^>]*>[\s\S]*?<[^>]+>([^<]{2,40})</gi,
  )) {
    fromSection.push({ id: match[1], name: match[2].trim() });
  }
  if (fromSection.length >= 4) return fromSection.slice(0, 4);

  // Fallback: course cards near recommended heading
  const cards = [
    ...slice.matchAll(/\/courses\/(gc-[a-f0-9]+)/gi),
  ].map((m) => m[1]);
  return [...new Set(cards)].slice(0, 4).map((id) => ({ id, name: "" }));
}

function extractLatestBlogSlugs(html, limit = 3) {
  const slugs = [
    ...html.matchAll(/href="\/blog\/([a-z0-9-]+)"/gi),
  ].map((m) => m[1]);
  return [...new Set(slugs)].slice(0, limit);
}

function extractCourseDetail(html) {
  const name =
    html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim() ||
    html.match(/"name"\s*:\s*"([^"]+)"/)?.[1] ||
    null;
  const address =
    html.match(/itemProp="address"[^>]*>([^<]+)/i)?.[1]?.trim() ||
    html.match(/"streetAddress"\s*:\s*"([^"]+)"/)?.[1] ||
    html.match(/주소[^<]*<\/[^>]+>\s*<[^>]+>([^<]+)/)?.[1]?.trim() ||
    null;
  const holes =
    html.match(/([0-9]{1,2})\s*홀/)?.[1] ||
    html.match(/"numberOfHoles"\s*:\s*([0-9]+)/)?.[1] ||
    null;
  const fee =
    html.match(/([0-9,]+)\s*원/)?.[1] ||
    html.match(/weekdayGreenFee[^0-9]*([0-9]+)/)?.[1] ||
    null;
  const jsonLdName = html.match(
    /"@type"\s*:\s*"GolfCourse"[\s\S]{0,400}?"name"\s*:\s*"([^"]+)"/,
  )?.[1];
  const jsonLdAddress = html.match(
    /"streetAddress"\s*:\s*"([^"]+)"/,
  )?.[1];
  const hasTel = /tel:|href="tel:/i.test(html);
  const hasMap = /map\.kakao|nmap\.|maps\.google|지도/i.test(html);
  const hasBooking = /예약|booking|teescanner|kakao\.com/i.test(html);
  return {
    name,
    address,
    holes: holes ? Number(holes) : null,
    fee,
    jsonLdName: jsonLdName || null,
    jsonLdAddress: jsonLdAddress || null,
    cta: { hasTel, hasMap, hasBooking },
  };
}

function extractCollectionTop(html, limit = 3) {
  const ids = [...html.matchAll(/\/courses\/(gc-[a-f0-9]+)/gi)].map(
    (m) => m[1],
  );
  return [...new Set(ids)].slice(0, limit);
}

function extractMapQuery(html) {
  const href =
    html.match(/href="(\/map\?[^"]*collection=near-seoul-beginner[^"]*)"/i)?.[1] ||
    html.match(/href="(\/map\?[^"]+)"/i)?.[1];
  return href || null;
}

function setEqual(a, b) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort().join("|");
  const sb = [...b].sort().join("|");
  return sa === sb;
}

const failures = [];
const report = { previewBase, productionBase, checks: {} };

function check(name, ok, detail) {
  report.checks[name] = { ok, detail };
  if (!ok) failures.push(`${name}: ${detail}`);
}

// --- Home ---
const [prodHome, prevHome] = await Promise.all([
  fetchText(productionBase, "/"),
  fetchText(previewBase, "/"),
]);
check("home.production.status", prodHome.status === 200, String(prodHome.status));
check("home.preview.status", prevHome.status === 200, String(prevHome.status));
check(
  "home.production.recommendedSection",
  prodHome.body.includes("추천 골프장"),
  "missing section",
);
check(
  "home.preview.recommendedSection",
  prevHome.body.includes("추천 골프장"),
  "missing section",
);

const prodRec = extractRecommendedNames(prodHome.body);
const prevRec = extractRecommendedNames(prevHome.body);
check(
  "home.preview.recommendedCount",
  prevRec.length === 4,
  `got ${prevRec.length}`,
);
check(
  "home.production.recommendedCount",
  prodRec.length === 4,
  `got ${prodRec.length}`,
);
if (prodRec.length === 4 && prevRec.length === 4) {
  const prodIds = prodRec.map((x) => x.id);
  const prevIds = prevRec.map((x) => x.id);
  check(
    "home.recommendedIdsEqual",
    setEqual(prodIds, prevIds),
    `prod=${prodIds.join(",")} prev=${prevIds.join(",")}`,
  );
}

const prodBlogs = extractLatestBlogSlugs(prodHome.body, 3);
const prevBlogs = extractLatestBlogSlugs(prevHome.body, 3);
check(
  "home.latestBlogsEqual",
  prodBlogs.length > 0 && setEqual(prodBlogs, prevBlogs),
  `prod=${prodBlogs.join(",")} prev=${prevBlogs.join(",")}`,
);

check(
  "home.preview.noindex",
  prevHome.robots.toLowerCase().includes("noindex"),
  prevHome.robots || "missing",
);
check(
  "home.preview.canonicalGolfmap",
  prevHome.body.includes("https://golfmap.kr"),
  "canonical origin missing",
);
check(
  "home.preview.noNextImageOptimizer",
  !prevHome.body.includes("/_next/image"),
  "found /_next/image",
);

// --- Map ---
const [prodMap, prevMap] = await Promise.all([
  fetchText(productionBase, "/map"),
  fetchText(previewBase, "/map"),
]);
check("map.production.status", prodMap.status === 200, String(prodMap.status));
check("map.preview.status", prevMap.status === 200, String(prevMap.status));

const prodCount = extractMapTotal(prodMap.body);
const prevCount = extractMapTotal(prevMap.body);
report.mapCounts = { production: prodCount, preview: prevCount, expected: EXPECTED_MAP_COUNT };

check("map.production.count", prodCount === EXPECTED_MAP_COUNT, String(prodCount));
check("map.preview.count", prevCount === EXPECTED_MAP_COUNT, String(prevCount));
check(
  "map.countsEqual",
  prodCount != null && prevCount != null && prodCount === prevCount,
  `prod=${prodCount} prev=${prevCount}`,
);
check("map.preview.notFallback90", prevCount !== 90, String(prevCount));

for (const name of FALLBACK_NAMES) {
  check(
    `map.preview.noFallback:${name}`,
    !prevMap.body.includes(name),
    "fallback name present",
  );
}

for (const id of KNOWN_IDS) {
  check(
    `map.preview.hasId:${id}`,
    prevMap.body.includes(id),
    "missing",
  );
  check(
    `map.production.hasId:${id}`,
    prodMap.body.includes(id),
    "missing",
  );
}

// --- Search ---
const searchPath = "/map?q=%EC%84%9C%EC%9A%B8";
const [prodSearch, prevSearch] = await Promise.all([
  fetchText(productionBase, searchPath),
  fetchText(previewBase, searchPath),
]);
check("search.production.status", prodSearch.status === 200, String(prodSearch.status));
check("search.preview.status", prevSearch.status === 200, String(prevSearch.status));
check(
  "search.preview.queryPreserved",
  prevSearch.url.includes("q=") || prevSearch.body.includes("서울"),
  "query not preserved",
);

// /map?q= is client-filtered; SSR HTML still embeds the full catalog.
// Compare catalog size via unique gc-* ids rather than a single "N곳" label
// (labels can differ by hydration/snippet order between hosts).
function uniqueGcIds(html) {
  const ids = html.match(/gc-[a-f0-9]{12}/gi) || [];
  return new Set(ids.map((id) => id.toLowerCase()));
}
const prodSearchIds = uniqueGcIds(prodSearch.body);
const prevSearchIds = uniqueGcIds(prevSearch.body);
check(
  "search.catalogSizeNearEqual",
  prodSearchIds.size >= 500 &&
    prevSearchIds.size >= 500 &&
    Math.abs(prodSearchIds.size - prevSearchIds.size) <= 5,
  `prod=${prodSearchIds.size} prev=${prevSearchIds.size}`,
);
check(
  "search.preview.hasSeoul",
  /서울/.test(prevSearch.body),
  "no 서울 marker",
);
check(
  "search.production.hasSeoul",
  /서울/.test(prodSearch.body),
  "no 서울 marker",
);

// --- Collection ---
const collectionPath = "/collections/near-seoul-beginner";
const [prodCol, prevCol] = await Promise.all([
  fetchText(productionBase, collectionPath),
  fetchText(previewBase, collectionPath),
]);
check("collection.production.status", prodCol.status === 200, String(prodCol.status));
check("collection.preview.status", prevCol.status === 200, String(prevCol.status));

const prodTop = extractCollectionTop(prodCol.body, 3);
const prevTop = extractCollectionTop(prevCol.body, 3);
check(
  "collection.top3Equal",
  prodTop.length === 3 && setEqual(prodTop, prevTop),
  `prod=${prodTop.join(",")} prev=${prevTop.join(",")}`,
);

const prodMapHref = extractMapQuery(prodCol.body);
const prevMapHref = extractMapQuery(prevCol.body);
check(
  "collection.mapQueryEqual",
  Boolean(prodMapHref && prevMapHref && prodMapHref === prevMapHref),
  `prod=${prodMapHref} prev=${prevMapHref}`,
);

// --- Course details ---
for (const id of KNOWN_IDS) {
  const path = `/courses/${id}`;
  const [prodCourse, prevCourse] = await Promise.all([
    fetchText(productionBase, path),
    fetchText(previewBase, path),
  ]);
  check(`course.${id}.production.status`, prodCourse.status === 200, String(prodCourse.status));
  check(`course.${id}.preview.status`, prevCourse.status === 200, String(prevCourse.status));

  const p = extractCourseDetail(prodCourse.body);
  const v = extractCourseDetail(prevCourse.body);
  check(`course.${id}.nameEqual`, Boolean(p.name) && p.name === v.name, `${p.name} vs ${v.name}`);
  if (p.address && v.address) {
    check(`course.${id}.addressEqual`, p.address === v.address, `${p.address} vs ${v.address}`);
  }
  if (p.holes != null && v.holes != null) {
    check(`course.${id}.holesEqual`, p.holes === v.holes, `${p.holes} vs ${v.holes}`);
  }
  if (p.fee && v.fee) {
    check(`course.${id}.feeEqual`, p.fee === v.fee, `${p.fee} vs ${v.fee}`);
  }
  if (p.jsonLdName && v.jsonLdName) {
    check(
      `course.${id}.jsonLdNameEqual`,
      p.jsonLdName === v.jsonLdName,
      `${p.jsonLdName} vs ${v.jsonLdName}`,
    );
  }
  check(
    `course.${id}.ctaTypesEqual`,
    p.cta.hasTel === v.cta.hasTel &&
      p.cta.hasMap === v.cta.hasMap &&
      p.cta.hasBooking === v.cta.hasBooking,
    JSON.stringify({ prod: p.cta, prev: v.cta }),
  );
}

// --- Blog ---
const [prodBlog, prevBlog] = await Promise.all([
  fetchText(productionBase, "/blog"),
  fetchText(previewBase, "/blog"),
]);
check("blog.production.status", prodBlog.status === 200, String(prodBlog.status));
check("blog.preview.status", prevBlog.status === 200, String(prevBlog.status));

const tournamentSlugMatch = prodBlog.body.match(
  /href="\/blog\/(20[0-9]{2}-[a-z0-9-]+|[^"]*tournament[^"]*|[^"]*kpga[^"]*|[^"]*klpga[^"]*)"/i,
);
const tournamentPath = tournamentSlugMatch
  ? `/blog/${tournamentSlugMatch[1]}`
  : null;
if (tournamentPath) {
  const [prodT, prevT] = await Promise.all([
    fetchText(productionBase, tournamentPath),
    fetchText(previewBase, tournamentPath),
  ]);
  check("blog.tournament.production.status", prodT.status === 200, String(prodT.status));
  check("blog.tournament.preview.status", prevT.status === 200, String(prevT.status));
  check(
    "blog.tournament.preview.hasImage",
    /<img\s/i.test(prevT.body) || /background-image/i.test(prevT.body),
    "no image markup",
  );
}

// --- Secret leakage (preview HTML + a sample JS chunk if present) ---
const secretPatterns = [
  /service_role/i,
  /SUPABASE_SERVICE_ROLE/i,
  /eyJhbGciOiJ[^"]{80,}/, // long JWT-looking tokens in HTML (heuristic)
];
for (const pattern of secretPatterns) {
  if (pattern.source.includes("eyJ") && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // anon JWT may appear if mistakenly inlined into HTML attributes — flag only service_role label
    continue;
  }
  check(
    `security.preview.noPattern:${pattern}`,
    !pattern.test(prevHome.body) && !pattern.test(prevMap.body),
    "matched",
  );
}
check(
  "security.preview.noServiceRoleLabel",
  !/service[_-]?role/i.test(prevHome.body + prevMap.body),
  "service role mention",
);
check(
  "security.preview.noFallbackModeLabel",
  !/fallback mode|mock courses|GOLFMAP_DATA_MODE/i.test(prevHome.body + prevMap.body),
  "internal mode label exposed",
);

console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  console.error(`\n${failures.length} parity check(s) failed:`);
  for (const line of failures) console.error(`- ${line}`);
  process.exit(1);
}
console.log("\ncf:data-parity OK");
