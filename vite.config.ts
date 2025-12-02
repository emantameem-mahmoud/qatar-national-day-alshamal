import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject the specific API key provided for automatic deployment
    'process.env.API_KEY': JSON.stringify("AIzaSyBBg7yANJtSEu8T7R7sWkRJsA3LHVG0HlY"),
    
    // Ensure process.env is defined to avoid crashes in some libraries
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});