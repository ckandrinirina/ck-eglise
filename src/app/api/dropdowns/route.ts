import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for creating dropdowns
const createDropdownSchema = z
  .object({
    name: z.string().min(1),
    nameFr: z.string().nullable().optional(),
    nameMg: z.string().nullable().optional(),
    key: z.string().nullable().optional(),
    isParent: z.boolean().default(false),
    parentId: z.string().nullable().optional(),
    isEnabled: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Key is required if dropdown is a parent
      if (data.isParent && (!data.key || data.key.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Key is required for parent categories",
      path: ["key"],
    },
  );

// GET /api/dropdowns - Get all dropdowns with optional filters
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const isParent = searchParams.get("isParent") === "true";
    const includeDisabled = searchParams.get("includeDisabled") === "true";

    // Build where clause based on filter parameters
    const where: Record<string, unknown> = {};

    // Filter by parent ID if provided
    if (parentId) {
      where.parentId = parentId;
    }

    // Filter for only parent items if requested
    if (searchParams.has("isParent")) {
      where.isParent = isParent;
    }

    // By default, only return enabled dropdowns unless includeDisabled is true
    if (!includeDisabled) {
      where.isEnabled = true;
    }

    // Fetch dropdowns with filters
    const dropdowns = await prisma.dropdown.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            nameMg: true,
            key: true,
            isParent: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            nameMg: true,
            key: true,
            isEnabled: true,
          },
          where: includeDisabled ? undefined : { isEnabled: true },
        },
      },
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

    const { name, nameFr, nameMg, key, isParent, parentId, isEnabled } =
      validation.data;

    // Validate parent-child relationship
    if (parentId) {
      const parentExists = await prisma.dropdown.findUnique({
        where: { id: parentId },
      });

      if (!parentExists) {
        return new NextResponse("Parent dropdown not found", { status: 400 });
      }

      if (!parentExists.isParent) {
        return new NextResponse("Selected parent is not a parent type", {
          status: 400,
        });
      }
    }

    // Check if key is unique if provided
    if (key) {
      const existingDropdown = await prisma.dropdown.findFirst({
        where: { key },
      });

      if (existingDropdown) {
        return new NextResponse("Key must be unique", { status: 400 });
      }
    }

    // Create dropdown
    const dropdown = await prisma.dropdown.create({
      data: {
        name,
        nameFr,
        nameMg,
        key: isParent ? key : null, // Only set key for parent dropdowns
        isParent,
        parentId,
        isEnabled: isEnabled ?? true,
      },
    });

    return NextResponse.json(dropdown, { status: 201 });
  } catch (error) {
    console.error("Error creating dropdown:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
