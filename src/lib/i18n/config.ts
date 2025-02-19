export const i18nConfig = {
  defaultLocale: "fr",
  locales: ["en", "fr", "mg"],
  defaultNS: "common",
  localesToTry: ["en", "fr", "mg"],
} as const;

export type Locale = (typeof i18nConfig)["locales"][number];

export const getLocalePartsFrom = ({ pathname }: { pathname: string }) => {
  const pathnameParts = pathname.split("/");
  const isDefaultLocale = i18nConfig.locales.includes(pathnameParts[1]);
  const locale = isDefaultLocale ? pathnameParts[1] : i18nConfig.defaultLocale;
  return { locale, pathname };
};
