/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/',
        'coverage/',
        '**/index.ts',
        '**/*.stories.*',
        '**/*.test.*',
        '**/*.spec.*'
      ],
    },
    // Test file patterns
    include: [
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      'tests/e2e/',
      '**/*.e2e.{test,spec}.{js,ts,jsx,tsx}'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests')
    }
  }
})
