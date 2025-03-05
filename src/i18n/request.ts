import { getRequestConfig } from "next-intl/server";
import { i18nConfig, Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export default getRequestConfig(async () => {
  // Get the locale from the request using the headers API
  const headersList = await headers();
  const requestLocale = headersList.get("X-NEXT-INTL-LOCALE") as Locale;

  if (!i18nConfig.locales.includes(requestLocale)) notFound();

  // Load both common and finance translation files
  const [commonMessages, financeMessages] = await Promise.all([
    import(`../../public/locales/${requestLocale}/common.json`).then(
      (module) => module.default,
    ),
    import(`../../public/locales/${requestLocale}/finance.json`)
      .then((module) => module.default)
      .catch(() => ({})), // Fallback to empty object if finance translations don't exist
  ]);

  return {
    locale: requestLocale,
    messages: {
      ...commonMessages,
      finance: financeMessages,
    },
    timeZone: "Indian/Antananarivo",
  };
});
