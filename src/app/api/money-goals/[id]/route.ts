/**
 * API endpoint for individual money goal operations
 *
 * @route {GET} /api/money-goals/[id]
 * @route {PUT} /api/money-goals/[id]
 * @route {DELETE} /api/money-goals/[id]
 * @access private
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  UpdateMoneyGoalRequest,
  MoneyGoalWithStats,
  EditHistoryEntry,
} from "@/types/money-goals";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch goal with relations
    const goal = await prisma.moneyGoal.findUnique({
      where: { id: params.id },
      include: {
        category: true,
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

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Transform to MoneyGoalWithStats
    const totalContributions = goal.contributions.reduce(
      (sum: number, contrib: { amount: number }) => sum + contrib.amount,
      0,
    );
    const progressPercentage =
      goal.amountGoal > 0 ? (totalContributions / goal.amountGoal) * 100 : 0;

    const goalWithStats: MoneyGoalWithStats = {
      ...goal,
      editHistory: goal.editHistory ? JSON.parse(goal.editHistory) : [],
      totalContributions,
      reachedGoal: totalContributions,
      progressPercentage: Math.min(progressPercentage, 100),
      remainingAmount: Math.max(goal.amountGoal - totalContributions, 0),
    } as MoneyGoalWithStats;

    return NextResponse.json(goalWithStats);
  } catch (error) {
    console.error("Error fetching money goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: UpdateMoneyGoalRequest = await request.json();

    // Fetch current goal to compare changes
    const currentGoal = await prisma.moneyGoal.findUnique({
      where: { id: params.id },
    });

    if (!currentGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const changes: EditHistoryEntry["changes"] = [];

    if (body.name !== undefined && body.name !== currentGoal.name) {
      updateData.name = body.name;
      changes.push({
        field: "name",
        previousValue: currentGoal.name,
        newValue: body.name,
      });
    }

    if (
      body.amountGoal !== undefined &&
      body.amountGoal !== currentGoal.amountGoal
    ) {
      updateData.amountGoal = body.amountGoal;
      changes.push({
        field: "amountGoal",
        previousValue: currentGoal.amountGoal,
        newValue: body.amountGoal,
      });
    }

    if (body.years !== undefined && body.years !== currentGoal.years) {
      updateData.years = body.years;
      changes.push({
        field: "years",
        previousValue: currentGoal.years,
        newValue: body.years,
      });
    }

    if (body.status !== undefined && body.status !== currentGoal.status) {
      updateData.status = body.status;
      changes.push({
        field: "status",
        previousValue: currentGoal.status,
        newValue: body.status,
      });
    }

    if (
      body.categoryId !== undefined &&
      body.categoryId !== currentGoal.categoryId
    ) {
      updateData.categoryId = body.categoryId;
      changes.push({
        field: "categoryId",
        previousValue: currentGoal.categoryId,
        newValue: body.categoryId,
      });
    }

    // If there are changes, update edit history
    if (changes.length > 0) {
      const currentHistory = currentGoal.editHistory
        ? JSON.parse(currentGoal.editHistory)
        : [];
      const newHistoryEntry: EditHistoryEntry = {
        timestamp: new Date().toISOString(),
        editedBy: session.user.id || "",
        editorName: session.user.name || session.user.email || "Unknown",
        changes,
      };

      updateData.editHistory = JSON.stringify([
        ...currentHistory,
        newHistoryEntry,
      ]);
    }

    // Update goal
    const updatedGoal = await prisma.moneyGoal.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
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
      ...updatedGoal,
      editHistory: updatedGoal.editHistory
        ? JSON.parse(updatedGoal.editHistory)
        : [],
    });
  } catch (error) {
    console.error("Error updating money goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if goal exists
    const goal = await prisma.moneyGoal.findUnique({
      where: { id: params.id },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Delete goal (this will cascade delete contributions)
    await prisma.moneyGoal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting money goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
