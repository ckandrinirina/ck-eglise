import { getRequestConfig } from "next-intl/server";
import { i18nConfig, Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export default getRequestConfig(async () => {
  // Get the locale from the request using the headers API
  const headersList = await headers();
  const requestLocale = headersList.get("X-NEXT-INTL-LOCALE") as Locale;
  if (!i18nConfig.locales.includes(requestLocale)) notFound();

  return {
    locale: requestLocale,
    messages: (
      await import(`../../public/locales/${requestLocale}/common.json`)
    ).default,
    timeZone: "Indian/Antananarivo",
  };
});
