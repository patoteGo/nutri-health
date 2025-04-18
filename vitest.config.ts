import { defineConfig } from 'vitest/config';

import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // # Reason: Specify the setup file to run before tests (e.g., for polyfills, global mocks, matchers).
    setupFiles: ['./tests/setupVitestMatchers.ts'],
  },
});
