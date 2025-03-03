import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for creating dropdowns
const createDropdownSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["territory", "role", "branch"]),
});

// GET /api/dropdowns - Get all dropdowns with optional type filter
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Fetch dropdowns with optional filter
    const dropdowns = await prisma.dropdown.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(dropdowns);
  } catch (error) {
    console.error("Error fetching dropdowns:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/dropdowns - Create a new dropdown
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createDropdownSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ");
      return new NextResponse(`Invalid data: ${errorMessage}`, { status: 400 });
    }

    const { name, type } = validation.data;

    // Create dropdown
    const dropdown = await prisma.dropdown.create({
      data: {
        name,
        type,
      },
    });

    return NextResponse.json(dropdown, { status: 201 });
  } catch (error) {
    console.error("Error creating dropdown:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
