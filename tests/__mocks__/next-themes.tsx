import React from 'react';
import { vi } from 'vitest';

// Mock for next-themes
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const useTheme = () => {
  return {
    theme: 'light',
    setTheme: vi.fn(),
    themes: ['light', 'dark', 'system'],
    resolvedTheme: 'light',
    systemTheme: 'light',
  };
};
