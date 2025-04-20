/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `MealMoment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MealMoment_name_key" ON "MealMoment"("name");
