import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Share i18n and locale-context from the parent Next.js app's src folder
      '@': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 3001,
    fs: {
      // Allow serving files from the workspace root (parent directory)
      allow: ['..'],
    },
  },
})
