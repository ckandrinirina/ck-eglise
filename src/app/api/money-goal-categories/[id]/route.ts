/**
 * API endpoint for individual money goal category operations
 *
 * @route {GET} /api/money-goal-categories/[id]
 * @route {PUT} /api/money-goal-categories/[id]
 * @route {DELETE} /api/money-goal-categories/[id]
 * @access private
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { UpdateMoneyGoalCategoryRequest } from "@/types/money-goals";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params in Next.js 15
    const { id } = await params;

    // Fetch category with goals count
    const category = await prisma.moneyGoalCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            goals: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching money goal category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update categories
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Await params in Next.js 15
    const { id } = await params;

    // Parse request body
    const body: UpdateMoneyGoalCategoryRequest = await request.json();

    // Check if category exists
    const existingCategory = await prisma.moneyGoalCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    if (body.nameFr !== undefined) {
      updateData.nameFr = body.nameFr;
    }
    if (body.nameMg !== undefined) {
      updateData.nameMg = body.nameMg;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.color !== undefined) {
      updateData.color = body.color;
    }
    if (body.icon !== undefined) {
      updateData.icon = body.icon;
    }
    if (body.isEnabled !== undefined) {
      updateData.isEnabled = body.isEnabled;
    }

    // Update category
    const updatedCategory = await prisma.moneyGoalCategory.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            goals: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating money goal category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete categories
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Await params in Next.js 15
    const { id } = await params;

    // Check if category exists and has goals
    const category = await prisma.moneyGoalCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            goals: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Prevent deletion if category has goals
    if (category._count.goals > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete category with existing goals. Move or delete the goals first.",
        },
        { status: 400 },
      );
    }

    // Delete category
    await prisma.moneyGoalCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting money goal category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
