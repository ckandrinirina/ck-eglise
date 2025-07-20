/**
 * Hook for managing calendar view state and navigation
 *
 * @hook
 * @returns {Object} Calendar view state and navigation functions
 *
 * @example
 * // Basic usage
 * const {
 *   currentDate,
 *   view,
 *   setView,
 *   goToNext,
 *   goToPrevious,
 *   goToToday,
 *   viewStart,
 *   viewEnd
 * } = useCalendarView()
 */

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addMonths,
  addWeeks,
  addDays,
  subMonths,
  subWeeks,
  subDays,
} from "date-fns";
import { CalendarView } from "@/types/events";

export const useCalendarView = (initialView: CalendarView = "month") => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(initialView);

  // Calculate view boundaries based on current date and view type
  const { viewStart, viewEnd } = useMemo(() => {
    switch (view) {
      case "month":
        return {
          viewStart: startOfWeek(startOfMonth(currentDate)),
          viewEnd: endOfWeek(endOfMonth(currentDate)),
        };
      case "week":
        return {
          viewStart: startOfWeek(currentDate),
          viewEnd: endOfWeek(currentDate),
        };
      case "day":
        return {
          viewStart: startOfDay(currentDate),
          viewEnd: endOfDay(currentDate),
        };
      case "agenda":
        // Show next 30 days for agenda view
        return {
          viewStart: startOfDay(currentDate),
          viewEnd: endOfDay(addDays(currentDate, 30)),
        };
      default:
        return {
          viewStart: startOfWeek(startOfMonth(currentDate)),
          viewEnd: endOfWeek(endOfMonth(currentDate)),
        };
    }
  }, [currentDate, view]);

  // Navigation functions
  const goToNext = () => {
    setCurrentDate((prev) => {
      switch (view) {
        case "month":
          return addMonths(prev, 1);
        case "week":
          return addWeeks(prev, 1);
        case "day":
          return addDays(prev, 1);
        case "agenda":
          return addDays(prev, 7); // Move agenda view by a week
        default:
          return addMonths(prev, 1);
      }
    });
  };

  const goToPrevious = () => {
    setCurrentDate((prev) => {
      switch (view) {
        case "month":
          return subMonths(prev, 1);
        case "week":
          return subWeeks(prev, 1);
        case "day":
          return subDays(prev, 1);
        case "agenda":
          return subDays(prev, 7); // Move agenda view by a week
        default:
          return subMonths(prev, 1);
      }
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToDate = (date: Date) => {
    setCurrentDate(date);
  };

  // Get view title for display
  const getViewTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      year: "numeric",
    };

    switch (view) {
      case "month":
        return currentDate.toLocaleDateString(undefined, options);
      case "week":
        return `Week of ${currentDate.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      case "day":
        return currentDate.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      case "agenda":
        return "Agenda";
      default:
        return currentDate.toLocaleDateString(undefined, options);
    }
  };

  // Check if current view is showing today
  const isShowingToday = () => {
    const today = new Date();
    return today >= viewStart && today <= viewEnd;
  };

  return {
    // Current state
    currentDate,
    view,
    viewStart,
    viewEnd,

    // Navigation
    goToNext,
    goToPrevious,
    goToToday,
    goToDate,
    setView,

    // Computed values
    viewTitle: getViewTitle(),
    isShowingToday: isShowingToday(),
  };
};
