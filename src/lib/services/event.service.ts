/**
 * @file Event service
 * @description API service for event management
 * @module services/event
 */

import axios from "axios";
import {
  CreateEventData,
  UpdateEventData,
  EventQueryParams,
  AttendeeStatus,
} from "@/types/events";

// Create axios instance with common config
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Service for handling event API calls
 */
export const EventService = {
  /**
   * Get all events with optional filtering
   *
   * @async
   * @param {EventQueryParams} params - Optional params to filter events
   * @returns {Promise<Event[]>} List of events
   */
  getEvents: async (params?: EventQueryParams) => {
    const response = await api.get("/events", { params });
    return response.data;
  },

  /**
   * Get a specific event by ID
   *
   * @async
   * @param {string} id - Event ID
   * @returns {Promise<Event>} Event details
   */
  getEvent: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  /**
   * Create a new event
   *
   * @async
   * @param {CreateEventData} data - Event data
   * @returns {Promise<Event>} Created event
   */
  createEvent: async (data: CreateEventData) => {
    const response = await api.post("/events", data);
    return response.data;
  },

  /**
   * Update an event
   *
   * @async
   * @param {string} id - Event ID
   * @param {UpdateEventData} data - Event update data
   * @returns {Promise<Event>} Updated event
   */
  updateEvent: async (id: string, data: UpdateEventData) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  /**
   * Delete an event
   *
   * @async
   * @param {string} id - Event ID
   * @returns {Promise<{message: string}>} Success message
   */
  deleteEvent: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  /**
   * Update attendee status for an event
   *
   * @async
   * @param {string} eventId - Event ID
   * @param {AttendeeStatus} status - New attendee status
   * @returns {Promise<EventAttendee>} Updated attendee
   */
  updateAttendeeStatus: async (eventId: string, status: AttendeeStatus) => {
    const response = await api.put(`/events/${eventId}/attendees`, { status });
    return response.data;
  },

  /**
   * Get events for a specific date range (useful for calendar views)
   *
   * @async
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Event[]>} Events in the date range
   */
  getEventsInRange: async (startDate: Date, endDate: Date) => {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    const response = await api.get("/events", { params });
    return response.data;
  },

  /**
   * Get events for current user as attendee
   *
   * @async
   * @param {string} userId - User ID
   * @returns {Promise<Event[]>} Events where user is attendee
   */
  getUserEvents: async (userId: string) => {
    const params = { attendeeId: userId };
    const response = await api.get("/events", { params });
    return response.data;
  },

  /**
   * Get events created by current user
   *
   * @async
   * @param {string} userId - User ID
   * @returns {Promise<Event[]>} Events created by user
   */
  getCreatedEvents: async (userId: string) => {
    const params = { createdBy: userId };
    const response = await api.get("/events", { params });
    return response.data;
  },

  /**
   * Get events by category
   *
   * @async
   * @param {string} categoryId - Category ID
   * @returns {Promise<Event[]>} Events in the category
   */
  getEventsByCategory: async (categoryId: string) => {
    const params = { categoryId };
    const response = await api.get("/events", { params });
    return response.data;
  },

  /**
   * Get today's events
   *
   * @async
   * @returns {Promise<Event[]>} Today's events
   */
  getTodaysEvents: async () => {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    return EventService.getEventsInRange(startOfDay, endOfDay);
  },

  /**
   * Get upcoming events (next 7 days)
   *
   * @async
   * @returns {Promise<Event[]>} Upcoming events
   */
  getUpcomingEvents: async () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return EventService.getEventsInRange(today, nextWeek);
  },
};
