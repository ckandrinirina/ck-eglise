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
import {
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-primary" />
          {t("summary")}
        </CardTitle>
        <CardDescription>
          {startDate && endDate
            ? t("filterByDate")
            : t("transactionsDescription")}
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="text-red-500">Error loading summary</div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Hash className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">
                  {t("totalTransactions")}
                </span>
              </div>
              <span className="font-bold text-lg">{summary.count}</span>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">{t("totalCredits")}</span>
              </div>
              <span className="font-bold text-lg text-green-600">
                {formatAmount(summary.credit)}
              </span>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mr-3">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm font-medium">{t("totalDebits")}</span>
              </div>
              <span className="font-bold text-lg text-red-600">
                {formatAmount(summary.debit)}
              </span>
            </div>

            <div className="bg-primary/5 p-3 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{t("netAmount")}</span>
              </div>
              <span
                className={`font-bold text-lg ${
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
