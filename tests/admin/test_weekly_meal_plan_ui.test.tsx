import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WeeklyMealPlanAdmin from '../../components/admin/WeeklyMealPlanAdmin';

describe('WeeklyMealPlanAdmin UI', () => {
  it('renders header and Save button', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={{ user: { email: 'admin@nutrihealth.local' } } as any}>
          <WeeklyMealPlanAdmin userEmail="admin@nutrihealth.local" />
        </SessionProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText(/Admin: Weekly Meal Plan/)).toBeInTheDocument();
    expect(screen.getByText(/Save/)).toBeInTheDocument();
  });
});
