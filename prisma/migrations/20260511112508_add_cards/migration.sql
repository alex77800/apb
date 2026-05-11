/*
  Warnings:

  - You are about to drop the column `balance` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `fromAccountId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `toAccountId` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "balance";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "fromAccountId",
DROP COLUMN "toAccountId";

-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "expiryMonth" INTEGER NOT NULL,
    "expiryYear" INTEGER NOT NULL,
    "cvv" TEXT NOT NULL,
    "paymentSystem" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_cardNumber_key" ON "Card"("cardNumber");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
