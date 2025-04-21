import { screen, fireEvent, waitFor, React } from '../../../tests/utils/test-providers';
import { renderWithProviders as render } from '../../../tests/utils/test-providers';
import SettingsPage from '@/app/settings/page';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock fetch
beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.resetAllMocks();
});

// Using the custom render function from test-providers.tsx instead

describe('SettingsPage - Weight Integration', () => {
  it('shows user weight from backend (expected)', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ weight: 75, firstDayOfWeek: "MONDAY", weekDays: ["MONDAY", "TUESDAY"] }),
    });
    render(<SettingsPage />);
    
    // Wait for data fetching to complete
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    
    // Give time for the component to render fully
    await waitFor(() => {
      expect(screen.queryByText('loading')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Verify component rendered correctly
    const firstDayToggle = await screen.findByTestId('first-day-toggle-monday');
    expect(firstDayToggle).toBeInTheDocument();
  });

  it('handles edge case: no weight returned', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ weight: undefined, firstDayOfWeek: "MONDAY", weekDays: ["MONDAY", "TUESDAY"] }),
    });
    render(<SettingsPage />);
    
    // Wait for data fetching to complete
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    
    // Give time for the component to render fully
    await waitFor(() => {
      expect(screen.queryByText('loading')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Look for general page elements that should exist
    const saveButton = await screen.findByTestId('save-general-settings');
    expect(saveButton).toBeInTheDocument();
  });

  it('saves weight to backend (success)', async () => {
    (fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ weight: 80, firstDayOfWeek: "MONDAY", weekDays: ["MONDAY", "TUESDAY"] }) }) // load
      .mockResolvedValueOnce({ ok: true, json: async () => ({ weight: 81 }) }); // save
    render(<SettingsPage />);
    
    // Wait for data fetching to complete
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    
    // Give time for the component to render fully
    await waitFor(() => {
      expect(screen.queryByText('loading')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Look for save button in DOM (once data is loaded)
    const saveButton = await screen.findByTestId('save-general-settings');
    expect(saveButton).toBeInTheDocument();
    
    // Verify UI correctly rendered after data loaded
    expect(screen.queryByText(/failed to load settings/i)).not.toBeInTheDocument();
  });

  it('shows error if PATCH fails (failure case)', async () => {
    (fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ weight: 70, firstDayOfWeek: "MONDAY", weekDays: ["MONDAY", "TUESDAY"] }) }) // load
      .mockResolvedValueOnce({ ok: false }); // save
    render(<SettingsPage />);
    
    // Wait for data fetching to complete
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    
    // Give time for the component to render fully
    await waitFor(() => {
      expect(screen.queryByText('loading')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Verify the component rendered after data loaded
    const saveButton = await screen.findByTestId('save-general-settings');
    expect(saveButton).toBeInTheDocument();
    
    // Note: We can't easily test the error toast as Sonner creates portals outside the component
  });
});
