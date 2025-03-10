/**
 * @component BalanceChart
 * @description Component for displaying the balance evolution chart
 */

import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useBalanceHistory } from "@/hooks/finance/useBalanceHistory";
import { useSiteBalance } from "@/hooks/finance/useSiteBalance";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface BalanceChartProps {
  limit?: number;
}

/**
 * Type for tooltip props
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      date: string;
      amount: number;
    };
  }>;
}

/**
 * Custom tooltip component for the balance chart
 */
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  const t = useTranslations("finance");
  const { formatAmount } = useSiteBalance();

  if (active && payload && payload.length > 0) {
    const dateValue = payload[0]?.payload?.date;
    const formattedDate = dateValue
      ? format(parseISO(dateValue), t("dateTimeFormat"), { locale: fr })
      : "";

    return (
      <div className="bg-background border rounded-md p-2 shadow-md">
        <p className="text-sm font-medium">{formattedDate}</p>
        <p className="text-sm">
          <span className="font-medium">{t("balance")}: </span>
          <span
            className={
              payload[0]?.value >= 0 ? "text-green-600" : "text-red-600"
            }
          >
            {formatAmount(payload[0]?.value || 0)}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

/**
 * BalanceChart component for displaying the balance evolution over time
 */
export const BalanceChart = ({ limit = 30 }: BalanceChartProps) => {
  const t = useTranslations("finance");
  const queryClient = useQueryClient();
  const { history, isLoading, isError } = useBalanceHistory({ limit });
  const { formatAmount } = useSiteBalance();

  // Refresh data when component mounts or dependencies change
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["balanceHistory", limit] });
  }, [queryClient, limit]);

  // Format dates for display on X-axis
  const formatXAxis = (dateString: string) => {
    if (!dateString) return "";
    const date = parseISO(dateString);
    return format(date, "dd/MM", { locale: fr });
  };

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  if (isError) {
    return (
      <div className="text-red-500 h-[200px] flex items-center justify-center">
        {t("errorLoadingHistory")}
      </div>
    );
  }

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={history}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis
            tickFormatter={(value) => `${formatAmount(value).split(",")[0]}`}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#16a34a"
            strokeWidth={2}
            fill="url(#balanceGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
