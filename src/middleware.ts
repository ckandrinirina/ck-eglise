import createMiddleware from "next-intl/middleware";
import { i18nConfig } from "@/lib/i18n/config";

// Localization middleware with cookie support
export default createMiddleware({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api routes
    // - /_next (Next.js internals)
    // - /static (public files)
    // - /_vercel (Vercel internals)
    // - /favicon.ico, /robots.txt, etc.
    "/((?!api|_next|_vercel|static|flags|[\\w-]+\\.\\w+).*)",
  ],
};
