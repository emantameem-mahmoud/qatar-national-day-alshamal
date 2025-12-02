import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Correctly define process.env to prevent crashes and inject API KEY
    'process.env': {
       API_KEY: "AIzaSyBBg7yANJtSEu8T7R7sWkRJsA3LHVG0HlY"
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});