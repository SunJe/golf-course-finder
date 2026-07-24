const base = process.env.CF_PREVIEW_URL?.replace(/\/$/, "");
if (!base) {
  console.error("Set CF_PREVIEW_URL");
  process.exit(1);
}

const productionOrigin = "https://golfmap.kr";
const paths = [
  "/",
  "/map",
  "/map?q=%EC%84%9C%EC%9A%B8",
  "/map?tag=beginner&view=list",
  "/collections/near-seoul-beginner",
  "/blog",
  "/robots.txt",
  "/sitemap.xml"
];

async function inspect(pathname) {
  const maxAttempts = 3;
  let last = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(`${base}${pathname}`, {
      redirect: "manual",
      headers: { "user-agent": "GolfMapCloudflareSmoke/1.0" }
    });

    const type = response.headers.get("content-type") || "";
    const robots = response.headers.get("x-robots-tag") || "";
    const body = type.includes("text/") ? await response.text() : "";
    const errors = [];

    if (response.status < 200 || response.status >= 400) {
      errors.push(`status=${response.status}`);
    }

    if (type.includes("text/html") || pathname === "/robots.txt" || pathname === "/sitemap.xml") {
      if (type.includes("text/html") && !robots.toLowerCase().includes("noindex")) {
        errors.push("missing noindex header");
      }
      if (type.includes("text/html") && !body.includes(productionOrigin)) {
        errors.push("production canonical/origin missing");
      }
      if (body.includes("/_next/image")) {
        errors.push("unexpected /_next/image");
      }
      if (/internal server error|application error|worker exceeded/i.test(body)) {
        errors.push("runtime error text");
      }
    }

    last = { pathname, status: response.status, robots, errors };
    const retryable =
      response.status === 503 ||
      errors.some((e) => e.includes("503") || e.includes("worker exceeded"));
    if (!retryable || attempt === maxAttempts) break;
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }
  return last;
}

const results = [];
for (const pathname of paths) results.push(await inspect(pathname));

console.table(results.map((item) => ({
  pathname: item.pathname,
  status: item.status,
  robots: item.robots,
  errors: item.errors.join("; ")
})));

if (results.some((item) => item.errors.length)) process.exit(1);

