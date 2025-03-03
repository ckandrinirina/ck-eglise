// src/scripts/seed-dropdown.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if parent territory exists
    const existingParent = await prisma.dropdown.findUnique({
      where: {
        key: "territory",
      },
    });

    // Create parent territory if it doesn't exist
    const parentTerritory =
      existingParent ||
      (await prisma.dropdown.create({
        data: {
          name: "Territory",
          nameFr: "Territoire",
          nameMg: "Faritra",
          key: "territory",
          isParent: true,
          isEnabled: true,
        },
      }));

    console.log("Parent territory created or found:", parentTerritory.name);

    // Define child territories
    const territories = [
      {
        name: "BEFETRIKA",
        nameFr: "BEFETRIKA",
        nameMg: "BEFETRIKA",
        isEnabled: true,
      },
      {
        name: "AVARADOZOKA",
        nameFr: "AVARADOZOKA",
        nameMg: "AVARADOZOKA",
        isEnabled: true,
      },
    ];

    // Create child territories
    for (const territory of territories) {
      const existingChild = await prisma.dropdown.findFirst({
        where: {
          name: territory.name,
          parentId: parentTerritory.id,
        },
      });

      if (!existingChild) {
        const child = await prisma.dropdown.create({
          data: {
            ...territory,
            parentId: parentTerritory.id,
          },
        });
        console.log(`Created territory: ${child.name}`);
      } else {
        console.log(`Territory ${territory.name} already exists`);
      }
    }
  } catch (error) {
    console.error("Error seeding dropdowns:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
