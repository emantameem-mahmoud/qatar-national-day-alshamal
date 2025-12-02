import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Correctly inject the API key from the build environment (Vercel/Netlify)
    // IMPORTANT: 'process' is not available in the browser, so we must stringify the value here.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    
    // Fallback to prevent "process is not defined" error if code accesses other process.env properties
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});