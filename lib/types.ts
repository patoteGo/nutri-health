// Types and zod schemas for weekly meal plan
import { z } from "zod";

// Shared Menu type for admin/meal plan components
export interface Menu {
  id: string;
  category?: string;
  assignedDay?: string;
  assignedMoment?: string;
  [key: string]: unknown;
}


export const MealMoment = z.enum([
  "BREAKFAST",
  "SNACK1",
  "LUNCH",
  "SNACK2",
  "DINNER",
  "SUPPER"
]);
export type MealMoment = z.infer<typeof MealMoment>;

export const MealPart = z.object({
  name: z.string(),
  grams: z.number().optional(),
  imageUrl: z.string().optional(),
});
export type MealPart = z.infer<typeof MealPart>;

export const MealData = z.object({
  parts: z.array(MealPart),
});
export type MealData = z.infer<typeof MealData>;

export const WeeklyMealPlanSchema = z.object({
  person: z.string(),
  weekStart: z.string(),
  meals: z.record(z.string(), z.record(MealMoment, MealData)),
});
export type WeeklyMealPlan = z.infer<typeof WeeklyMealPlanSchema>;
