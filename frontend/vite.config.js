import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Build avec chemins relatifs pour que FastAPI puisse servir les fichiers
  base: './',
  server: {
    port: 5173,
    host: true,
    // En mode dev, redirige /api vers le backend FastAPI
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
