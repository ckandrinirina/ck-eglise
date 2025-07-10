/**
 * Script to seed default money goal categories
 */

import { PrismaClient } from "@prisma/client/index.js";

const prisma = new PrismaClient();

const defaultCategories = [
  {
    name: "Money Out Goal",
    nameFr: "Objectif de Sortie d'Argent",
    nameMg: "Tanjona Fivoahan'ny Vola",
    description: "Goals for managing and tracking outgoing expenses",
    color: "#ef4444", // red
    icon: "TrendingDown",
  },
  {
    name: "Money In Goal",
    nameFr: "Objectif d'Entrée d'Argent",
    nameMg: "Tanjona Fidiran'ny Vola",
    description: "Goals for income generation and revenue targets",
    color: "#22c55e", // green
    icon: "TrendingUp",
  },
  {
    name: "Economy Goal",
    nameFr: "Objectif d'Économie",
    nameMg: "Tanjona Fitsitsiana",
    description: "Goals for saving money and building reserves",
    color: "#3b82f6", // blue
    icon: "PiggyBank",
  },
  {
    name: "Fun Party Goal",
    nameFr: "Objectif de Fête",
    nameMg: "Tanjona Fety",
    description: "Goals for entertainment, events and celebrations",
    color: "#8b5cf6", // purple
    icon: "PartyPopper",
  },
  {
    name: "Build House Goal",
    nameFr: "Objectif de Construction de Maison",
    nameMg: "Tanjona Fanorenana Trano",
    description: "Goals for construction and property development",
    color: "#f59e0b", // amber
    icon: "Home",
  },
  {
    name: "Education Goal",
    nameFr: "Objectif d'Éducation",
    nameMg: "Tanjona Fampianarana",
    description: "Goals for educational expenses and development",
    color: "#06b6d4", // cyan
    icon: "GraduationCap",
  },
  {
    name: "Health Goal",
    nameFr: "Objectif de Santé",
    nameMg: "Tanjona Fahasalamana",
    description: "Goals for healthcare and medical expenses",
    color: "#10b981", // emerald
    icon: "Heart",
  },
  {
    name: "Emergency Fund",
    nameFr: "Fonds d'Urgence",
    nameMg: "Tahiry ho an'ny Maika",
    description: "Goals for emergency preparedness and unexpected expenses",
    color: "#dc2626", // red-600
    icon: "AlertTriangle",
  },
];

async function seedCategories() {
  try {
    console.log("🌱 Seeding money goal categories...");

    for (const categoryData of defaultCategories) {
      const existingCategory = await prisma.moneyGoalCategory.findFirst({
        where: { name: categoryData.name },
      });

      if (!existingCategory) {
        const category = await prisma.moneyGoalCategory.create({
          data: categoryData,
        });
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${categoryData.name}`);
      }
    }

    console.log("✨ Successfully seeded money goal categories");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
