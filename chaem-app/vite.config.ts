import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
  resolve: {
    alias: [
      // chaem-app's own context files take precedence (e.g. chaem-user-context)
      { find: '@/context', replacement: path.resolve(__dirname, './src/context') },
      // Everything else (@/lib, etc.) resolves to the parent shared src
      { find: '@', replacement: path.resolve(__dirname, '../src') },
    ],
  },
})
