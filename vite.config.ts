// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname, 'frontend'),
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['safeuse.onrender.com'],
    proxy: {
      '/api': {
        target: 'https://safeuse.onrender.com',
        changeOrigin: true,
        // convierte "/api/loquesea" en "?route=api/loquesea"
        rewrite: (path) =>
          path.replace(/^\/api\/(.+)/, '?route=api/$1'),
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
})
