import { NextResponse, type NextRequest } from "next/server";

/**
 * Preview-only robots header for workers.dev.
 * Production hosts (golfmap.kr) must never receive noindex.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const hostname = request.nextUrl.hostname.toLowerCase();

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
