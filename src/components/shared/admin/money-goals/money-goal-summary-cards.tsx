/**
 * @component MoneyGoalSummaryCards
 * @description Summary cards displaying money goal statistics
 *
 * @param {MoneyGoalFilters} filters - Filters to apply to summary data
 * @returns {JSX.Element} Summary cards component
 */

"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { MoneyGoalFilters } from "@/types/money-goals";
import { useMoneyGoalSummary } from "@/hooks/money-goals/useMoneyGoalSummary";

interface MoneyGoalSummaryCardsProps {
  filters?: MoneyGoalFilters;
}

export const MoneyGoalSummaryCards = ({
  filters,
}: MoneyGoalSummaryCardsProps) => {
  const t = useTranslations("admin.money_goals");
  const { data: summary, isLoading, error } = useMoneyGoalSummary(filters);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-2" />
              <Skeleton className="h-4 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              {t("summary.error")}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("summary.total_goals")}
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalGoals}</div>
          <div className="text-xs text-muted-foreground">
            {summary.activeGoals} {t("summary.active")} •{" "}
            {summary.completedGoals} {t("summary.completed")}
          </div>
        </CardContent>
      </Card>

      {/* Total Target Amount */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("summary.target_amount")}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalTargetAmount)}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("summary.across_all_goals")}
          </div>
        </CardContent>
      </Card>

      {/* Total Reached Amount */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("summary.reached_amount")}
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalReachedAmount)}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("summary.total_contributions")}
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("summary.overall_progress")}
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.overallProgress.toFixed(1)}%
          </div>
          <div className="mt-2">
            <Progress value={summary.overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
