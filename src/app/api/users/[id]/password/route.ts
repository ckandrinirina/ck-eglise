import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    // Ensure user is authenticated and is either an admin or the owner of the account
    if (!session || (session.user.id !== id && session.user.role !== "admin")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user || !user.password) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify current password
    const passwordMatch = await compare(currentPassword, user.password);
    if (!passwordMatch) {
      return new NextResponse("Current password is incorrect", { status: 400 });
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Password update error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
