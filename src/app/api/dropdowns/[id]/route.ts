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
  key: z.string().nullable().optional(),
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

    const { isParent, parentId, key } = validation.data;

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

    // Check if key is provided and if dropdown will be or is currently a parent
    const willBeParent =
      isParent !== undefined ? isParent : existingDropdown.isParent;

    if (willBeParent) {
      // Key is required for parent dropdowns
      const keyToUse = key !== undefined ? key : existingDropdown.key;

      if (!keyToUse) {
        return new NextResponse("Key is required for parent categories", {
          status: 400,
        });
      }

      // Check if key already exists on another dropdown
      if (key !== undefined && key !== existingDropdown.key) {
        const duplicateKey = await prisma.dropdown.findFirst({
          where: {
            key,
            id: { not: id }, // Exclude current dropdown
          },
        });

        if (duplicateKey) {
          return new NextResponse("Key must be unique", { status: 400 });
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

    // Prepare data to update, ensuring key is null if not parent
    const updateData = {
      ...validation.data,
      key: willBeParent ? (key ?? existingDropdown.key) : null,
    };

    // Update dropdown
    const updated = await prisma.dropdown.update({
      where: { id },
      data: updateData,
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
  // Check if the target parent is actually a child of the current dropdown
  const targetParent = await prisma.dropdown.findUnique({
    where: { id: targetParentId },
  });

  if (!targetParent) {
    return false; // Target parent doesn't exist, no circular reference
  }

  // If target parent has no parent, no circular reference
  if (!targetParent.parentId) {
    return false;
  }

  // Check if the target parent's parent is the current dropdown
  if (targetParent.parentId === currentId) {
    return true; // Direct circular reference found
  }

  // Recursively check up the parent chain
  return await checkCircularReference(currentId, targetParent.parentId);
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
