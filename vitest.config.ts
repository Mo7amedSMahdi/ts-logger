import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
      exclude: ['**/tests/**', '**/types/**', '**/node_modules/**'],
      include: ['src/**/*.ts'],
    },
  },
});