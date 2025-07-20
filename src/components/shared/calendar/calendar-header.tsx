/**
 * @component CalendarHeader
 * @description Calendar header with navigation and view controls
 *
 * @example
 * // Basic usage
 * <CalendarHeader
 *   viewTitle="January 2024"
 *   view="month"
 *   onViewChange={setView}
 *   onPrevious={goToPrevious}
 *   onNext={goToNext}
 *   onToday={goToToday}
 *   isShowingToday={false}
 * />
 *
 * @param {string} viewTitle - Title for current view
 * @param {CalendarView} view - Current calendar view
 * @param {Function} onViewChange - View change handler
 * @param {Function} onPrevious - Previous navigation handler
 * @param {Function} onNext - Next navigation handler
 * @param {Function} onToday - Today navigation handler
 * @param {boolean} isShowingToday - Whether currently showing today
 * @returns {JSX.Element} Calendar header component
 */

"use client";

import { CalendarView } from "@/types/events";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

interface CalendarHeaderProps {
  viewTitle: string;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  isShowingToday: boolean;
}

export const CalendarHeader = ({
  viewTitle,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  isShowingToday,
}: CalendarHeaderProps) => {
  const t = useTranslations("admin.calendar");

  const viewOptions: { value: CalendarView; label: string }[] = [
    { value: "month", label: t("views.month") },
    { value: "week", label: t("views.week") },
    { value: "day", label: t("views.day") },
    { value: "agenda", label: t("views.agenda") },
  ];

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      {/* Left section: Navigation */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          disabled={isShowingToday}
        >
          {t("navigation.today")}
        </Button>

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            className="p-1"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="sr-only">{t("navigation.previous")}</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={onNext} className="p-1">
            <ChevronRightIcon className="h-4 w-4" />
            <span className="sr-only">{t("navigation.next")}</span>
          </Button>
        </div>
      </div>

      {/* Center section: Title */}
      <div className="flex-1 text-center">
        <h2 className="text-xl font-semibold">{viewTitle}</h2>
      </div>

      {/* Right section: View selector */}
      <div className="flex items-center space-x-2">
        <Select value={view} onValueChange={onViewChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {viewOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
