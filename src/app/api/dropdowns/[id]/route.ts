import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for updating dropdowns
const updateDropdownSchema = z.object({
  name: z.string().min(1).optional(),
  nameFr: z.string().nullable().optional(),
  nameMg: z.string().nullable().optional(),
  isParent: z.boolean().optional(),
  parentId: z.string().nullable().optional(),
  isEnabled: z.boolean().optional(),
});

// GET /api/dropdowns/[id] - Get a specific dropdown
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return new NextResponse("Missing dropdown ID", { status: 400 });
    }

    // Fetch dropdown by ID with parent and children
    const dropdown = await prisma.dropdown.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            nameMg: true,
            isParent: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            nameMg: true,
            isEnabled: true,
          },
        },
      },
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
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

    const { isParent, parentId } = validation.data;

    // Check if dropdown exists
    const existingDropdown = await prisma.dropdown.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!existingDropdown) {
      return new NextResponse("Dropdown not found", { status: 404 });
    }

    // Validate parent-child relationship if parentId is provided
    if (parentId !== undefined) {
      // Cannot set parent to itself
      if (parentId === id) {
        return new NextResponse("Cannot set dropdown as its own parent", {
          status: 400,
        });
      }

      // Only check if parentId is not null (meaning it will have a parent)
      if (parentId !== null) {
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

        // Prevent circular references
        // Check if the target parent is not a child of the current dropdown
        const isCircular = await checkCircularReference(id, parentId);
        if (isCircular) {
          return new NextResponse(
            "Circular parent-child relationship detected",
            { status: 400 },
          );
        }
      }
    }

    // If changing isParent from true to false, check if it has children
    if (
      existingDropdown.isParent &&
      isParent === false &&
      existingDropdown.children.length > 0
    ) {
      return new NextResponse(
        "Cannot change to child type while dropdown has children",
        { status: 400 },
      );
    }

    // Update dropdown
    const updated = await prisma.dropdown.update({
      where: { id },
      data: validation.data,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            nameMg: true,
            isParent: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            nameMg: true,
            isEnabled: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating dropdown:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Helper function to check for circular references
async function checkCircularReference(
  currentId: string,
  targetParentId: string,
): Promise<boolean> {
  // Resolve all parents of targetParentId to check if currentId is in the chain
  let parentId = targetParentId;
  const visitedIds = new Set<string>();

  while (parentId) {
    // If we've already seen this ID, there's a circular reference
    if (visitedIds.has(parentId)) {
      return true;
    }

    // If the current item is in the parent chain, there's a circular reference
    if (parentId === currentId) {
      return true;
    }

    visitedIds.add(parentId);

    // Get the parent of the current item
    const parent = await prisma.dropdown.findUnique({
      where: { id: parentId },
      select: { parentId: true },
    });

    // Break the loop if no parent found
    if (!parent || !parent.parentId) {
      break;
    }

    parentId = parent.parentId;
  }

  return false;
}

// DELETE /api/dropdowns/[id] - Delete a specific dropdown
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return new NextResponse("Missing dropdown ID", { status: 400 });
    }

    // Check if dropdown exists and if it has children
    const existingDropdown = await prisma.dropdown.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!existingDropdown) {
      return new NextResponse("Dropdown not found", { status: 404 });
    }

    // Instead of deletion, just disable the dropdown
    const updated = await prisma.dropdown.update({
      where: { id },
      data: { isEnabled: false },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error disabling dropdown:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
