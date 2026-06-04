import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'three': path.resolve(__dirname, './node_modules/three'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      '@react-three/fiber': path.resolve(__dirname, './node_modules/@react-three/fiber'),
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
