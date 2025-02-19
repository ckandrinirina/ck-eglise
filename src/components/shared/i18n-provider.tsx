"use client";

import { I18nextProvider } from "react-i18next";
import i18next from "@/lib/i18n/client";
import { useEffect, useState } from "react";

export default function I18nProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      if (!i18next.isInitialized) {
        await i18next.init();
      }
      await i18next.changeLanguage(locale);
      setIsInitialized(true);
    };

    initializeI18n();
  }, [locale]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
