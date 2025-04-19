// Utility functions for week calculations and meal moments
export const mealMoments = [
  "BREAKFAST",
  "SNACK1",
  "LUNCH",
  "SNACK2",
  "DINNER",
  "SUPPER"
] as const;

export function getWeekStart(date: Date) {
  // Return Monday of the week
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function getWeekDays(weekStart: Date) {
  // Return array of Date objects for the week (Mon-Sun)
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }
  return days;
}
