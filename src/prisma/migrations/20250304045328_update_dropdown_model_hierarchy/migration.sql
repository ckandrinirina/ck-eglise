/*
  Warnings:

  - You are about to drop the column `type` on the `Dropdown` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dropdown" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameFr" TEXT,
    "nameMg" TEXT,
    "isParent" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Dropdown_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Dropdown" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Dropdown" ("createdAt", "id", "name", "nameFr", "nameMg", "updatedAt") SELECT "createdAt", "id", "name", "nameFr", "nameMg", "updatedAt" FROM "Dropdown";
DROP TABLE "Dropdown";
ALTER TABLE "new_Dropdown" RENAME TO "Dropdown";
CREATE INDEX "Dropdown_parentId_idx" ON "Dropdown"("parentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
