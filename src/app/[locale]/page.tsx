"use client";

import { useTranslation } from "react-i18next";
import { Suspense } from "react";

const HomeContent = () => {
  const { t, ready } = useTranslation("common");

  if (!ready) {
    return (
      <main className="container mx-auto p-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="h-6 w-96 bg-gray-200 rounded animate-pulse"></div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">{t("home.welcome")}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        {t("home.description")}
      </p>
    </main>
  );
};

const Home = () => {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto p-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse"></div>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
};

export default Home;
