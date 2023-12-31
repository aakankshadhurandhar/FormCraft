import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path"
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Serve the React app on port 8000
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000/', // Redirect all /api requests to localhost:3000
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api prefix from the request path
      },
    },
  },
});
