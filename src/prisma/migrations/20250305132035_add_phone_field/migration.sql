-- AlterTable
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new__UserFunctions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserFunctions_A_fkey" FOREIGN KEY ("A") REFERENCES "Dropdown" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserFunctions_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__UserFunctions" ("A", "B") SELECT "A", "B" FROM "_UserFunctions";
DROP TABLE "_UserFunctions";
ALTER TABLE "new__UserFunctions" RENAME TO "_UserFunctions";
CREATE UNIQUE INDEX "_UserFunctions_AB_unique" ON "_UserFunctions"("A", "B");
CREATE INDEX "_UserFunctions_B_index" ON "_UserFunctions"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
