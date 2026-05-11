/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clientId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "surname" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_clientId_key" ON "User"("clientId");
