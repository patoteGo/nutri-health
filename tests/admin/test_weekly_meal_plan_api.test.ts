import { describe, it, expect } from 'vitest';
import { WeeklyMealPlanSchema } from '../../lib/types';

// Mock API test for /api/admin/weekly-meal-plan

describe('Weekly Meal Plan API', () => {
  it('validates expected input', () => {
    const valid = WeeklyMealPlanSchema.safeParse({
      person: 'user-123',
      weekStart: '2025-04-14T00:00:00.000Z',
      meals: {
        '2025-04-14T00:00:00.000Z': {
          BREAKFAST: { parts: [{ name: 'Oats' }] },
          SNACK1: { parts: [] },
          LUNCH: { parts: [] },
          SNACK2: { parts: [] },
          DINNER: { parts: [] },
          SUPPER: { parts: [] }
        }
      }
    });
    expect(valid.success).toBe(true);
  });

  it('fails with missing required fields', () => {
    const invalid = WeeklyMealPlanSchema.safeParse({});
    expect(invalid.success).toBe(false);
  });

  it('handles edge case: empty meals', () => {
    const valid = WeeklyMealPlanSchema.safeParse({
      person: 'user-123',
      weekStart: '2025-04-14T00:00:00.000Z',
      meals: {}
    });
    expect(valid.success).toBe(true);
  });
});
