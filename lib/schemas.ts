// Zod schemas for API validation
import { z } from "zod";
import { Weekday } from "@prisma/client";

// Ingredient schemas
export const IngredientSchema = z.object({
  id: z.string().optional(), // Optional for new ingredients
  name: z.string(),
  carbs: z.number(),
  protein: z.number(),
  fat: z.number(),
  fiber: z.number(),
  calories: z.number(),
  unit: z.enum([
    "GRAM", 
    "UNIT", 
    "ML", 
    "TEASPOON", 
    "TABLESPOON", 
    "SLICE", 
    "CUP", 
    "PIECE"
  ]).default("GRAM"),
  imageUrl: z.string().optional().nullable(),
  searchTerms: z.array(z.string()).optional().default([]),
});
export type IngredientType = z.infer<typeof IngredientSchema>;

// Ingredient with quantity schema
export const IngredientWithQuantitySchema = z.object({
  id: z.string().optional(), // Optional for new entries
  ingredientId: z.string(),
  quantity: z.number(),
  // These fields are for display/frontend only, not stored directly in this model
  name: z.string().optional(),
  unit: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  carbs: z.number().optional(),
  protein: z.number().optional(),
  fat: z.number().optional(),
  fiber: z.number().optional(),
  calories: z.number().optional(),
});
export type IngredientWithQuantityType = z.infer<typeof IngredientWithQuantitySchema>;

// Meal schema
export const MealSchema = z.object({
  id: z.string().optional(), // Optional for new meals
  userId: z.string(),
  name: z.string().optional(),
  ingredients: z.array(IngredientWithQuantitySchema),
});
export type MealType = z.infer<typeof MealSchema>;

// Meal moment schema
export const MealMomentSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  timeInDay: z.string(),
  description: z.string().optional(),
});
export type MealMomentType = z.infer<typeof MealMomentSchema>;

// Meal in day schema
export const MealInDaySchema = z.object({
  id: z.string().optional(),
  mealId: z.string(),
  mealMomentId: z.number(),
  weekday: z.nativeEnum(Weekday).optional(), // For frontend use
});
export type MealInDayType = z.infer<typeof MealInDaySchema>;

// Weekly meal plan schema
export const WeeklyMealPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  userId: z.string(),
  weekStart: z.string().or(z.date()), // Accept string or Date object
  mealsInDay: z.array(z.string()), // Array of MealInDay IDs
});
export type WeeklyMealPlanType = z.infer<typeof WeeklyMealPlanSchema>;

// Weekly meal plan with expanded data for frontend
export const WeeklyMealPlanWithDataSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  userId: z.string(),
  weekStart: z.string().or(z.date()),
  meals: z.record(z.string(), z.record(z.string(), z.any())), // day -> mealMoment -> meal data
});
export type WeeklyMealPlanWithDataType = z.infer<typeof WeeklyMealPlanWithDataSchema>;
