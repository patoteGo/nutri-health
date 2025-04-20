/*
  Warnings:

  - Added the required column `name` to the `WeeklyMealPlan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dietDays" "Weekday"[],
ADD COLUMN     "firstDayOfWeek" "Weekday" NOT NULL DEFAULT 'MONDAY';

-- AlterTable
ALTER TABLE "WeeklyMealPlan" ADD COLUMN     "name" TEXT NOT NULL;
