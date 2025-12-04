import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // CRITICAL FIX: Properly stringify the value so Vite replaces it as a string literal.
    // This prevents "process is not defined" errors in the browser.
    'process.env.API_KEY': JSON.stringify("AIzaSyBBg7yANJtSEu8T7R7sWkRJsA3LHVG0HlY")
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext', // Use modern JS for better performance
  },
});
