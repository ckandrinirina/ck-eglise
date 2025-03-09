-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "userId" TEXT NOT NULL,
    "transactionTypeId" TEXT,
    "siteBalanceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_transactionTypeId_fkey" FOREIGN KEY ("transactionTypeId") REFERENCES "Dropdown" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_siteBalanceId_fkey" FOREIGN KEY ("siteBalanceId") REFERENCES "SiteBalance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "createdAt", "id", "reason", "transactionTypeId", "type", "updatedAt", "userId") SELECT "amount", "createdAt", "id", "reason", "transactionTypeId", "type", "updatedAt", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_siteBalanceId_key" ON "Transaction"("siteBalanceId");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_transactionTypeId_idx" ON "Transaction"("transactionTypeId");
CREATE INDEX "Transaction_siteBalanceId_idx" ON "Transaction"("siteBalanceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
