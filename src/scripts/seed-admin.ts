// src/scripts/seed-admin.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("Azerty*123", 12);

  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: "admin-ck-eglise@yopmail.com",
      },
    });

    if (!existingAdmin) {
      const admin = await prisma.user.create({
        data: {
          email: "admin-ck-eglise@yopmail.com",
          name: "Admin User",
          password: password,
          role: "admin",
        },
      });

      console.log(`Created admin user with email: ${admin.email}`);
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
