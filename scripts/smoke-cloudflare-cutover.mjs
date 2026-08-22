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
const expectedMapCount = Number(process.env.EXPECTED_MAP_COUNT || "532");

if (!Number.isInteger(expectedMapCount) || expectedMapCount <= 0) {
  console.error(
    `cf:cutover-smoke: invalid EXPECTED_MAP_COUNT=${process.env.EXPECTED_MAP_COUNT}`,
  );
  process.exit(1);
}

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

function containsCourseId(html) {
  return /gc-[a-f0-9]{12}/i.test(html);
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
    if (containsCourseId(body)) {
      errors.push("initial course catalog present");
    }
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

// PR #30: /map starts without the course catalog and loads its narrow DTOs
// from this API. Keep the Production dataset expectation configurable through
// the same EXPECTED_MAP_COUNT convention used by the parity smoke.
{
  const pathname = "/api/map/courses";
  const { response, body, type } = await fetchOnce(
    `${productionBase}${pathname}`,
    { redirect: "follow" },
  );
  const errors = [];
  let courses = null;

  if (response.status !== 200) {
    errors.push(`status=${response.status}`);
  }
  if (!type.includes("json")) {
    errors.push(`content-type=${type || "missing"}`);
  }

  try {
    courses = JSON.parse(body);
  } catch {
    errors.push("invalid JSON");
  }

  if (courses !== null && !Array.isArray(courses)) {
    errors.push("JSON root is not an array");
  }

  if (Array.isArray(courses)) {
    if (courses.length !== expectedMapCount) {
      errors.push(
        `courseCount=${courses.length} expected=${expectedMapCount}`,
      );
    }

    const ids = courses.map((course) => course?.id);
    const validIds = ids.filter(
      (id) => typeof id === "string" && id.length > 0,
    );
    if (validIds.length !== courses.length) {
      errors.push(`invalidIds=${courses.length - validIds.length}`);
    }

    const duplicateCount = validIds.length - new Set(validIds).size;
    if (duplicateCount > 0) {
      errors.push(`duplicateIds=${duplicateCount}`);
    }
  }

  rows.push({
    pathname,
    status: response.status,
    server: response.headers.get("server") || "",
    cfRay: Boolean(response.headers.get("cf-ray")),
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
