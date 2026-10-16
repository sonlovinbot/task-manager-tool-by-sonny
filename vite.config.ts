import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // Tests run without Supabase even when .env.local is filled in.
    env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
    globals: true,
    globalSetup: ['./src/test/tz.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
