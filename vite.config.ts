import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    globalSetup: ['./src/test/tz.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
