/**
 * @file Transactions summary API routes
 * @description API endpoint for transaction summary statistics
 * @module api/transactions/summary
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * GET handler for retrieving transaction summary
 *
 * @route {GET} /api/transactions/summary
 * @access authenticated
 * @query {string} startDate - Optional start date filter
 * @query {string} endDate - Optional end date filter
 * @returns {Response} JSON response with transaction summary
 */
export async function GET(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    const dateFilter: Prisma.TransactionWhereInput = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};

      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }

      if (endDate) {
        dateFilter.createdAt.lte = new Date(endDate);
      }
    }

    // Get total transactions count
    const transactionCount = await prisma.transaction.count({
      where: dateFilter,
    });

    // Get credit transactions sum
    const creditTransactions = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        ...dateFilter,
        type: "credit",
      },
    });

    // Get debit transactions sum
    const debitTransactions = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        ...dateFilter,
        type: "debit",
      },
    });

    // Calculate totals
    const totalCredit = creditTransactions._sum.amount || 0;
    const totalDebit = debitTransactions._sum.amount || 0;
    const netTotal = totalCredit - totalDebit;

    return NextResponse.json({
      count: transactionCount,
      credit: totalCredit,
      debit: totalDebit,
      total: netTotal,
    });
  } catch (error) {
    console.error("Error calculating transaction summary:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
