# Guía de Integración: RPG Táctico Ragnarok Online

Esta carpeta contiene las herramientas necesarias para integrar el `zrenderer` en un stack moderno de desarrollo: **React (Three.js)**, **Node.js** y **Supabase**.

## Componentes

### 1. Esquema de Supabase (`/supabase/init.sql`)
Un esquema de PostgreSQL para la gestión de personajes. Incluye:
- Tabla `characters` con todos los parámetros visuales (job, head, headgear, etc.).
- Políticas de seguridad a nivel de fila (RLS) para proteger los datos de los usuarios.
- Triggers automáticos para marcas de tiempo.

### 2. Cliente de Node.js (`/node-client/zrenderer-client.js`)
Un cliente robusto para interactuar con el servicio `zrenderer`. Permite:
- Renderizar sprites directamente desde tu backend.
- Subir automáticamente los assets generados a **Supabase Storage** para persistencia y caché.

### 3. Componentes de React Three.js (`/react-three/`)
- **`ROSprite.jsx`**: Un componente simple que renderiza un sprite de RO desde una URL (ideal para usar con Supabase Storage).
- **`ROSpriteBillboard.jsx`**: Un componente avanzado que se comunica directamente con el renderizador (vía proxy) y maneja el filtrado de texturas "Nearest" para mantener la estética pixel-art.

---

## Guía de Inicio Rápido

### Paso 1: Preparar los Recursos de RO
Debes extraer los archivos del juego (archivos .grf) usando una herramienta como [zextractor](https://github.com/zhad3/zextractor).
- Coloca los archivos en una carpeta `resources/` en la raíz del proyecto.
- Asegúrate de seguir la lista de archivos necesarios detallada en `RESOURCES.md`.

### Paso 2: Levantar el Renderizador
Usa Docker para levantar el servicio:

```bash
docker run -d --name zrenderer \
  -v ./zrenderer.docker.conf:/zren/zrenderer.conf \
  -v ./output:/zren/output \
  -v ./resources:/zren/resources \
  -p 11011:11011 \
  zhade/zrenderer:latest
```

*Nota: Al iniciar por primera vez, el servicio generará un token de acceso que podrás ver en los logs de Docker.*

### Paso 3: Configurar el Backend y Supabase
1. Ejecuta el SQL de `integration/supabase/init.sql` en tu editor de Supabase.
2. Usa el cliente de Node.js para gestionar tus unidades:

```javascript
const ZRendererClient = require('./integration/node-client/zrenderer-client');

const client = new ZRendererClient({
  zrendererUrl: 'http://localhost:11011',
  accessToken: 'TU_TOKEN_AQUÍ',
  supabase: {
    url: 'https://tu-proyecto.supabase.co',
    key: 'tu-service-role-key',
    bucket: 'game-assets'
  }
});

// Renderizar y guardar de forma persistente
const url = await client.getPersistentSpriteUrl({
  job: [0], // Novice
  action: 0,
  gender: 1
}, 'units/novice_stand.png');
```

### Paso 4: Integrar en React (Three.js)
Usa el componente dentro de tu escena. Si usas sprites persistentes en Supabase Storage:

```jsx
import { Canvas } from '@react-three/fiber';
import ROSprite from './integration/react-three/ROSprite';

function Scene() {
  return (
    <Canvas>
      <ROSprite
        url="https://tu-proyecto.supabase.co/storage/v1/object/public/game-assets/units/novice_stand.png"
        position={[0, 0, 0]}
        scale={2}
      />
    </Canvas>
  );
}
```

O si deseas renderizar dinámicamente desde el frontend (vía proxy o directamente):

```jsx
import { Canvas } from '@react-three/fiber';
import { ROSpriteBillboard } from './integration/react-three/ROSpriteBillboard';

function Scene() {
  const character = { job: [0], action: 0, gender: 1 };

  return (
    <Canvas>
      <ROSpriteBillboard
        characterConfig={character}
        rendererUrl="http://localhost:11011"
        accessToken="TU_TOKEN_AQUÍ" // Opcional si usas un proxy que lo inyecte
        position={[0, 1, 0]}
        scale={2}
      />
    </Canvas>
  );
}
```

---

## Recomendación de Arquitectura
Para un juego táctico, recomendamos:
1. **Generación Previa**: Usar el `zrenderer-client` en el backend para generar y subir los sprites necesarios a Supabase Storage.
2. **Carga en el Cliente**: En React, cargar los sprites directamente desde la CDN de Supabase usando el componente `ROSprite`. Esto reduce la carga en el servidor de renderizado y mejora los tiempos de respuesta para los jugadores.
