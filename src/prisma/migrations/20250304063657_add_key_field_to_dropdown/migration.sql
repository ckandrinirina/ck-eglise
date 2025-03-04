/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Dropdown` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Dropdown" ADD COLUMN "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Dropdown_key_key" ON "Dropdown"("key");
