-- CreateTable
CREATE TABLE "_UserFunctions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserFunctions_A_fkey" FOREIGN KEY ("A") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserFunctions_B_fkey" FOREIGN KEY ("B") REFERENCES "Dropdown" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserFunctions_AB_unique" ON "_UserFunctions"("A", "B");
CREATE INDEX "_UserFunctions_B_index" ON "_UserFunctions"("B");
