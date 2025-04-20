// Must import React at the very top to ensure it's defined globally
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { vi, beforeAll, beforeEach, afterEach, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
global.React = React; // Explicitly make React global to avoid 'React is not defined' errors
import ThemeToggle from '@/components/ThemeToggle';

// Helper to reset the theme before each test
function resetTheme() {
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('theme');
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

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
