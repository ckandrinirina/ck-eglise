/**
 * @component DateRangeFilter
 * @description Component for filtering transactions by date range
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  onFilterChange: (startDate: string | null, endDate: string | null) => void;
  initialStartDate?: string | null;
  initialEndDate?: string | null;
}

/**
 * DateRangeFilter component for filtering by date range
 */
export const DateRangeFilter = ({
  onFilterChange,
  initialStartDate = null,
  initialEndDate = null,
}: DateRangeFilterProps) => {
  const t = useTranslations("finance");
  const [startDate, setStartDate] = useState<string | null>(initialStartDate);
  const [endDate, setEndDate] = useState<string | null>(initialEndDate);

  const handleApplyFilter = () => {
    onFilterChange(startDate, endDate);
  };

  const handleResetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    onFilterChange(null, null);
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-4 w-4" />
        <h3 className="text-sm font-medium">{t("filterByDate")}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("dateFrom")}
          </label>
          <Input
            type="date"
            value={startDate || ""}
            onChange={(e) => setStartDate(e.target.value || null)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("dateTo")}
          </label>
          <Input
            type="date"
            value={endDate || ""}
            onChange={(e) => setEndDate(e.target.value || null)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetFilter}
          disabled={!startDate && !endDate}
        >
          {t("reset")}
        </Button>
        <Button size="sm" onClick={handleApplyFilter}>
          {t("apply")}
        </Button>
      </div>
    </div>
  );
};
