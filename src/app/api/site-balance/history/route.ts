/**
 * @file Site balance history API route
 * @description API endpoint for site balance history data
 * @module api/site-balance/history
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * GET handler for retrieving site balance history
 *
 * @route {GET} /api/site-balance/history
 * @access authenticated
 * @query {string} limit - Optional limit of entries to return (default: 30)
 * @returns {Response} JSON response with balance history
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
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 30;

    // Get balance history
    const balanceHistory = await prisma.siteBalance.findMany({
      select: {
        amount: true,
        updatedAt: true,
        transaction: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
      take: -limit, // Take the latest entries
    });

    // Format the response
    const formattedHistory = balanceHistory.map((entry) => ({
      amount: entry.amount,
      date: entry.updatedAt.toISOString(),
      transactionType: entry.transaction?.type || null,
      transactionAmount: entry.transaction?.amount || null,
    }));

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error("Error fetching site balance history:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
