/**
 * API endpoint for money goals summary statistics
 *
 * @route {GET} /api/money-goals/summary
 * @access private
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { MoneyGoalFilters, MoneyGoalSummary } from "@/types/money-goals";

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
      categoryId: searchParams.get("categoryId") || undefined,
    };

    // Build where clause
    const whereClause: Record<string, unknown> = {};

    if (filters.years) {
      whereClause.years = filters.years;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    // If no year filter provided, default to current year
    if (!filters.years) {
      whereClause.years = new Date().getFullYear();
    }

    // Fetch goals with contributions
    const goals = await prisma.moneyGoal.findMany({
      where: whereClause,
      include: {
        contributions: true,
      },
    });

    // Calculate summary statistics
    const totalGoals = goals.length;
    const activeGoals = goals.filter(
      (g: { status: string }) => g.status === "active",
    ).length;
    const completedGoals = goals.filter(
      (g: { status: string }) => g.status === "completed",
    ).length;
    const totalTargetAmount = goals.reduce(
      (sum: number, goal: { amountGoal: number }) => sum + goal.amountGoal,
      0,
    );

    const totalReachedAmount = goals.reduce(
      (sum: number, goal: { contributions: { amount: number }[] }) => {
        const goalContributions = goal.contributions.reduce(
          (goalSum: number, contrib: { amount: number }) =>
            goalSum + contrib.amount,
          0,
        );
        return sum + goalContributions;
      },
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

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching money goals summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
