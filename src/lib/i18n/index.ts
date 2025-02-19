// This file is now moved to src/i18n/request.ts
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { i18nConfig, Locale } from "./config";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!i18nConfig.locales.includes(locale as Locale)) notFound();

  return {
    messages: await import(`../../../public/locales/${locale}/common.json`),
  };
});
