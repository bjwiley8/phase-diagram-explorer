import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Minimal Vite config for React + TS
export default defineConfig({
  // If deploying to https://<user>.github.io/phase-diagram-explorer/
  // set base to the repo name. Adjust to '/' if using a custom domain
  // or a user/organization GitHub Pages site root.
  base: '/phase-diagram-explorer/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
