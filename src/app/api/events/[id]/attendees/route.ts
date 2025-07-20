/**
 * API endpoint for event attendee management
 *
 * @route {PUT} /api/events/[id]/attendees
 * @access private
 * @description Handles attendee status updates
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeDB } from "@/lib/db";
import { AttendeeStatus } from "@/types/events";

/**
 * PUT /api/events/[id]/attendees - Update attendee status
 *
 * @async
 * @param {NextRequest} request - The request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Event ID
 * @returns {Promise<NextResponse>} Updated attendee
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

    const { status }: { status: AttendeeStatus } = await request.json();

    if (!["pending", "accepted", "declined", "tentative"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid attendee status" },
        { status: 400 },
      );
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user is an attendee
    const attendee = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id!,
        },
      },
    });

    if (!attendee) {
      return NextResponse.json(
        { error: "You are not an attendee of this event" },
        { status: 403 },
      );
    }

    // Update attendee status
    const updatedAttendee = await prisma.eventAttendee.update({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id!,
        },
      },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    await prisma.$disconnect();

    return NextResponse.json(updatedAttendee);
  } catch (error) {
    console.error("Error updating attendee status:", error);
    return NextResponse.json(
      { error: "Failed to update attendee status" },
      { status: 500 },
    );
  }
}
