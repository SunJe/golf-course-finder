/**
 * Production cutover smoke for https://golfmap.kr (and optional www checks).
 * Env:
 *   PRODUCTION_URL (default https://golfmap.kr)
 *   WWW_URL (default https://www.golfmap.kr)
 */
const productionBase = (
  process.env.PRODUCTION_URL || "https://golfmap.kr"
).replace(/\/$/, "");
const wwwBase = (process.env.WWW_URL || "https://www.golfmap.kr").replace(
  /\/$/,
  "",
);

const paths = [
  "/",
  "/map",
  "/map?q=%EC%84%9C%EC%9A%B8",
  "/map?tag=beginner&view=list",
  "/collections/near-seoul-beginner",
  "/courses/gc-9d709ff43c33",
  "/courses/gc-437ea8156737",
  "/courses/gc-60319bf1693c",
  "/blog",
  "/robots.txt",
  "/sitemap.xml",
];

const ua = { "user-agent": "GolfMapCloudflareCutoverSmoke/1.0" };
const failures = [];
const rows = [];

async function fetchOnce(url, { redirect = "manual" } = {}) {
  const response = await fetch(url, { headers: ua, redirect });
  const type = response.headers.get("content-type") || "";
  const body =
    type.includes("text/") || type.includes("json")
      ? await response.text()
      : "";
  return { response, body, type };
}

function extractMapTotal(html) {
  const match = html.match(/전체 골프장[^0-9]*([0-9]{2,4})곳/);
  if (match) return Number(match[1]);
  const ids = html.match(/gc-[a-f0-9]{12}/gi) || [];
  return new Set(ids.map((x) => x.toLowerCase())).size || null;
}

for (const pathname of paths) {
  const url = `${productionBase}${pathname}`;
  const { response, body, type } = await fetchOnce(url, {
    redirect: "follow",
  });
  const errors = [];
  const server = response.headers.get("server") || "";
  const robots = response.headers.get("x-robots-tag") || "";
  const cfRay = response.headers.get("cf-ray") || "";

  if (response.status < 200 || response.status >= 400) {
    errors.push(`status=${response.status}`);
  }
  if (type.includes("text/html")) {
    if (robots.toLowerCase().includes("noindex")) {
      errors.push("production noindex");
    }
    if (!body.includes("https://golfmap.kr")) {
      errors.push("canonical/origin missing");
    }
    if (body.includes("/_next/image")) {
      errors.push("/_next/image present");
    }
  }
  if (pathname === "/map") {
    const count = extractMapTotal(body);
    if (count !== 532) errors.push(`mapCount=${count}`);
    if (body.includes("강남 센트럴 골프클럽")) {
      errors.push("fallback mock present");
    }
  }
  if (pathname === "/") {
    if (!body.includes("추천 골프장")) errors.push("recommended missing");
  }

  rows.push({
    pathname,
    status: response.status,
    server,
    cfRay: Boolean(cfRay),
    errors: errors.join("; "),
  });
  if (errors.length) failures.push(`${pathname}: ${errors.join("; ")}`);
}

// www redirects
const wwwCases = ["/", "/map?q=%EC%84%9C%EC%9A%B8"];
for (const pathname of wwwCases) {
  const { response } = await fetchOnce(`${wwwBase}${pathname}`, {
    redirect: "manual",
  });
  const location = response.headers.get("location") || "";
  const ok =
    (response.status === 301 || response.status === 308) &&
    location.startsWith("https://golfmap.kr") &&
    (pathname === "/"
      ? location === "https://golfmap.kr/" || location === "https://golfmap.kr"
      : location.includes("/map?q="));
  rows.push({
    pathname: `www${pathname}`,
    status: response.status,
    server: response.headers.get("server") || "",
    cfRay: Boolean(response.headers.get("cf-ray")),
    errors: ok ? "" : `bad redirect location=${location}`,
  });
  if (!ok) {
    failures.push(`www${pathname}: status=${response.status} location=${location}`);
  }
}

console.table(rows);
if (failures.length) {
  console.error(`${failures.length} cutover smoke failure(s)`);
  for (const line of failures) console.error(`- ${line}`);
  process.exit(1);
}
console.log("cf:cutover-smoke OK");
