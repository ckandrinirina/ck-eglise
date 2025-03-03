-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dropdown" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'territory',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Dropdown" ("createdAt", "id", "name", "type", "updatedAt") SELECT "createdAt", "id", "name", "type", "updatedAt" FROM "Dropdown";
DROP TABLE "Dropdown";
ALTER TABLE "new_Dropdown" RENAME TO "Dropdown";
CREATE INDEX "Dropdown_type_idx" ON "Dropdown"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
