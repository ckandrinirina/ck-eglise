import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import I18nProvider from "@/components/shared/i18n-provider";
import { i18nConfig } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  return {
    title: "CK Eglise",
    description:
      params.locale === "fr"
        ? "Application de gestion d'église"
        : params.locale === "mg"
          ? "Rindran-draharaha fitantanana fiangonana"
          : "Church Management Application",
  };
}

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

const LocaleLayout = ({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) => {
  if (!i18nConfig.locales.includes(locale)) {
    return null; // This will trigger a 404
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <I18nProvider locale={locale}>
          <header className="p-4 border-b">
            <nav className="flex justify-between items-center max-w-7xl mx-auto">
              <LanguageSwitcher />
            </nav>
          </header>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
