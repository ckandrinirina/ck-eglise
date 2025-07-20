/**
 * @file Event types
 * @description TypeScript type definitions for calendar events
 * @module types/events
 */

import { User } from "@/types/users/user";
import { Dropdown } from "@/types/dropdowns/dropdown";

/**
 * Event status enum
 */
export type EventStatus = "confirmed" | "tentative" | "cancelled";

/**
 * Event visibility enum
 */
export type EventVisibility = "public" | "private";

/**
 * Attendee status enum
 */
export type AttendeeStatus = "pending" | "accepted" | "declined" | "tentative";

/**
 * Reminder type enum
 */
export type ReminderType = "notification" | "email" | "sms";

/**
 * Event interface
 */
export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  location?: string;
  isAllDay: boolean;
  color?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  status: EventStatus;
  visibility: EventVisibility;
  categoryId?: string;
  category?: Dropdown;
  createdBy: string;
  creator: User;
  attendees: EventAttendee[];
  reminders: EventReminder[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Event attendee interface
 */
export interface EventAttendee {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  user: User;
  status: AttendeeStatus;
  isOrganizer: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Event reminder interface
 */
export interface EventReminder {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  user: User;
  reminderTime: Date | string;
  type: ReminderType;
  isSent: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Create event data interface
 */
export interface CreateEventData {
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  location?: string;
  isAllDay?: boolean;
  color?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  status?: EventStatus;
  visibility?: EventVisibility;
  categoryId?: string;
  attendeeIds?: string[];
  reminders?: CreateEventReminderData[];
}

/**
 * Update event data interface
 */
export interface UpdateEventData {
  title?: string;
  description?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  location?: string;
  isAllDay?: boolean;
  color?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  status?: EventStatus;
  visibility?: EventVisibility;
  categoryId?: string;
  attendeeIds?: string[];
  reminders?: CreateEventReminderData[];
}

/**
 * Create event reminder data interface
 */
export interface CreateEventReminderData {
  userId: string;
  reminderTime: Date | string;
  type?: ReminderType;
}

/**
 * Event query parameters interface
 */
export interface EventQueryParams {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  status?: EventStatus;
  visibility?: EventVisibility;
  createdBy?: string;
  attendeeId?: string;
}

/**
 * Calendar view type
 */
export type CalendarView = "month" | "week" | "day" | "agenda";

/**
 * Calendar event for display purposes
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  description?: string;
  location?: string;
  status: EventStatus;
  visibility: EventVisibility;
  attendees: EventAttendee[];
  category?: Dropdown;
  creator: User;
}

/**
 * Event form data interface
 */
export interface EventFormData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  location: string;
  isAllDay: boolean;
  color: string;
  isRecurring: boolean;
  recurrenceRule: string;
  status: EventStatus;
  visibility: EventVisibility;
  categoryId: string;
  attendeeIds: string[];
  reminderMinutes: number[];
}
