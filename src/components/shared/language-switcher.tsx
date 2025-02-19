"use client";
import { useRouter, usePathname } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { Suspense } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcherContent = ({
  variant = "fixed",
}: {
  variant?: "fixed" | "inline";
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale() as Locale;

  const switchLanguage = (locale: Locale) => {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
    router.replace(pathname, { locale });
  };

  return (
    <div className={variant === "fixed" ? "fixed top-2 right-4 z-[99999]" : ""}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`${variant === "fixed" ? "shadow-lg" : ""} hover:bg-secondary/90 bg-background/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200`}
          >
            <Image
              src={`/flags/${currentLocale}.svg`}
              alt={currentLocale}
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
              className={`flex items-center gap-2 ${currentLocale === locale ? "bg-secondary/80" : ""}`}
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

export const LanguageSwitcher = ({
  variant,
}: {
  variant?: "fixed" | "inline";
}) => {
  return (
    <Suspense
      fallback={
        <Button
          variant="ghost"
          size="icon"
          disabled
          className={
            variant === "fixed"
              ? "fixed right-4 top-2 z-[99999] shadow-lg bg-background/80 backdrop-blur-sm"
              : ""
          }
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
      <LanguageSwitcherContent variant={variant} />
    </Suspense>
  );
};
