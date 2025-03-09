/**
 * @component SiteBalance
 * @description Component for displaying the current site balance
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

/**
 * SiteBalance component for displaying the current account balance
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
    ? format(updatedAt, "PPP 'à' HH:mm", { locale: fr })
    : null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>{t("currentBalance")}</CardTitle>
        {updatedAt && (
          <CardDescription>
            {t("balanceUpdated")}: {formattedDate}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-12 w-32" />
        ) : isError ? (
          <div className="text-red-500">Error loading balance</div>
        ) : (
          <div
            className={`text-3xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formattedBalance}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
