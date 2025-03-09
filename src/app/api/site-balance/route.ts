/**
 * @file Site balance API routes
 * @description API endpoints for site balance management
 * @module api/site-balance
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * GET handler for retrieving current site balance
 *
 * @route {GET} /api/site-balance
 * @access authenticated
 * @returns {Response} JSON response with site balance
 */
export async function GET() {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the current balance or create a default one if it doesn't exist
    let balance = await prisma.siteBalance.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!balance) {
      // Calculate balance from transactions
      const creditSum = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          type: "credit",
        },
      });

      const debitSum = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          type: "debit",
        },
      });

      const totalCredit = creditSum._sum.amount || 0;
      const totalDebit = debitSum._sum.amount || 0;
      const calculatedBalance = totalCredit - totalDebit;

      // Create initial balance
      balance = await prisma.siteBalance.create({
        data: {
          amount: calculatedBalance,
        },
      });
    }

    return NextResponse.json({
      amount: balance.amount,
      updatedAt: balance.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching site balance:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
