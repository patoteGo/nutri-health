// Types for dynamic meal moment usage from backend
export interface MealMoment {
  id: number;
  name: string;
  description?: string | null;
  timeInDay?: string | null;
}
