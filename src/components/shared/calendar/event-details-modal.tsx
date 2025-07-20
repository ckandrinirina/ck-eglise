/**
 * @component EventDetailsModal
 * @description Modal for displaying and managing event details
 *
 * @example
 * // Basic usage
 * <EventDetailsModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   event={selectedEvent}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Close modal handler
 * @param {Event} event - Event to display
 * @param {Function} onEdit - Edit event handler
 * @param {Function} onDelete - Delete event handler
 * @returns {JSX.Element} Event details modal component
 */

"use client";

import { Event } from "@/types/events";
import { useAttendeeStatus } from "@/hooks/calendar/useAttendeeStatus";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export const EventDetailsModal = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
}: EventDetailsModalProps) => {
  const t = useTranslations("admin.calendar");
  const { user } = useAuth();
  const { updateStatus, isUpdating } = useAttendeeStatus(event?.id || "");

  if (!event) return null;

  const isCreator = user?.id === event.createdBy;
  const userAttendee = event.attendees?.find((a) => a.userId === user?.id);
  const isAttendee = !!userAttendee;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "tentative":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getAttendeeStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "default";
      case "declined":
        return "destructive";
      case "tentative":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleStatusUpdate = (
    status: "accepted" | "declined" | "tentative",
  ) => {
    updateStatus(status);
  };

  const handleEdit = () => {
    onEdit(event);
    onClose();
  };

  const handleDelete = () => {
    onDelete(event);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{event.title}</DialogTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeVariant(event.status)}>
                  {t(`status.${event.status}`)}
                </Badge>
                <Badge variant="outline">
                  {t(`visibility.${event.visibility}`)}
                </Badge>
              </div>
            </div>
            {(isCreator || isAttendee) && (
              <div className="flex space-x-2">
                {isCreator && (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">{t("buttons.edit")}</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">{t("buttons.delete")}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("confirmations.deleteEvent")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("confirmations.deleteEventDescription")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t("buttons.cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>
                            {t("buttons.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {event.description && (
            <div>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}

          {/* Date and Time */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
                {!event.isAllDay && (
                  <>
                    {" "}
                    {t("time.at")} {format(new Date(event.startDate), "HH:mm")}
                    {" - "}
                    {format(new Date(event.endDate), "HH:mm")}
                  </>
                )}
              </span>
            </div>

            {event.isAllDay && (
              <div className="flex items-center space-x-2 text-sm">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <span>{t("time.allDay")}</span>
              </div>
            )}
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Category */}
          {event.category && (
            <div>
              <h4 className="text-sm font-medium mb-2">{t("form.category")}</h4>
              <Badge variant="outline">{event.category.name}</Badge>
            </div>
          )}

          {/* Creator */}
          <div>
            <h4 className="text-sm font-medium mb-2">Created by</h4>
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.creator.image || ""} />
                <AvatarFallback>
                  {event.creator.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{event.creator.name}</span>
            </div>
          </div>

          {/* Attendee Response (if user is attendee) */}
          {isAttendee && userAttendee && (
            <div>
              <h4 className="text-sm font-medium mb-3">Your Response</h4>
              <div className="flex items-center space-x-2 mb-3">
                <Badge
                  variant={getAttendeeStatusBadgeVariant(userAttendee.status)}
                >
                  {t(`attendeeStatus.${userAttendee.status}`)}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={
                    userAttendee.status === "accepted" ? "default" : "outline"
                  }
                  onClick={() => handleStatusUpdate("accepted")}
                  disabled={isUpdating}
                >
                  {t("attendeeActions.accept")}
                </Button>
                <Button
                  size="sm"
                  variant={
                    userAttendee.status === "tentative" ? "default" : "outline"
                  }
                  onClick={() => handleStatusUpdate("tentative")}
                  disabled={isUpdating}
                >
                  {t("attendeeActions.maybe")}
                </Button>
                <Button
                  size="sm"
                  variant={
                    userAttendee.status === "declined"
                      ? "destructive"
                      : "outline"
                  }
                  onClick={() => handleStatusUpdate("declined")}
                  disabled={isUpdating}
                >
                  {t("attendeeActions.decline")}
                </Button>
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <UsersIcon className="h-4 w-4 mr-1" />
                {t("form.attendees")} ({event.attendees.length})
              </h4>
              <div className="space-y-2">
                {event.attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={attendee.user.image || ""} />
                        <AvatarFallback>
                          {attendee.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{attendee.user.name}</span>
                      {attendee.isOrganizer && (
                        <Badge variant="secondary" className="text-xs">
                          Organizer
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant={getAttendeeStatusBadgeVariant(attendee.status)}
                      className="text-xs"
                    >
                      {t(`attendeeStatus.${attendee.status}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
