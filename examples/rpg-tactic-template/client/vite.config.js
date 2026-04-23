import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    fs: {
      // Permitir servir archivos desde fuera de la raíz del proyecto (para integración/)
      allow: ['..', '../../../integration']
    }
  }
});
