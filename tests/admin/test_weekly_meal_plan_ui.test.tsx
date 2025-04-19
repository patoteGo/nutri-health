import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeeklyMealPlanAdmin from '../../components/admin/WeeklyMealPlanAdmin';

describe('WeeklyMealPlanAdmin UI', () => {
  it('renders header and Save button', () => {
    render(<WeeklyMealPlanAdmin userEmail="admin@nutrihealth.local" />);
    expect(screen.getByText(/Admin: Weekly Meal Plan/)).toBeInTheDocument();
    expect(screen.getByText(/Save/)).toBeInTheDocument();
  });
});
