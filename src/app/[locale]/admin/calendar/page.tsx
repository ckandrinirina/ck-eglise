/**
 * @page Calendar
 * @description Main calendar page for viewing and managing events
 * @route /[locale]/admin/calendar
 * @access admin
 */

"use client";

import { useState } from "react";
import { useEvents } from "@/hooks/calendar/useEvents";
import { useCalendarView } from "@/hooks/calendar/useCalendarView";
import { CalendarHeader } from "@/components/shared/calendar/calendar-header";
import { CalendarGrid } from "@/components/shared/calendar/calendar-grid";
import { EventFormModal } from "@/components/shared/calendar/event-form-modal";
import { EventDetailsModal } from "@/components/shared/calendar/event-details-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Event, CalendarEvent } from "@/types/events";
import { useTranslations } from "next-intl";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function CalendarPage() {
  const t = useTranslations("admin.calendar");

  // Calendar view management
  const {
    currentDate,
    view,
    viewStart,
    viewEnd,
    viewTitle,
    isShowingToday,
    goToNext,
    goToPrevious,
    goToToday,
    // goToDate,
    setView,
  } = useCalendarView();

  // Events data
  const { events, isLoading, deleteEvent } = useEvents({
    startDate: viewStart.toISOString(),
    endDate: viewEnd.toISOString(),
  });

  // Modal states
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Transform events for calendar display
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendarEvents: CalendarEvent[] = events.map((event: any) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    allDay: event.isAllDay,
    color: event.color,
    backgroundColor: event.color,
    borderColor: event.color,
    textColor: "#ffffff",
    description: event.description,
    location: event.location,
    status: event.status,
    visibility: event.visibility,
    attendees: event.attendees || [],
    category: event.category,
    creator: event.creator,
  }));

  // Event handlers
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setSelectedDate(null);
    setIsEventFormOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fullEvent = events.find((e: any) => e.id === event.id);
    if (fullEvent) {
      setSelectedEvent(fullEvent);
      setIsEventDetailsOpen(true);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setIsEventFormOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setSelectedDate(null);
    setIsEventFormOpen(true);
  };

  const handleDeleteEvent = (event: Event) => {
    deleteEvent(event.id);
  };

  const handleFormSuccess = () => {
    setIsEventFormOpen(false);
    setEditingEvent(null);
    setSelectedDate(null);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            Manage church events and activities
          </p>
        </div>
        <Button onClick={handleCreateEvent}>
          <PlusIcon className="h-4 w-4 mr-2" />
          {t("createEvent")}
        </Button>
      </div>

      {/* Calendar Controls */}
      <CalendarHeader
        viewTitle={viewTitle}
        view={view}
        onViewChange={setView}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
        isShowingToday={isShowingToday}
      />

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {view === "agenda" ? (
          <div className="p-4 h-full overflow-y-auto">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("views.agenda")}
              </h3>
              {calendarEvents.length === 0 ? (
                <p className="text-muted-foreground">
                  {t("messages.noEventsInRange")}
                </p>
              ) : (
                <div className="space-y-3">
                  {calendarEvents
                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                    .map((event) => (
                      <Card
                        key={event.id}
                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{
                                  backgroundColor: event.color || "#3b82f6",
                                }}
                              />
                              <h4 className="font-medium">{event.title}</h4>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {event.start.toLocaleDateString()}
                              {!event.allDay && (
                                <>
                                  {" "}
                                  {t("time.at")}{" "}
                                  {event.start.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </>
                              )}
                            </div>
                            {event.location && (
                              <div className="text-sm text-muted-foreground">
                                📍 {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </Card>
          </div>
        ) : (
          <CalendarGrid
            events={calendarEvents}
            viewStart={viewStart}
            viewEnd={viewEnd}
            view={view}
            currentDate={currentDate}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        )}
      </div>

      {/* Modals */}
      <EventFormModal
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        onSuccess={handleFormSuccess}
        event={editingEvent || undefined}
        initialDate={selectedDate || undefined}
      />

      <EventDetailsModal
        isOpen={isEventDetailsOpen}
        onClose={() => {
          setIsEventDetailsOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
