import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    fs: {
      // Permitimos importar componentes desde la carpeta de integración fuera de la raíz del proyecto
      allow: ['..', '../../../integration']
    }
  }
})
