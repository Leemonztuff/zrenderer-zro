# Integración para Juegos RPG

Este directorio contiene los recursos necesarios para integrar `zrenderer` en un stack moderno de RPG web utilizando React, Node.js, Supabase y Three.js.

## Estructura del Directorio

- `node-client/`: Un cliente de Node.js (`zrenderer-client.js`) para interactuar con el renderizador desde tu backend.
- `react-three/`: Un componente de React Three Fiber (`ROSpriteBillboard.jsx`) para mostrar los sprites en una escena 3D.
- `supabase/`: Esquema SQL y configuración de almacenamiento (`init.sql`) para gestionar los assets de los personajes.

## Guía Rápida de Inicio

### 1. Extraer los Assets
El renderizador requiere los archivos originales de Ragnarok Online (archivos GRF). Utiliza una herramienta como GRF Editor para extraer las siguientes carpetas de tu `data.grf`:
- `data/sprite/`
- `data/palette/`
- `data/luafiles514/` (o la versión correspondiente de Lua de tu cliente)

Copia estas carpetas dentro de un directorio llamado `resources/` en la raíz del proyecto.

### 2. Ejecutar el Renderizador (Docker)
Asegúrate de que tu archivo `zrenderer.docker.conf` apunte al directorio de recursos correcto. Luego, inicia el servicio:

```bash
docker compose up -d
```

### 3. Usar el Cliente de Node.js
En tu backend (Node.js), utiliza el `ZRendererClient` para renderizar los sprites y subirlos a Supabase Storage.

```javascript
const ZRendererClient = require('./integration/node-client/zrenderer-client');

const client = new ZRendererClient({
    rendererUrl: 'http://localhost:11011',
    accessToken: 'tu-token-de-acceso',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});

// Renderizar y subir a Supabase
const buffer = await client.renderSprite({ job: ['1001'], action: 0 });
const upload = await client.uploadToSupabase(buffer, 'monsters/1001.png');
const publicUrl = await client.getPublicUrl('monsters/1001.png');
```

### 4. Usar el Componente de React
En tu frontend, utiliza `ROSpriteBillboard` para mostrar el personaje en Three.js.

```jsx
import ROSpriteBillboard from './integration/react-three/ROSpriteBillboard';

function GameScene() {
  return (
    <Canvas>
      <ambientLight />
      <ROSpriteBillboard
        job="4012"
        action={17}
        frame={2}
        gender={0}
        scale={2}
        position={[0, 1, 0]}
        accessToken="tu-token"
      />
    </Canvas>
  );
}
```

## Consejos de Rendimiento
- **Caching:** El renderizador genera imágenes bajo demanda. Para juegos con mucho tráfico, se recomienda cachear los PNGs renderizados en Supabase Storage o en una CDN utilizando el cliente de Node.js.
- **Loteado (Batching):** Utiliza el parámetro de array `job` en la API para renderizar múltiples personajes en una sola solicitud siempre que sea posible.
- **Reutilización de Texturas:** El componente de React se encarga de la limpieza básica de texturas, pero asegúrate de gestionar el número de billboards activos en escenas complejas.

---
Todos los medios y contenidos relacionados con Ragnarok Online son propiedad intelectual de Gravity Co., Ltd & Lee Myoungjin (studio DTDS) y tienen todos los derechos reservados.
