import type { Pathnames } from "next-intl/navigation";
import { createLocalizedPathnamesNavigation } from "next-intl/navigation";
import { i18nConfig } from "./config";

const routes = {
  "/": "/",
  "/auth/login": "/auth/login",
} as const;

export const pathnames: Pathnames<typeof routes> = routes;

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({
    locales: i18nConfig.locales,
    pathnames,
  });
