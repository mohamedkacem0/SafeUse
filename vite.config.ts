import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname, 'frontend'),
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['safeuse.onrender.com', 'safeuse-lkde.onrender.com'],
    proxy: {
      '/api': {
        target: 'https://safeuse-lkde.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/(.+)/, '?route=api/$1'),
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500, // Optional: avoid warnings for large chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('lodash')) return 'vendor-lodash'
            if (id.includes('axios')) return 'vendor-axios'
            return 'vendor' // fallback for other node_modules
          }
        },
      },
    },
  },
})
