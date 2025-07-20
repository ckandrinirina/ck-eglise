/**
 * API endpoint for individual event management
 *
 * @route {GET} /api/events/[id]
 * @route {PUT} /api/events/[id]
 * @route {DELETE} /api/events/[id]
 * @access private
 * @description Handles individual event operations
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeDB } from "@/lib/db";
import { UpdateEventData } from "@/types/events";

/**
 * GET /api/events/[id] - Get a specific event
 *
 * @async
 * @param {NextRequest} request - The request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Event ID
 * @returns {Promise<NextResponse>} Event details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initializeDB();

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        category: true,
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        reminders: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user has access to this event
    const isCreator = event.createdBy === session.user.id;
    const isAttendee = event.attendees.some(
      (a) => a.userId === session.user.id,
    );
    const isPublic = event.visibility === "public";
    const isAdmin = session.user.role === "admin";

    if (!isCreator && !isAttendee && !isPublic && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.$disconnect();

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/events/[id] - Update an event
 *
 * @async
 * @param {NextRequest} request - The request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Event ID
 * @returns {Promise<NextResponse>} Updated event
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initializeDB();

    const data: UpdateEventData = await request.json();

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // Check if event exists and user has permission
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        attendees: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isCreator = existingEvent.createdBy === session.user.id;
    const isOrganizer = existingEvent.attendees.some(
      (a) => a.userId === session.user.id && a.isOrganizer,
    );
    const isAdmin = session.user.role === "admin";

    if (!isCreator && !isOrganizer && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate date range if provided
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 },
        );
      }
    }

    // Prepare update data
    const updateData: Prisma.EventUpdateInput = {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.isAllDay !== undefined && { isAllDay: data.isAllDay }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
      ...(data.recurrenceRule !== undefined && {
        recurrenceRule: data.recurrenceRule,
      }),
      ...(data.status && { status: data.status }),
      ...(data.visibility && { visibility: data.visibility }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    };

    // Handle attendees update
    if (data.attendeeIds) {
      // Get current attendees
      const currentAttendees = existingEvent.attendees;
      const organizerIds = currentAttendees
        .filter((a) => a.isOrganizer)
        .map((a) => a.userId);

      // Ensure all organizers remain
      const newAttendeeIds = [
        ...organizerIds,
        ...data.attendeeIds.filter((id) => !organizerIds.includes(id)),
      ];

      // Delete current attendees and recreate
      await prisma.eventAttendee.deleteMany({
        where: { eventId: params.id },
      });

      updateData.attendees = {
        create: newAttendeeIds.map((userId) => ({
          userId,
          status: organizerIds.includes(userId) ? "accepted" : "pending",
          isOrganizer: organizerIds.includes(userId),
        })),
      };
    }

    // Handle reminders update
    if (data.reminders) {
      await prisma.eventReminder.deleteMany({
        where: { eventId: params.id },
      });

      updateData.reminders = {
        create: data.reminders.map((reminder) => ({
          userId: reminder.userId,
          reminderTime: new Date(reminder.reminderTime),
          type: reminder.type || "notification",
        })),
      };
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        category: true,
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        reminders: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    await prisma.$disconnect();

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/events/[id] - Delete an event
 *
 * @async
 * @param {NextRequest} request - The request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Event ID
 * @returns {Promise<NextResponse>} Success message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initializeDB();

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // Check if event exists and user has permission
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isCreator = existingEvent.createdBy === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the event (attendees and reminders will be deleted via cascade)
    await prisma.event.delete({
      where: { id: params.id },
    });

    await prisma.$disconnect();

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
