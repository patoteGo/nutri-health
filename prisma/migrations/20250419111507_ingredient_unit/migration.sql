-- CreateEnum
CREATE TYPE "IngredientUnit" AS ENUM ('GRAM', 'UNIT', 'ML', 'TEASPOON', 'TABLESPOON', 'SLICE', 'CUP', 'PIECE');

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "unit" "IngredientUnit" NOT NULL DEFAULT 'GRAM';
