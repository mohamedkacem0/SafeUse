import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname, 'frontend'), // 👈 le decimos que el frontend está en /frontend
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost/alex/SAFEUSE/SafeUse/', // ajusta si es necesario
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  }
})
