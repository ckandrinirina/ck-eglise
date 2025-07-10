/**
 * Script to clear existing money goals before implementing categories
 */

import { PrismaClient } from "@prisma/client/index.js";

const prisma = new PrismaClient();

async function clearMoneyGoals() {
  try {
    console.log("🗑️  Deleting existing money goal contributions...");
    const deletedContributions =
      await prisma.moneyGoalContribution.deleteMany();
    console.log(`✅ Deleted ${deletedContributions.count} contributions`);

    console.log("🗑️  Deleting existing money goals...");
    const deletedGoals = await prisma.moneyGoal.deleteMany();
    console.log(`✅ Deleted ${deletedGoals.count} money goals`);

    console.log("✨ Successfully cleared all money goals data");
  } catch (error) {
    console.error("❌ Error clearing money goals:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearMoneyGoals();
