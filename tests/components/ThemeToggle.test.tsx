import { render, fireEvent, screen } from '@testing-library/react';
import ThemeToggle from '@/components/ThemeToggle';

// Helper to reset the theme before each test
function resetTheme() {
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('theme');
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    resetTheme();
  });

  afterEach(() => {
    resetTheme();
  });

  it('renders with initial theme based on system preference (defaults to light)', () => {
    render(<ThemeToggle />);
    // Should show moon icon (light mode)
    expect(screen.getByLabelText(/switch to dark mode/i)).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles to dark mode and persists in localStorage', () => {
    render(<ThemeToggle />);
    const btn = screen.getByTestId('theme-toggle');
    // Click to switch to dark
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    // Should show sun icon (dark mode)
    expect(screen.getByLabelText(/switch to light mode/i)).toBeInTheDocument();
  });

  it('toggles back to light mode and persists in localStorage', () => {
    render(<ThemeToggle />);
    const btn = screen.getByTestId('theme-toggle');
    // Switch to dark first
    fireEvent.click(btn);
    // Switch back to light
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
    // Should show moon icon (light mode)
    expect(screen.getByLabelText(/switch to dark mode/i)).toBeInTheDocument();
  });

  it('respects localStorage theme on mount', () => {
    localStorage.setItem('theme', 'dark');
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByLabelText(/switch to light mode/i)).toBeInTheDocument();
  });

  it('handles edge case: invalid value in localStorage', () => {
    localStorage.setItem('theme', 'invalid');
    render(<ThemeToggle />);
    // Should fall back to light
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(screen.getByLabelText(/switch to dark mode/i)).toBeInTheDocument();
  });
});
