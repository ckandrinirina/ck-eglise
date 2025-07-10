/*
  Warnings:

  - Added the required column `categoryId` to the `MoneyGoal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "MoneyGoalCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameFr" TEXT,
    "nameMg" TEXT,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MoneyGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amountGoal" REAL NOT NULL,
    "years" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "categoryId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "editHistory" TEXT DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MoneyGoal_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MoneyGoalCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MoneyGoal_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MoneyGoal" ("amountGoal", "createdAt", "createdBy", "editHistory", "id", "name", "status", "updatedAt", "years") SELECT "amountGoal", "createdAt", "createdBy", "editHistory", "id", "name", "status", "updatedAt", "years" FROM "MoneyGoal";
DROP TABLE "MoneyGoal";
ALTER TABLE "new_MoneyGoal" RENAME TO "MoneyGoal";
CREATE INDEX "MoneyGoal_createdBy_idx" ON "MoneyGoal"("createdBy");
CREATE INDEX "MoneyGoal_years_idx" ON "MoneyGoal"("years");
CREATE INDEX "MoneyGoal_status_idx" ON "MoneyGoal"("status");
CREATE INDEX "MoneyGoal_categoryId_idx" ON "MoneyGoal"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "MoneyGoalCategory_isEnabled_idx" ON "MoneyGoalCategory"("isEnabled");
