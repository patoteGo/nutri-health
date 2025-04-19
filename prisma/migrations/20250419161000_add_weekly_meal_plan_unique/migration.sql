/*
  Warnings:

  - A unique constraint covering the columns `[userId,weekStart]` on the table `WeeklyMealPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WeeklyMealPlan_userId_weekStart_key" ON "WeeklyMealPlan"("userId", "weekStart");
