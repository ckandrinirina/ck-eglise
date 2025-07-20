/**
 * API endpoint for event management
 *
 * @route {GET} /api/events
 * @route {POST} /api/events
 * @access private
 * @description Handles event retrieval and creation
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeDB } from "@/lib/db";
import { CreateEventData, EventQueryParams } from "@/types/events";
import { EventStatus, EventVisibility, Prisma } from "@prisma/client";
// import { addMinutes } from "date-fns";

/**
 * GET /api/events - Get all events with optional filtering
 *
 * @async
 * @param {NextRequest} request - The request object
 * @returns {Promise<NextResponse>} List of events
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initializeDB();

    const { searchParams } = new URL(request.url);
    const params: EventQueryParams = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      status: (searchParams.get("status") as EventStatus) || undefined,
      visibility:
        (searchParams.get("visibility") as EventVisibility) || undefined,
      createdBy: search_params.get("createdBy") || undefined,
      attendeeId: searchParams.get("attendeeId") || undefined,
    };

    // Build the where clause
    const where: Prisma.EventWhereInput = {};

    if (params.startDate || params.endDate) {
      where.OR = [
        {
          startDate: {
            ...(params.startDate && { gte: new Date(params.startDate) }),
            ...(params.endDate && { lte: new Date(params.endDate) }),
          },
        },
        {
          endDate: {
            ...(params.startDate && { gte: new Date(params.startDate) }),
            ...(params.endDate && { lte: new Date(params.endDate) }),
          },
        },
        ...(params.startDate && params.endDate
          ? [
              {
                AND: [
                  { startDate: { lte: new Date(params.startDate) } },
                  { endDate: { gte: new Date(params.endDate) } },
                ],
              },
            ]
          : []),
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.visibility) {
      where.visibility = params.visibility;
    }

    if (params.createdBy) {
      where.createdBy = params.createdBy;
    }

    if (params.attendeeId) {
      where.attendees = {
        some: {
          userId: params.attendeeId,
        },
      };
    }

    // Filter private events: show only if user is creator or attendee
    if (session.user.role !== "admin") {
      where.OR = [
        { visibility: "public" },
        { createdBy: session.user.id },
        {
          attendees: {
            some: {
              userId: session.user.id,
            },
          },
        },
      ];
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const events = await prisma.event.findMany({
      where,
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
      orderBy: {
        startDate: "asc",
      },
    });

    await prisma.$disconnect();

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/events - Create a new event
 *
 * @async
 * @param {NextRequest} request - The request object
 * @returns {Promise<NextResponse>} Created event
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initializeDB();

    const data: CreateEventData = await request.json();

    // Validate required fields
    if (!data.title || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: "Title, start date, and end date are required" },
        { status: 400 },
      );
    }

    // Validate date range
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 },
      );
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // Create the event
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate,
        endDate,
        location: data.location,
        isAllDay: data.isAllDay || false,
        color: data.color,
        isRecurring: data.isRecurring || false,
        recurrenceRule: data.recurrenceRule,
        status: data.status || "confirmed",
        visibility: data.visibility || "public",
        categoryId: data.categoryId,
        createdBy: session.user.id!,
        attendees: {
          create: [
            // Creator is always an organizer and attendee
            {
              userId: session.user.id!,
              status: "accepted",
              isOrganizer: true,
            },
            // Add other attendees
            ...(data.attendeeIds || [])
              .filter((id) => id !== session.user.id)
              .map((userId) => ({
                userId,
                status: "pending" as const,
                isOrganizer: false,
              })),
          ],
        },
        reminders: {
          create: (data.reminders || []).map((reminder) => ({
            userId: reminder.userId,
            reminderTime: new Date(reminder.reminderTime),
            type: reminder.type || "notification",
          })),
        },
      },
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

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
