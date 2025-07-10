/**
 * API endpoint for money goal categories management
 *
 * @route {GET} /api/money-goal-categories
 * @route {POST} /api/money-goal-categories
 * @access private
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { CreateMoneyGoalCategoryRequest } from "@/types/money-goals";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeDisabled = searchParams.get("includeDisabled") === "true";

    // Build where clause
    const whereClause: Record<string, unknown> = {};

    if (!includeDisabled) {
      whereClause.isEnabled = true;
    }

    // Fetch categories
    const categories = await prisma.moneyGoalCategory.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            goals: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching money goal categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create categories
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body: CreateMoneyGoalCategoryRequest = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create category
    const category = await prisma.moneyGoalCategory.create({
      data: {
        name: body.name,
        nameFr: body.nameFr || null,
        nameMg: body.nameMg || null,
        description: body.description || null,
        color: body.color || null,
        icon: body.icon || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating money goal category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
