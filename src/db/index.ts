import { PrismaClient } from "@prisma/client";
import config from "./config";

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env as keyof typeof config];

// Create Prisma instance with appropriate logging based on environment
export const prisma = new PrismaClient({
  log: dbConfig.logging ? ["query", "info", "warn", "error"] : ["error"],
});

export const initializeDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

export default prisma;
