-- Add searchTerms column to Ingredient
ALTER TABLE "Ingredient"
ADD COLUMN "searchTerms" TEXT[] NOT NULL DEFAULT '{}';
