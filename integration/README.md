# Integración para Juegos RPG Tácticos

Este directorio contiene herramientas para integrar `zrenderer` en un stack moderno utilizando **React, Node.js, Supabase y Three.js**.

## Contenido

1.  **Node.js Client** (`node-client/`): Un cliente robusto para interactuar con el servicio de renderizado y gestionar la subida automática de sprites a Supabase Storage.
2.  **React Three.js Component** (`react-three/`): Un componente `ROSpriteBillboard` listo para usar en escenas de Three.js (vía `@react-three/fiber`).
3.  **Supabase Schema** (`supabase/`): Esquema SQL inicial para gestionar personajes, trabajos y equipamiento.

## Guía de Inicio Rápido

### 1. Preparar los Assets de Ragnarok Online
Sigue las instrucciones en [RESOURCES.md](../RESOURCES.md) para extraer los archivos necesarios. Colócalos en una carpeta llamada `resources` en la raíz del proyecto.

### 2. Levantar el Servicio con Docker
Utiliza el archivo `docker-compose.yml` proporcionado en la raíz:

```bash
docker-compose up -d
```

### 3. Configurar Supabase
1. Ejecuta el script SQL en `supabase/init.sql` en el Editor SQL de tu panel de Supabase.
2. Crea un bucket de storage público llamado `sprites`.

### 4. Uso del Cliente Node.js
Instala las dependencias en tu proyecto de Node.js:
```bash
npm install axios @supabase/supabase-js
```

Ejemplo de uso:
```javascript
const ZRendererClient = require('./integration/node-client/zrenderer-client');

const client = new ZRendererClient({
  rendererUrl: 'http://localhost:11011',
  accessToken: 'tu-token-aqui',
  supabaseUrl: 'https://tu-proyecto.supabase.co',
  supabaseKey: 'tu-service-role-key'
});

// Renderizar y subir a Supabase automáticamente
const url = await client.getOrUploadSprite({
  job: ['1001'],
  action: 0
}, 'scorpion_stand.png');
```

### 5. Uso en React con Three.js
Instala las dependencias:
```bash
npm install three @react-three/fiber react
```

Ejemplo de uso:
```jsx
import ROSpriteBillboard from './integration/react-three/ROSpriteBillboard';

function Scene() {
  return (
    <Canvas>
      <ambientLight />
      <ROSpriteBillboard
        rendererUrl="http://localhost:11011"
        job={1001}
        action={0}
        scale={2}
      />
    </Canvas>
  );
}
```
