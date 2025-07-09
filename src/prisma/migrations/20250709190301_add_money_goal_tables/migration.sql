-- CreateTable
CREATE TABLE "MoneyGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amountGoal" REAL NOT NULL,
    "years" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdBy" TEXT NOT NULL,
    "editHistory" TEXT DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MoneyGoal_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MoneyGoalContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "contributedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MoneyGoalContribution_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "MoneyGoal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MoneyGoalContribution_contributedBy_fkey" FOREIGN KEY ("contributedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MoneyGoal_createdBy_idx" ON "MoneyGoal"("createdBy");

-- CreateIndex
CREATE INDEX "MoneyGoal_years_idx" ON "MoneyGoal"("years");

-- CreateIndex
CREATE INDEX "MoneyGoal_status_idx" ON "MoneyGoal"("status");

-- CreateIndex
CREATE INDEX "MoneyGoalContribution_goalId_idx" ON "MoneyGoalContribution"("goalId");

-- CreateIndex
CREATE INDEX "MoneyGoalContribution_contributedBy_idx" ON "MoneyGoalContribution"("contributedBy");
