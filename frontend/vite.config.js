import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default {
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Your Express server
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
