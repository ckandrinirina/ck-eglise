"use client";

/**
 * @file Transactions page
 * @description Page for managing financial transactions
 */

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import TransactionsList from "@/components/shared/finance/transactions-list";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * TransactionsPage component for displaying the transactions management page
 */
const TransactionsPage = () => {
  const t = useTranslations("finance");

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("transactionsPageTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("transactionsPageDescription")}
          </p>
        </div>

        <Suspense fallback={<TransactionsListSkeleton />}>
          <TransactionsList />
        </Suspense>
      </div>
    </div>
  );
};

/**
 * TransactionsListSkeleton component for displaying a loading state
 */
const TransactionsListSkeleton = () => {
  return (
    <div className="rounded-md border p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-2/4" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      <div className="space-y-2">
        {Array(5)
          .fill(null)
          .map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
      </div>
    </div>
  );
};

export default TransactionsPage;
