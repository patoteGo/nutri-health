import { vi } from 'vitest';

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

import '@testing-library/jest-dom';

// Global mock for window.matchMedia for all tests
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

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

// # Reason: `import '@testing-library/jest-dom'` handles extending expect globally.
// Explicitly importing `matchers` and calling `expect.extend` is often redundant and can cause issues.
// import matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
