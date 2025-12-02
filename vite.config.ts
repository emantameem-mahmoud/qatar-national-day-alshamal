import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject the specific API key provided for automatic deployment
    'process.env.API_KEY': JSON.stringify("AIzaSyBBg7yANJtSEu8T7R7sWkRJsA3LHVG0HlY"),
    
    // Fallback to prevent "process is not defined" error
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});