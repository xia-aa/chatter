import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter(),
    react(),
  ],
  test: {
  

    environment: 'jsdom',
    typecheck: { enabled: true },
    watch: false,
    // Ensure route tree is generated before tests
    globals: true,
  },
})