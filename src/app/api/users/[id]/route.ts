import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export type UserBodyPut = {
  name: string;
  email: string;
  role: string;
  gender?: "male" | "female";
  phone?: string;
  password?: string;
  territoryId: string;
  functionIds?: string[];
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      email,
      role,
      phone,
      gender,
      territoryId,
      functionIds,
    }: UserBodyPut = body;

    // Prepare update data
    const data: Prisma.UserUpdateInput = {
      name,
      email,
      role,
      phone,
      gender,
      territory: territoryId
        ? {
            connect: { id: territoryId },
          }
        : undefined,
    };

    // Handle function updates if provided
    if (functionIds !== undefined) {
      // First disconnect all existing functions
      await prisma.user.update({
        where: { id },
        data: {
          functions: {
            set: [], // Clear existing connections
          },
        },
      });

      // Then connect new functions if any
      if (functionIds?.length) {
        data.functions = {
          connect: functionIds.map((fId) => ({ id: fId })),
        };
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data,
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
    console.error(error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Prevent deleting self
    const { id } = await params;
    if (session.user.id === id) {
      return new NextResponse("Cannot delete own account", { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
