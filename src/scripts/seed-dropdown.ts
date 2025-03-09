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
    const functionParent =
      existingFunctionParent ||
      (await prisma.dropdown.create({
        data: {
          key: "function",
          name: "Functions",
          nameFr: "Fonctions",
          nameMg: "Andraikitra",
          isParent: true,
          isEnabled: true,
        },
      }));

    console.log("Parent function created or found:", functionParent.name);

    // Create function options
    const functions = [
      {
        name: "Pastor",
        nameFr: "Pasteur",
        nameMg: "Pasitera",
        isEnabled: true,
      },
      {
        name: "Deacon",
        nameFr: "Diacre",
        nameMg: "Diakona",
        isEnabled: true,
      },
      {
        name: "Elder",
        nameFr: "Ancien",
        nameMg: "Loholona",
        isEnabled: true,
      },
      {
        name: "Secretary",
        nameFr: "Secrétaire",
        nameMg: "Mpitantsoratra",
        isEnabled: true,
      },
      {
        name: "Treasurer",
        nameFr: "Trésorier",
        nameMg: "Mpitahiry vola",
        isEnabled: true,
      },
    ];

    // Create function options if they don't exist
    for (const func of functions) {
      const existingFunction = await prisma.dropdown.findFirst({
        where: {
          name: func.name,
          parentId: functionParent.id,
        },
      });

      if (!existingFunction) {
        const newFunc = await prisma.dropdown.create({
          data: {
            ...func,
            parentId: functionParent.id,
          },
        });
        console.log(`Created function: ${newFunc.name}`);
      } else {
        console.log(`Function ${func.name} already exists`);
      }
    }

    console.log("Function dropdowns seeded successfully");

    // Check if parent transaction type exists
    const existingTransactionTypeParent = await prisma.dropdown.findUnique({
      where: {
        key: "transaction-type",
      },
    });

    // Create parent transaction type if it doesn't exist
    const transactionTypeParent =
      existingTransactionTypeParent ||
      (await prisma.dropdown.create({
        data: {
          key: "transaction-type",
          name: "Transaction Types",
          nameFr: "Types de Transaction",
          nameMg: "Karazana Famindram-bola",
          isParent: true,
          isEnabled: true,
        },
      }));

    console.log(
      "Parent transaction type created or found:",
      transactionTypeParent.name,
    );

    // Create transaction type options
    const transactionTypes = [
      {
        name: "Contribution",
        nameFr: "Cotisation",
        nameMg: "Anjara vola",
        isEnabled: true,
      },
      {
        name: "Fuel",
        nameFr: "Carburant",
        nameMg: "Solika",
        isEnabled: true,
      },
      {
        name: "Rent",
        nameFr: "Loyer",
        nameMg: "Hofan-trano",
        isEnabled: true,
      },
      {
        name: "Salary",
        nameFr: "Salaire",
        nameMg: "Karama",
        isEnabled: true,
      },
      {
        name: "Donation",
        nameFr: "Don",
        nameMg: "Fanomezana",
        isEnabled: true,
      },
      {
        name: "Other",
        nameFr: "Autre",
        nameMg: "Hafa",
        isEnabled: true,
      },
    ];

    // Create transaction type options if they don't exist
    for (const type of transactionTypes) {
      const existingType = await prisma.dropdown.findFirst({
        where: {
          name: type.name,
          parentId: transactionTypeParent.id,
        },
      });

      if (!existingType) {
        const newType = await prisma.dropdown.create({
          data: {
            ...type,
            parentId: transactionTypeParent.id,
          },
        });
        console.log(`Created transaction type: ${newType.name}`);
      } else {
        console.log(`Transaction type ${type.name} already exists`);
      }
    }

    console.log("Transaction type dropdowns seeded successfully");
  } catch (error) {
    console.error("Error seeding dropdowns:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
