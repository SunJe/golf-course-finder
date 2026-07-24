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

  if (type.includes("text/html")) {
    if (!robots.toLowerCase().includes("noindex")) {
      errors.push("missing noindex header");
    }
    if (!body.includes(productionOrigin)) {
      errors.push("production canonical/origin missing");
    }
    if (body.includes("/_next/image")) {
      errors.push("unexpected /_next/image");
    }
    if (/internal server error|application error|worker exceeded/i.test(body)) {
      errors.push("runtime error text");
    }
  }

  return { pathname, status: response.status, robots, errors };
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

