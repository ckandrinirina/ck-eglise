/**
 * Hook for managing event form state and validation
 *
 * @hook
 * @param {Event} initialEvent - Optional initial event data for editing
 * @returns {Object} Form state, handlers, and submission functions
 *
 * @example
 * // For creating a new event
 * const { form, handleSubmit, isSubmitting } = useEventForm()
 *
 * // For editing an existing event
 * const { form, handleSubmit } = useEventForm(existingEvent)
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Event, CreateEventData, UpdateEventData } from "@/types/events";
import { useEvents } from "./useEvents";

// Form validation schema
const eventFormSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().max(1000, "Description is too long").optional(),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().max(200, "Location is too long").optional(),
    isAllDay: z.boolean().default(false),
    color: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurrenceRule: z.string().optional(),
    status: z
      .enum(["confirmed", "tentative", "cancelled"])
      .default("confirmed"),
    visibility: z.enum(["public", "private"]).default("public"),
    categoryId: z.string().optional(),
    attendeeIds: z.array(z.string()).default([]),
    reminderMinutes: z.array(z.number()).default([]),
  })
  .refine(
    (data) => {
      if (!data.isAllDay && data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

type EventFormSchema = z.infer<typeof eventFormSchema>;

export const useEventForm = (initialEvent?: Event) => {
  const { createEvent, updateEvent, isCreating, isUpdating } = useEvents();

  // Initialize form with default values or event data
  const getDefaultValues = (): EventFormSchema => {
    if (initialEvent) {
      const startDate = new Date(initialEvent.startDate);
      const endDate = new Date(initialEvent.endDate);

      return {
        title: initialEvent.title,
        description: initialEvent.description || "",
        startDate,
        endDate,
        startTime: initialEvent.isAllDay ? "" : format(startDate, "HH:mm"),
        endTime: initialEvent.isAllDay ? "" : format(endDate, "HH:mm"),
        location: initialEvent.location || "",
        isAllDay: initialEvent.isAllDay,
        color: initialEvent.color || "",
        isRecurring: initialEvent.isRecurring,
        recurrenceRule: initialEvent.recurrenceRule || "",
        status: initialEvent.status,
        visibility: initialEvent.visibility,
        categoryId: initialEvent.categoryId || "",
        attendeeIds: initialEvent.attendees?.map((a) => a.userId) || [],
        reminderMinutes: [],
      };
    }

    // Default values for new event
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    return {
      title: "",
      description: "",
      startDate: now,
      endDate: oneHourLater,
      startTime: format(now, "HH:mm"),
      endTime: format(oneHourLater, "HH:mm"),
      location: "",
      isAllDay: false,
      color: "",
      isRecurring: false,
      recurrenceRule: "",
      status: "confirmed" as const,
      visibility: "public" as const,
      categoryId: "",
      attendeeIds: [],
      reminderMinutes: [],
    };
  };

  const form = useForm<EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: getDefaultValues(),
  });

  // Transform form data to API format
  const transformFormData = (
    data: EventFormSchema,
  ): CreateEventData | UpdateEventData => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Handle time for non-all-day events
    if (!data.isAllDay && data.startTime && data.endTime) {
      const [startHour, startMinute] = data.startTime.split(":").map(Number);
      const [endHour, endMinute] = data.endTime.split(":").map(Number);

      startDate.setHours(startHour, startMinute, 0, 0);
      endDate.setHours(endHour, endMinute, 0, 0);
    } else if (data.isAllDay) {
      // For all-day events, set to start/end of day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    // Prepare reminders
    const reminders = data.reminderMinutes.map((minutes) => ({
      userId: "", // Will be filled by the API with attendee IDs
      reminderTime: new Date(startDate.getTime() - minutes * 60 * 1000),
      type: "notification" as const,
    }));

    return {
      title: data.title,
      description: data.description || undefined,
      startDate,
      endDate,
      location: data.location || undefined,
      isAllDay: data.isAllDay,
      color: data.color || undefined,
      isRecurring: data.isRecurring,
      recurrenceRule: data.recurrenceRule || undefined,
      status: data.status,
      visibility: data.visibility,
      categoryId: data.categoryId || undefined,
      attendeeIds: data.attendeeIds,
      reminders: reminders.length > 0 ? reminders : undefined,
    };
  };

  // Handle form submission
  const handleSubmit = form.handleSubmit((data: EventFormSchema) => {
    const transformedData = transformFormData(data);

    if (initialEvent) {
      updateEvent({
        id: initialEvent.id,
        data: transformedData as UpdateEventData,
      });
    } else {
      createEvent(transformedData as CreateEventData);
    }
  });

  // Helper function to reset form
  const resetForm = () => {
    form.reset(getDefaultValues());
  };

  // Watch isAllDay to conditionally show/hide time fields
  const isAllDay = form.watch("isAllDay");

  return {
    form,
    handleSubmit,
    resetForm,
    isSubmitting: isCreating || isUpdating,
    isAllDay,
    isEditing: !!initialEvent,
  };
};
