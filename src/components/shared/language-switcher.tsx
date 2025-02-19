"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { Suspense } from "react";

const LanguageSwitcherContent = () => {
  const { t, i18n, ready } = useTranslation("common");
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = async (locale: Locale) => {
    const currentPathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
    await i18n.changeLanguage(locale);
    router.push(`/${locale}${currentPathWithoutLocale}`);
  };

  if (!ready) {
    return (
      <div className="flex gap-2">
        {i18nConfig.locales.map((locale) => (
          <Button key={locale} variant="ghost" size="sm" disabled>
            {locale.toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {i18nConfig.locales.map((locale) => (
        <Button
          key={locale}
          variant="ghost"
          size="sm"
          onClick={() => switchLanguage(locale)}
          className={i18n.language === locale ? "bg-secondary" : ""}
        >
          {t(`language.${locale}`)}
        </Button>
      ))}
    </div>
  );
};

export const LanguageSwitcher = () => {
  return (
    <Suspense
      fallback={
        <div className="flex gap-2">
          {i18nConfig.locales.map((locale) => (
            <Button key={locale} variant="ghost" size="sm" disabled>
              {locale.toUpperCase()}
            </Button>
          ))}
        </div>
      }
    >
      <LanguageSwitcherContent />
    </Suspense>
  );
};
