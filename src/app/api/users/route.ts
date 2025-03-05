import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export type UserBodyPost = {
  name: string;
  email: string;
  role: string;
  password: string;
  phone?: string;
  territoryId: string;
  functionIds?: string[];
};

// GET all users with optional role filter
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get role from query params
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    // Query users with optional role filter
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
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
      orderBy: {
        createdAt: "desc",
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

    // Create user with functions
    const user = await prisma.user.create({
      data: {
        name,
        email,
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
