import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolvemos las dependencias que los componentes externos (integration) puedan necesitar
      'three': path.resolve(__dirname, 'node_modules/three'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      '@react-three/fiber': path.resolve(__dirname, 'node_modules/@react-three/fiber')
    }
  },
  server: {
    port: 3000,
    fs: {
      // Permitimos importar componentes desde la carpeta de integración fuera de la raíz del proyecto
      allow: ['..', '../../../integration']
    }
  }
})
