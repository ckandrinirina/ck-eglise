/**
 * Hook for managing event attendee status
 *
 * @hook
 * @param {string} eventId - Event ID
 * @returns {Object} Attendee status management functions
 *
 * @example
 * // Basic usage
 * const { updateStatus, isUpdating } = useAttendeeStatus(eventId)
 *
 * // Update status
 * updateStatus('accepted')
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EventService } from "@/lib/services/event.service";
import { AttendeeStatus } from "@/types/events";
import { toast } from "sonner";

export const useAttendeeStatus = (eventId: string) => {
  const queryClient = useQueryClient();

  // Mutation for updating attendee status
  const updateStatusMutation = useMutation({
    mutationFn: (status: AttendeeStatus) =>
      EventService.updateAttendeeStatus(eventId, status),
    onSuccess: (data, status) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });

      const statusMessages = {
        accepted: "You have accepted the event invitation",
        declined: "You have declined the event invitation",
        tentative: "You have marked yourself as tentative for this event",
        pending: "Your response has been reset to pending",
      };

      toast.success(statusMessages[status]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  return {
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
};
