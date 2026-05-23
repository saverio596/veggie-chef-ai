import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Tutte le chiamate a /chat.php vengono girate al backend PHP
      '/chat.php': {
        target: 'http://localhost:8000', // porta del tuo server PHP
        changeOrigin: true,
      },
    },
  },
})