/**
 * Hook for managing events data
 *
 * @hook
 * @param {EventQueryParams} params - Optional query parameters for filtering events
 * @returns {Object} Events query data and mutation functions
 *
 * @example
 * // Basic usage
 * const { events, isLoading, error, refetch } = useEvents()
 *
 * // With filters
 * const { events } = useEvents({ startDate: '2024-01-01', endDate: '2024-12-31' })
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EventService } from "@/lib/services/event.service";
import {
  EventQueryParams,
  CreateEventData,
  UpdateEventData,
} from "@/types/events";
import { toast } from "sonner";

export const useEvents = (params?: EventQueryParams) => {
  const queryClient = useQueryClient();

  // Query for fetching events
  const eventsQuery = useQuery({
    queryKey: ["events", params],
    queryFn: () => EventService.getEvents(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for creating events
  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventData) => EventService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  // Mutation for updating events
  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventData }) =>
      EventService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update event");
    },
  });

  // Mutation for deleting events
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => EventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete event");
    },
  });

  return {
    // Query data
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,

    // Mutations
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,

    // Mutation states
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
};
