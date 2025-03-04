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

    // Check if parent function exists
    const existingFunctionParent = await prisma.dropdown.findUnique({
      where: {
        key: "function",
      },
    });

    // Create parent function if it doesn't exist
    const parentFunction =
      existingFunctionParent ||
      (await prisma.dropdown.create({
        data: {
          name: "Function",
          nameFr: "Fonction",
          nameMg: "Andraikitra",
          key: "function",
          isParent: true,
          isEnabled: true,
        },
      }));

    console.log("Parent function created or found:", parentFunction.name);

    // Define child functions
    const functions = [
      {
        name: "MPANDRAY",
        nameFr: "MPANDRAY",
        nameMg: "MPANDRAY",
        isEnabled: true,
      },
      {
        name: "DIAKONA",
        nameFr: "DIAKONA",
        nameMg: "DIAKONA",
        isEnabled: true,
      },
    ];

    // Create child functions
    for (const functionItem of functions) {
      const existingChild = await prisma.dropdown.findFirst({
        where: {
          name: functionItem.name,
          parentId: parentFunction.id,
        },
      });

      if (!existingChild) {
        const child = await prisma.dropdown.create({
          data: {
            ...functionItem,
            parentId: parentFunction.id,
          },
        });
        console.log(`Created function: ${child.name}`);
      } else {
        console.log(`Function ${functionItem.name} already exists`);
      }
    }
  } catch (error) {
    console.error("Error seeding dropdowns:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
