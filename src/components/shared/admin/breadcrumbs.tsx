"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const getLocaleIndependentSegments = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  // Remove locale segment (first segment)
  return segments.slice(1);
};

const getLocale = (pathname: string) => {
  const segments = pathname.split("/");
  return segments[1] || "fr"; // Default to 'fr' if no locale found
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const segments = getLocaleIndependentSegments(pathname);
  const t = useTranslations("admin");

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-1 text-sm text-muted-foreground"
    >
      <Link
        href={`/${locale}/admin`}
        className="flex items-center hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        // Build path including all segments up to current one
        const path = `/${locale}/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        // Try to get translation for this segment, fallback to capitalized segment name
        const translationKey = `${segment}.title`;
        const label = t.has(translationKey)
          ? t(translationKey)
          : segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <span key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="ml-1 font-medium text-foreground">{label}</span>
            ) : (
              <Link href={path} className="ml-1 hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
