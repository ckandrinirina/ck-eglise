-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MoneyGoalContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "contributedBy" TEXT NOT NULL,
    "transactionId" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MoneyGoalContribution_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "MoneyGoal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MoneyGoalContribution_contributedBy_fkey" FOREIGN KEY ("contributedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MoneyGoalContribution_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MoneyGoalContribution" ("amount", "contributedBy", "createdAt", "goalId", "id", "reason", "updatedAt") SELECT "amount", "contributedBy", "createdAt", "goalId", "id", "reason", "updatedAt" FROM "MoneyGoalContribution";
DROP TABLE "MoneyGoalContribution";
ALTER TABLE "new_MoneyGoalContribution" RENAME TO "MoneyGoalContribution";
CREATE UNIQUE INDEX "MoneyGoalContribution_transactionId_key" ON "MoneyGoalContribution"("transactionId");
CREATE INDEX "MoneyGoalContribution_goalId_idx" ON "MoneyGoalContribution"("goalId");
CREATE INDEX "MoneyGoalContribution_contributedBy_idx" ON "MoneyGoalContribution"("contributedBy");
CREATE INDEX "MoneyGoalContribution_transactionId_idx" ON "MoneyGoalContribution"("transactionId");
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "userId" TEXT NOT NULL,
    "senderId" TEXT,
    "receiverId" TEXT,
    "transactionTypeId" TEXT,
    "moneyGoalId" TEXT,
    "siteBalanceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_transactionTypeId_fkey" FOREIGN KEY ("transactionTypeId") REFERENCES "Dropdown" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_moneyGoalId_fkey" FOREIGN KEY ("moneyGoalId") REFERENCES "MoneyGoal" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_siteBalanceId_fkey" FOREIGN KEY ("siteBalanceId") REFERENCES "SiteBalance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "createdAt", "id", "reason", "receiverId", "senderId", "siteBalanceId", "transactionTypeId", "type", "updatedAt", "userId") SELECT "amount", "createdAt", "id", "reason", "receiverId", "senderId", "siteBalanceId", "transactionTypeId", "type", "updatedAt", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_siteBalanceId_key" ON "Transaction"("siteBalanceId");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_senderId_idx" ON "Transaction"("senderId");
CREATE INDEX "Transaction_receiverId_idx" ON "Transaction"("receiverId");
CREATE INDEX "Transaction_transactionTypeId_idx" ON "Transaction"("transactionTypeId");
CREATE INDEX "Transaction_moneyGoalId_idx" ON "Transaction"("moneyGoalId");
CREATE INDEX "Transaction_siteBalanceId_idx" ON "Transaction"("siteBalanceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
