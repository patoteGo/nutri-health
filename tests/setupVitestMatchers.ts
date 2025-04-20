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
// # Reason: `import '@testing-library/jest-dom'` handles extending expect globally.
// Explicitly importing `matchers` and calling `expect.extend` is often redundant and can cause issues.
// import matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// expect.extend(matchers);
