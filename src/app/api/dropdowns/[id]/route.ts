import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for updating dropdowns
const updateDropdownSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["territory", "role", "branch"]).optional(),
});

// GET /api/dropdowns/[id] - Get a specific dropdown
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return new NextResponse("Missing dropdown ID", { status: 400 });
    }

    // Fetch dropdown by ID
    const dropdown = await prisma.dropdown.findUnique({
      where: { id },
    });

    if (!dropdown) {
      return new NextResponse("Dropdown not found", { status: 404 });
    }

    return NextResponse.json(dropdown);
  } catch (error) {
    console.error("Error fetching dropdown:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/dropdowns/[id] - Update a specific dropdown
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return new NextResponse("Missing dropdown ID", { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateDropdownSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ");
      return new NextResponse(`Invalid data: ${errorMessage}`, { status: 400 });
    }

    // Check if dropdown exists
    const existingDropdown = await prisma.dropdown.findUnique({
      where: { id },
    });

    if (!existingDropdown) {
      return new NextResponse("Dropdown not found", { status: 404 });
    }

    // Update dropdown
    const updated = await prisma.dropdown.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating dropdown:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/dropdowns/[id] - Delete a specific dropdown
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return new NextResponse("Missing dropdown ID", { status: 400 });
    }

    // Check if dropdown exists
    const existingDropdown = await prisma.dropdown.findUnique({
      where: { id },
    });

    if (!existingDropdown) {
      return new NextResponse("Dropdown not found", { status: 404 });
    }

    // Delete dropdown
    await prisma.dropdown.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting dropdown:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
