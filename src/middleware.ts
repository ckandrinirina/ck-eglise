import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18nConfig } from "./lib/i18n/config";

export function middleware(request: NextRequest) {
  // Get pathname from request
  const pathname = request.nextUrl.pathname;

  // Skip middleware for api routes and static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if the pathname has a locale
  const pathnameHasLocale = i18nConfig.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (!pathnameHasLocale) {
    // Get locale from cookie or default to config
    const locale =
      request.cookies.get("NEXT_LOCALE")?.value || i18nConfig.defaultLocale;

    // If pathname is root, redirect to locale root
    if (pathname === "/") {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    // Redirect to add locale to pathname
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
