/**
 * @file Transactions layout
 * @description Layout and metadata for transactions page
 */

import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

/**
 * Generate metadata for the transactions page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: "finance",
  });

  return {
    title: t("transactionsMetaTitle"),
    description: t("transactionsMetaDescription"),
  } as Metadata;
}

/**
 * TransactionsLayout component
 */
export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
