import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Utilizziamo base relativa per facilitare la distribuzione su GitHub Pages
  base: './',
});
