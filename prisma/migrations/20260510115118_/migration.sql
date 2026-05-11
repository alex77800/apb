/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountNumber]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "createdAt",
ADD COLUMN     "accountNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "fromAccountId" INTEGER,
ADD COLUMN     "toAccountId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt";

-- CreateIndex
CREATE UNIQUE INDEX "Account_accountNumber_key" ON "Account"("accountNumber");

UPDATE "Account"
SET "accountNumber" = 'TEMP-' || id;