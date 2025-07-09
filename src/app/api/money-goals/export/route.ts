/**
 * API endpoint for money goals export data
 *
 * @route {GET} /api/money-goals/export
 * @access private
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  MoneyGoalFilters,
  MoneyGoalExportData,
  MoneyGoalWithStats,
  MoneyGoalSummary,
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
    const goalsWithStats: MoneyGoalWithStats[] = goals.map(
      (goal: {
        contributions: { amount: number }[];
        amountGoal: number;
        editHistory: string | null;
        [key: string]: unknown;
      }) => {
        const totalContributions = goal.contributions.reduce(
          (sum: number, contrib: { amount: number }) => sum + contrib.amount,
          0,
        );
        const progressPercentage =
          goal.amountGoal > 0
            ? (totalContributions / goal.amountGoal) * 100
            : 0;

        return {
          ...goal,
          editHistory: goal.editHistory ? JSON.parse(goal.editHistory) : [],
          totalContributions,
          reachedGoal: totalContributions,
          progressPercentage: Math.min(progressPercentage, 100),
          remainingAmount: Math.max(goal.amountGoal - totalContributions, 0),
        } as MoneyGoalWithStats;
      },
    );

    // Calculate summary statistics
    const totalGoals = goalsWithStats.length;
    const activeGoals = goalsWithStats.filter(
      (g) => g.status === "active",
    ).length;
    const completedGoals = goalsWithStats.filter(
      (g) => g.status === "completed",
    ).length;
    const totalTargetAmount = goalsWithStats.reduce(
      (sum, goal) => sum + goal.amountGoal,
      0,
    );
    const totalReachedAmount = goalsWithStats.reduce(
      (sum, goal) => sum + goal.reachedGoal,
      0,
    );
    const overallProgress =
      totalTargetAmount > 0
        ? (totalReachedAmount / totalTargetAmount) * 100
        : 0;

    const summary: MoneyGoalSummary = {
      totalGoals,
      activeGoals,
      completedGoals,
      totalTargetAmount,
      totalReachedAmount,
      overallProgress: Math.min(overallProgress, 100),
    };

    const exportData: MoneyGoalExportData = {
      goals: goalsWithStats,
      summary,
      filters,
      exportDate: new Date().toISOString(),
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Error exporting money goals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
