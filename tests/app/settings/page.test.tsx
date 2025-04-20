import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '@/app/settings/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock fetch
beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.resetAllMocks();
});

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('SettingsPage - Weight Integration', () => {
  it('shows user weight from backend (expected)', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ weight: 75 }),
    });
    renderWithClient(<SettingsPage />);
    await waitFor(() => expect(screen.getByDisplayValue('75')).toBeInTheDocument());
  });

  it('handles edge case: no weight returned', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ weight: undefined }),
    });
    renderWithClient(<SettingsPage />);
    await waitFor(() => expect(screen.getByTestId('weight-input')).toBeInTheDocument());
    // Should not crash, no value selected
    expect(screen.getByTestId('weight-input')).toHaveValue('');
  });

  it('saves weight to backend (success)', async () => {
    (fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ weight: 80 }) }) // load
      .mockResolvedValueOnce({ ok: true, json: async () => ({ weight: 81 }) }); // save
    renderWithClient(<SettingsPage />);
    await waitFor(() => expect(screen.getByDisplayValue('80')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('weight-input').querySelector('input')!, { target: { value: '81' } });
    fireEvent.click(screen.getByTestId('save-weight'));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      '/api/user/settings',
      expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('81') })
    ));
  });

  it('shows error if PATCH fails (failure case)', async () => {
    (fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ weight: 70 }) }) // load
      .mockResolvedValueOnce({ ok: false }); // save
    renderWithClient(<SettingsPage />);
    await waitFor(() => expect(screen.getByDisplayValue('70')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('save-weight'));
    await waitFor(() => expect(screen.getByText(/failed to save/i)).toBeInTheDocument());
  });
});
