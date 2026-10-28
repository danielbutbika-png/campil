import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base './' so the build runs from any sub-path (GitHub Pages: /campil/).
// assetsDir '' gives a flat output folder, uploadable through GitHub's web uploader.
export default defineConfig({ base: './', plugins: [react()], build: { target: 'es2020', chunkSizeWarningLimit: 1500, assetsDir: '' } });
