import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { i18nConfig } from "@/lib/i18n/config";

// This function handles authentication checks
const withAuth = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  // Special handling for API auth error routes to prevent rendering issues
  if (pathname.includes("/api/auth/error")) {
    const locale = pathname.split("/")[1] || i18nConfig.defaultLocale;
    const url = new URL(`/${locale}/auth/login`, request.url);

    // Preserve error information in search params
    const errorType = new URL(request.url).searchParams.get("error");
    if (errorType) {
      url.searchParams.set("error", errorType);
    }

    return NextResponse.redirect(url);
  }

  const isApiRoute = pathname.startsWith("/api/");
  const isAuthRoute = pathname.includes("/auth/") && !isApiRoute;
  const isAdminRoute = pathname.includes("/admin/");

  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // Allow all API routes to pass through without localization redirection
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    const locale = pathname.split("/")[1] || i18nConfig.defaultLocale;
    const url = new URL(`/${locale}/admin`, request.url);
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users away from protected pages to login
  if (isAdminRoute && !token) {
    const locale = pathname.split("/")[1] || i18nConfig.defaultLocale;
    const url = new URL(`/${locale}/auth/login`, request.url);
    // Save the original URL as a search parameter for post-login redirection
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

// Custom middleware creator that excludes API routes from locale handling
const createLocalizationMiddleware = () => {
  const i18nMiddleware = createMiddleware({
    locales: i18nConfig.locales,
    defaultLocale: i18nConfig.defaultLocale,
    localePrefix: "always",
    localeDetection: true,
  });

  return (request: NextRequest) => {
    // Don't apply i18n middleware to API routes
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Apply i18n middleware to non-API routes
    return i18nMiddleware(request);
  };
};

// Get the i18n middleware
const localizationMiddleware = createLocalizationMiddleware();

// Combine auth and i18n middleware
export default function middleware(request: NextRequest) {
  // First check authentication
  const authResponse = withAuth(request);

  // If we got a redirect response from auth middleware, return that
  if (authResponse instanceof NextResponse && authResponse.status !== 200) {
    return authResponse;
  }

  // Otherwise, continue with i18n middleware (which will skip API routes)
  return localizationMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /_next (Next.js internals)
    // - /static (public files)
    // - /_vercel (Vercel internals)
    // - /favicon.ico, /robots.txt, etc.
    // Note: We include all API routes to intercept auth error routes
    "/((?!_next|_vercel|static|flags).*)",
  ],
};
