/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vitest/config';

console.log('✅ vitest.config.ts is loaded');

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/'],
    },
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src'),
    },
  },
});
