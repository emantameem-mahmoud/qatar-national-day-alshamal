import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows access to process.env.API_KEY in the client-side code
    // during the build process on Vercel/Netlify.
    'process.env.API_KEY': JSON.stringify(process.env.AIzaSyBBg7yANJtSEu8T7R7sWkRJsA3LHVG0HlY),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
