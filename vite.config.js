import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/tripwell/admin': {
        target: 'https://gofastbackend.onrender.com',
        changeOrigin: true,
      },
      '/analyze-user': {
        target: 'https://tripwell-ai.onrender.com',
        changeOrigin: true,
      },
      '/test-interpret-user': {
        target: 'https://tripwell-ai.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
