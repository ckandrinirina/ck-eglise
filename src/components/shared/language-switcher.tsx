"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { Suspense } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="fixed right-4 top-2 z-[99999] shadow-lg bg-background/80 backdrop-blur-sm"
      >
        <Image
          src={`/flags/${i18nConfig.defaultLocale}.svg`}
          alt={i18nConfig.defaultLocale}
          width={20}
          height={15}
        />
      </Button>
    );
  }

  return (
    <div className="fixed top-2 right-4 z-[99999]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shadow-lg hover:bg-secondary/90 bg-background/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200"
          >
            <Image
              src={`/flags/${i18n.language}.svg`}
              alt={i18n.language}
              width={20}
              height={15}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[120px] bg-background/95 backdrop-blur-sm"
        >
          {i18nConfig.locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => switchLanguage(locale)}
              className={`flex items-center gap-2 ${i18n.language === locale ? "bg-secondary/80" : ""}`}
            >
              <Image
                src={`/flags/${locale}.svg`}
                alt={locale}
                width={20}
                height={15}
              />
              {t(`language.${locale}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const LanguageSwitcher = () => {
  return (
    <Suspense
      fallback={
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="fixed right-4 top-2 z-[99999] shadow-lg bg-background/80 backdrop-blur-sm"
        >
          <Image
            src={`/flags/${i18nConfig.defaultLocale}.svg`}
            alt={i18nConfig.defaultLocale}
            width={20}
            height={15}
          />
        </Button>
      }
    >
      <LanguageSwitcherContent />
    </Suspense>
  );
};
