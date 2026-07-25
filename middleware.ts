import { NextResponse, type NextRequest } from "next/server";

/**
 * - workers.dev: preview-only noindex
 * - www.golfmap.kr → https://golfmap.kr (308, path/query preserved)
 * Production apex must never receive noindex.
 */
export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();

  if (hostname === "www.golfmap.kr") {
    const url = request.nextUrl.clone();
    url.hostname = "golfmap.kr";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next();

  if (hostname.endsWith(".workers.dev")) {
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive",
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
