/**
 * @file Users API routes
 * @description API endpoints for user management
 * @module api/users
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { hash } from "bcrypt";
import { Prisma } from "@prisma/client";

export type UserBodyPost = {
  name: string;
  email: string;
  role: string;
  password: string;
  gender?: "male" | "female";
  phone?: string;
  territoryId: string;
  functionIds?: string[];
};

/**
 * GET handler for retrieving users
 *
 * @route {GET} /api/users
 * @access authenticated
 * @query {string} role - Optional role filter
 * @returns {Response} JSON response with users
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
    const role = searchParams.get("role");

    // Build query with proper typing
    const where: Prisma.UserWhereInput = {};
    if (role) {
      where.role = role;
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        phone: true,
        territory: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            nameMg: true,
          },
        },
        functions: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            nameMg: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST new user
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const {
      name,
      email,
      password,
      role,
      gender,
      phone,
      territoryId,
      functionIds,
    }: UserBodyPost = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    console.log("functionIds", functionIds);

    // Create user with functions
    const user = await prisma.user.create({
      data: {
        name,
        email,
        gender,
        role,
        phone,
        territoryId,
        password: hashedPassword,
        functions: functionIds?.length
          ? { connect: functionIds.map((id) => ({ id })) }
          : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        role: true,
        territoryId: true,
        territory: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            nameMg: true,
          },
        },
        functions: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            nameMg: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
