import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface CardStatsProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    timeframe: string;
  };
  icon?: LucideIcon;
  className?: string;
}

export function CardStats({
  title,
  value,
  change,
  icon: Icon,
  className,
}: CardStatsProps) {
  const isPositive = change?.value && change.value > 0;
  const isNegative = change?.value && change.value < 0;

  return (
    <Card
      className={cn(
        "p-6 transition-all duration-200 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {change && (
        <p
          className={cn(
            "text-xs mt-1",
            isPositive && "text-green-600",
            isNegative && "text-red-600",
            !isPositive && !isNegative && "text-muted-foreground",
          )}
        >
          {isPositive && "↑"}
          {isNegative && "↓"} {Math.abs(change.value)}% from {change.timeframe}
        </p>
      )}
    </Card>
  );
}
