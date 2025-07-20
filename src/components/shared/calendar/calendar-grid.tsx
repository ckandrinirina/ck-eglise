/**
 * @component CalendarGrid
 * @description Calendar grid component for displaying events in month/week view
 *
 * @example
 * // Basic usage
 * <CalendarGrid
 *   events={events}
 *   viewStart={viewStart}
 *   viewEnd={viewEnd}
 *   view="month"
 *   onEventClick={handleEventClick}
 *   onDateClick={handleDateClick}
 * />
 *
 * @param {CalendarEvent[]} events - Array of events to display
 * @param {Date} viewStart - Start date of the view
 * @param {Date} viewEnd - End date of the view
 * @param {CalendarView} view - Calendar view type
 * @param {Function} onEventClick - Event click handler
 * @param {Function} onDateClick - Date click handler
 * @returns {JSX.Element} Calendar grid component
 */

"use client";

import {
  format,
  isSameDay,
  isToday,
  isWithinInterval,
  eachDayOfInterval,
} from "date-fns";
import { CalendarEvent, CalendarView } from "@/types/events";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface CalendarGridProps {
  events: CalendarEvent[];
  viewStart: Date;
  viewEnd: Date;
  view: CalendarView;
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  currentDate: Date;
}

export const CalendarGrid = ({
  events,
  viewStart,
  viewEnd,
  view,
  onEventClick,
  onDateClick,
  currentDate,
}: CalendarGridProps) => {
  const t = useTranslations("admin.calendar");

  // Get all days in the view
  const days = eachDayOfInterval({ start: viewStart, end: viewEnd });

  // Get events for a specific day
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      if (event.allDay) {
        return (
          isWithinInterval(date, { start: event.start, end: event.end }) ||
          isSameDay(date, event.start) ||
          isSameDay(date, event.end)
        );
      }
      return isSameDay(date, event.start);
    });
  };

  // Render event item
  const renderEvent = (event: CalendarEvent, isCompact = false) => (
    <Button
      key={event.id}
      variant="ghost"
      size={isCompact ? "sm" : "default"}
      className={cn(
        "w-full justify-start text-left h-auto p-1 text-xs",
        "hover:bg-opacity-80 transition-colors",
        isCompact && "min-h-[20px] py-0.5",
      )}
      style={{
        backgroundColor: event.backgroundColor || event.color || "#3b82f6",
        color: event.textColor || "#ffffff",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
    >
      <span className="truncate">
        {!event.allDay && !isCompact && (
          <span className="opacity-75 mr-1">
            {format(event.start, "HH:mm")}
          </span>
        )}
        {event.title}
      </span>
    </Button>
  );

  // Render month view
  if (view === "month") {
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="flex flex-col h-full">
        {/* Header with day names */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="bg-background p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex-1 grid grid-rows-6 gap-px bg-border">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-px">
              {week.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth =
                  day.getMonth() === currentDate.getMonth();

                return (
                  <Card
                    key={day.toString()}
                    className={cn(
                      "p-1 cursor-pointer border-0 rounded-none bg-background hover:bg-muted/50 transition-colors",
                      !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                      isToday(day) && "bg-primary/10 border-primary",
                    )}
                    onClick={() => onDateClick(day)}
                  >
                    <div className="flex flex-col h-full min-h-[100px]">
                      <div
                        className={cn(
                          "text-sm p-1",
                          isToday(day) && "font-bold text-primary",
                        )}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="flex-1 space-y-0.5 overflow-hidden">
                        {dayEvents
                          .slice(0, 3)
                          .map((event) => renderEvent(event, true))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render week view
  if (view === "week") {
    return (
      <div className="flex flex-col h-full">
        {/* Header with day names and dates */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {days.map((day) => (
            <div
              key={day.toString()}
              className={cn(
                "bg-background p-3 text-center",
                isToday(day) && "bg-primary/10",
              )}
            >
              <div className="text-sm font-medium text-muted-foreground">
                {format(day, "EEE")}
              </div>
              <div
                className={cn(
                  "text-2xl font-bold",
                  isToday(day) && "text-primary",
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Week grid */}
        <div className="flex-1 grid grid-cols-7 gap-px bg-border">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);

            return (
              <Card
                key={day.toString()}
                className="p-2 cursor-pointer border-0 rounded-none bg-background hover:bg-muted/50 transition-colors"
                onClick={() => onDateClick(day)}
              >
                <div className="space-y-1 min-h-[300px]">
                  {dayEvents.map((event) => renderEvent(event))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Render day view
  if (view === "day") {
    const dayEvents = getEventsForDay(currentDate);

    return (
      <div className="h-full">
        <Card className="p-4 h-full">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {format(currentDate, "EEEE, MMMM d, yyyy")}
            </h3>
          </div>
          <div className="space-y-2">
            {dayEvents.length === 0 ? (
              <p className="text-muted-foreground">{t("messages.noEvents")}</p>
            ) : (
              dayEvents.map((event) => (
                <Card key={event.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">
                        {event.allDay
                          ? t("time.allDay")
                          : `${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}`}
                      </div>
                      {event.location && (
                        <div className="text-sm text-muted-foreground">
                          📍 {event.location}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEventClick(event)}
                    >
                      {t("buttons.view")}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    );
  }

  return null;
};
