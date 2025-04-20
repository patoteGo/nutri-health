import { vi, expect } from 'vitest';
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with jest-dom matchers
expect.extend(matchers);

// # Reason: Mock next-auth for tests that use useSession
// This prevents "useSession must be wrapped in SessionProvider" errors
vi.mock('next-auth/react', () => {
  const mockSession = {
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: { name: 'Test User', email: 'test@example.com' }
  };
  
  return {
    useSession: vi.fn(() => {
      return { data: mockSession, status: 'authenticated' };
    }),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(() => mockSession),
    SessionProvider: ({ children }: { children: any }) => children
  };
});

// # Reason: Mock next-themes to prevent errors with window.matchMedia
vi.mock('next-themes', () => {
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    useTheme: () => ({
      theme: 'light',
      setTheme: vi.fn(),
      themes: ['light', 'dark', 'system'],
      resolvedTheme: 'light',
      systemTheme: 'light',
    }),
  };
});

// # Reason: Polyfill for PointerEvent API missing in JSDOM (used by Vitest/Testing Library)
// Needed for Radix UI components that use pointer events.
if (typeof Element.prototype.hasPointerCapture === 'undefined') {
  Element.prototype.hasPointerCapture = () => false;
}

// # Reason: Polyfill for scrollIntoView missing in JSDOM
// Needed for Radix UI components that might try to scroll elements into view.
if (typeof Element.prototype.scrollIntoView === 'undefined') {
  Element.prototype.scrollIntoView = () => {};
}

// # Reason: Polyfill for ResizeObserver API missing in JSDOM
// Needed for Radix UI components that use ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Set both window and global ResizeObserver mocks
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverMock;
}
global.ResizeObserver = ResizeObserverMock;

// Mock window.matchMedia for next-themes
// This is needed by next-themes package which uses window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Import React globally for all tests to avoid 'React is not defined' errors
import React from 'react';

// Set up i18next for tests to avoid missing i18next instance errors
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18next for tests
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: {
        translation: {
          // Common translations used in tests
          'Add Ingredient': 'Add Ingredient',
          'Save': 'Save',
          'Ingredients': 'Ingredients',
          'Search ingredient': 'Search ingredient',
          'Weight': 'Weight',
          'Already on the list': 'Already on the list',
          'Home': 'Home',
          'Log Meal': 'Log Meal',
          'Food': 'Food'
        }
      },
      pt: {
        translation: {
          'Add Ingredient': 'Adicionar Ingrediente',
          'Save': 'Salvar',
          'Ingredients': 'Ingredientes',
          'Search ingredient': 'Buscar ingrediente',
          'Weight': 'Peso',
          'Already on the list': 'Já está na lista',
          'Egg': 'Ovo'
        }
      }
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Make i18n globally available for tests (only in test environment)
import type { i18n as I18nType } from 'i18next';

declare global {
  // Only for Vitest/Jest test environment
  // eslint-disable-next-line no-var
  var i18n: I18nType | undefined;
}

if (process.env.NODE_ENV === 'test' && typeof global !== 'undefined') {
  global.i18n = i18n;
}
