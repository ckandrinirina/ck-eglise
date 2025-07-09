/**
 * API endpoint for money goals management
 *
 * @route {GET} /api/money-goals
 * @route {POST} /api/money-goals
 * @access private
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  MoneyGoalFilters,
  CreateMoneyGoalRequest,
  MoneyGoalWithStats,
} from "@/types/money-goals";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters: MoneyGoalFilters = {
      years: searchParams.get("years")
        ? parseInt(searchParams.get("years")!)
        : undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    };

    // Build where clause
    const whereClause: Record<string, unknown> = {};

    if (filters.years) {
      whereClause.years = filters.years;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.search) {
      whereClause.OR = [{ name: { contains: filters.search } }];
    }

    // If no year filter provided, default to current year
    if (!filters.years) {
      whereClause.years = new Date().getFullYear();
    }

    // Fetch goals with relations
    const goals = await prisma.moneyGoal.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contributions: {
          include: {
            contributor: {
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
        createdAt: "desc",
      },
    });

    // Transform to MoneyGoalWithStats
    const goalsWithStats: MoneyGoalWithStats[] = goals.map((goal) => {
      const totalContributions = goal.contributions.reduce(
        (sum: number, contrib: { amount: number }) => sum + contrib.amount,
        0,
      );
      const progressPercentage =
        goal.amountGoal > 0 ? (totalContributions / goal.amountGoal) * 100 : 0;

      return {
        ...goal,
        editHistory: goal.editHistory ? JSON.parse(goal.editHistory) : [],
        totalContributions,
        reachedGoal: totalContributions,
        progressPercentage: Math.min(progressPercentage, 100),
        remainingAmount: Math.max(goal.amountGoal - totalContributions, 0),
      } as MoneyGoalWithStats;
    });

    return NextResponse.json(goalsWithStats);
  } catch (error) {
    console.error("Error fetching money goals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: CreateMoneyGoalRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.amountGoal || !body.years) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create goal
    const goal = await prisma.moneyGoal.create({
      data: {
        name: body.name,
        amountGoal: body.amountGoal,
        years: body.years,
        createdBy: session.user.id || "",
        editHistory: JSON.stringify([]),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contributions: {
          include: {
            contributor: {
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

    return NextResponse.json({
      ...goal,
      editHistory: [],
    });
  } catch (error) {
    console.error("Error creating money goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
