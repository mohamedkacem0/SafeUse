// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname, 'frontend'),
  plugins: [react()],
  server: {
    proxy: {
      // cualquiera que empiece con /api...
      '/api': {
        // lo mandamos directamente al index.php de tu API
        target: 'http://localhost/tfg/SafeUse/backend/api/public/index.php',
        changeOrigin: true,
        // quitamos el prefijo /api para que index.php reciba solo el query string
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  }
})
