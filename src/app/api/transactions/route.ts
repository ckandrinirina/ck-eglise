/**
 * @file Transactions API routes
 * @description API endpoints for transaction management
 * @module api/transactions
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { transactionSchema } from "@/types/transactions";
import { z } from "zod";
import { Prisma } from "@prisma/client";

/**
 * GET handler for retrieving transactions
 *
 * @route {GET} /api/transactions
 * @access authenticated
 * @query {string} type - Optional transaction type filter
 * @query {string} transactionTypeId - Optional transaction type ID filter
 * @returns {Response} JSON response with transactions
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
    const type = searchParams.get("type");
    const transactionTypeId = searchParams.get("transactionTypeId");

    // Build query with proper typing
    const where: Prisma.TransactionWhereInput = {};
    if (type === "credit" || type === "debit") {
      where.type = type;
    }
    if (transactionTypeId) {
      where.transactionTypeId = transactionTypeId;
    }

    // Fetch transactions with user information
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        transactionType: {
          select: {
            name: true,
            nameFr: true,
            nameMg: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to include userName
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      reason: transaction.reason,
      userId: transaction.userId,
      userName: transaction.user.name,
      transactionTypeId: transaction.transactionTypeId,
      transactionTypeName:
        transaction.transactionType?.nameFr ||
        transaction.transactionType?.name ||
        null,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * POST handler for creating transactions
 *
 * @route {POST} /api/transactions
 * @access authenticated
 * @body {object} transaction data
 * @returns {Response} JSON response with created transaction
 */
export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check admin role for creating transactions
    if (session.user.role !== "admin") {
      return new NextResponse("Forbidden: Admin role required", {
        status: 403,
      });
    }

    // Parse and validate request body
    const body = await request.json();

    try {
      const validatedData = transactionSchema.parse(body);

      // Verify user exists
      const userExists = await prisma.user.findUnique({
        where: { id: validatedData.userId },
      });

      if (!userExists) {
        return new NextResponse("User not found", { status: 404 });
      }

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          amount: validatedData.amount,
          type: validatedData.type,
          reason: validatedData.reason,
          userId: validatedData.userId,
          transactionTypeId: validatedData.transactionTypeId || null,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          transactionType: {
            select: {
              name: true,
              nameFr: true,
              nameMg: true,
            },
          },
        },
      });

      // Format response
      const formattedTransaction = {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        reason: transaction.reason,
        userId: transaction.userId,
        userName: transaction.user.name,
        transactionTypeId: transaction.transactionTypeId,
        transactionTypeName:
          transaction.transactionType?.nameFr ||
          transaction.transactionType?.name ||
          null,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
      };

      return NextResponse.json(formattedTransaction, { status: 201 });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return new NextResponse(
          JSON.stringify({
            errors: validationError.errors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error("Error creating transaction:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
