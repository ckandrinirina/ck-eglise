/**
 * @component SiteBalance
 * @description Component for displaying the current site balance with a chart
 */

import { useSiteBalance } from "@/hooks/finance/useSiteBalance";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TrendingUp, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BalanceChart } from "@/components/shared/finance/balance-chart";

/**
 * SiteBalance component for displaying the current account balance with a chart
 */
export const SiteBalance = () => {
  const t = useTranslations("finance");
  const queryClient = useQueryClient();
  const { balance, formattedBalance, updatedAt, isLoading, isError } =
    useSiteBalance();

  // Refresh data when component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["siteBalance"] });
  }, [queryClient]);

  // Format date if available
  const formattedDate = updatedAt
    ? format(updatedAt, t("dateTimeFormat"), { locale: fr })
    : null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            {t("currentBalance")}
          </CardTitle>
          {updatedAt && (
            <CardDescription>
              {t("balanceUpdated")}: {formattedDate}
            </CardDescription>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-12 w-36" />
        ) : isError ? (
          <div className="text-red-500">{t("error")}</div>
        ) : (
          <div
            className={`text-3xl font-bold flex items-center ${
              balance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {balance >= 0 ? (
              <ArrowUpCircle className="h-6 w-6 mr-2" />
            ) : (
              <ArrowDownCircle className="h-6 w-6 mr-2" />
            )}
            {formattedBalance}
          </div>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="mt-2">
          <h3 className="text-sm font-medium mb-1">{t("balanceEvolution")}</h3>
          <BalanceChart limit={30} />
        </div>
      </CardContent>
    </Card>
  );
};
