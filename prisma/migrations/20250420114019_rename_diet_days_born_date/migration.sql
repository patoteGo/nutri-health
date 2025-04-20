/*
  Warnings:

  - You are about to drop the column `bornDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dietDays` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "bornDate",
DROP COLUMN "dietDays",
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "weekDays" "Weekday"[];
