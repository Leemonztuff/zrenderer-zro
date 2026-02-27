# Guía de Integración: RPG Táctico RO

Esta carpeta contiene las herramientas necesarias para integrar `zrenderer` en tu proyecto de React, Node.js, Supabase y Three.js.

## Requisitos Previos

1. **Recursos de RO**: Debes extraer los archivos de Ragnarok Online (de los archivos .grf) usando una herramienta como [zextractor](https://github.com/zhad3/zextractor).
   - Coloca los archivos extraídos en una carpeta llamada `resources/` en la raíz de este proyecto.
   - La estructura debe ser: `resources/data/sprite/...`, `resources/data/luafiles514/...`, etc.

2. **Docker**: Asegúrate de tener instalado Docker y Docker Compose.

---

## Paso 1: Levantar el Renderizador

Usa el archivo `docker-compose.yml` que se encuentra en la raíz:

```bash
docker-compose up -d
```

Esto levantará el servicio `zrenderer` en `http://localhost:11011`.
*Nota: La primera vez generará un token de acceso en los logs. Puedes verlo con `docker-compose logs zrenderer`.*

---

## Paso 2: Uso en el Backend (Node.js + Supabase)

El cliente `zrenderer-client.js` te permite automatizar la generación y subida de assets.

```javascript
const ZRendererClient = require('./integration/zrenderer-client');

const client = new ZRendererClient({
  zrendererUrl: 'http://localhost:11011',
  accessToken: 'TU_TOKEN_GENERADO',
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    bucket: 'game-assets'
  }
});

// Renderizar un Novice (Job 0) atacando y subirlo a Supabase
async function prepareUnit() {
  const url = await client.getPersistentSpriteUrl({
    job: [0],
    action: 93, // Ataque
    gender: 1   // Male
  }, 'units/novice_attack.png');

  console.log('Asset listo en:', url);
}
```

---

## Paso 3: Uso en el Frontend (React + Three.js)

Usa el componente `ROSprite.jsx` dentro de tu escena de Three.js.

```jsx
import { Canvas } from '@react-three/fiber';
import ROSprite from './integration/ROSprite';

function GameScene() {
  return (
    <Canvas>
      <ambientLight />
      {/* El sprite de RO en el mundo 3D */}
      <ROSprite
        url="https://tu-supabase.co/.../units/novice_attack.png"
        position={[0, 0, 0]}
        scale={2}
      />
    </Canvas>
  );
}
```

---

## Estructura de Acciones y Jobs
Para saber qué IDs usar (Job IDs, Action IDs), consulta:
- `RESOLVER.md`: Cómo se mapean los nombres a IDs.
- `server/api-spec/1.3.yaml`: Todos los parámetros disponibles (headgear, garment, etc.).
