import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts', 'tests/component/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      // Allow imports from src/core/*.ts in tests
      '@core': new URL('./src/core', import.meta.url).pathname,
    },
  },
});
