/**
 * @component TransactionSummary
 * @description Component for displaying transaction summary statistics
 */

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionSummary } from "@/hooks/finance/useTransactionSummary";
import { useSiteBalance } from "@/hooks/finance/useSiteBalance";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface TransactionSummaryProps {
  startDate?: string;
  endDate?: string;
}

/**
 * TransactionSummary component for displaying transaction statistics
 */
export const TransactionSummary = ({
  startDate,
  endDate,
}: TransactionSummaryProps) => {
  const t = useTranslations("finance");
  const queryClient = useQueryClient();
  const { summary, isLoading, isError } = useTransactionSummary({
    startDate,
    endDate,
  });
  const { formatAmount } = useSiteBalance();

  // Refresh data when component mounts
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["transactionSummary", startDate, endDate],
    });
  }, [queryClient, startDate, endDate]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>{t("summary")}</CardTitle>
        <CardDescription>
          {startDate && endDate
            ? t("filterByDate")
            : t("transactionsDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
        ) : isError ? (
          <div className="text-red-500">Error loading summary</div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span>{t("totalTransactions")}</span>
              <span className="font-medium">{summary.count}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span>{t("totalCredits")}</span>
              <span className="font-medium text-green-600">
                {formatAmount(summary.credit)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span>{t("totalDebits")}</span>
              <span className="font-medium text-red-600">
                {formatAmount(summary.debit)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold">{t("netAmount")}</span>
              <span
                className={`font-bold ${
                  summary.total >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatAmount(summary.total)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
