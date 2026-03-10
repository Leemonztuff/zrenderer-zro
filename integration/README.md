# Guía de Integración: RPG Táctico con Ragnarok Online

Esta carpeta contiene las herramientas necesarias para integrar el renderizador `zrenderer` en un stack moderno compuesto por **React**, **Node.js**, **Supabase** y **Three.js**.

## Requisitos Previos

1. **Assets de RO**: Debes extraer los archivos del juego Ragnarok Online (de los archivos .grf) usando una herramienta como [zextractor](https://github.com/zhad3/zextractor).
   - Coloca los archivos extraídos en una carpeta llamada `resources/` en la raíz de este proyecto.
   - Sigue la lista de filtros en `RESOURCES.md` para extraer solo lo necesario.

2. **Docker**: Se recomienda usar Docker para ejecutar el servicio de renderizado de forma aislada.

---

## Paso 1: Levantar el Renderizador

Utiliza el archivo `docker-compose.yml` proporcionado en la raíz:

```bash
docker-compose up -d
```

Esto iniciará el servicio `zrenderer` en `http://localhost:11011`.
*Nota: La primera vez que se ejecute, se generará un token de acceso en los logs. Puedes consultarlo con `docker-compose logs zrenderer`.*

---

## Paso 2: Configuración de Base de Datos (Supabase)

Ejecuta el script SQL que se encuentra en `integration/supabase/init.sql` dentro del editor SQL de tu proyecto en Supabase. Esto creará la tabla `characters` con las políticas de seguridad (RLS) necesarias para gestionar las configuraciones visuales de los personajes.

---

## Paso 3: Integración en el Backend (Node.js)

Utiliza el cliente `zrenderer-client.js` en tu servidor Node.js para comunicarte con el renderizador de forma segura.

```javascript
const ZRendererClient = require('./integration/node-client/zrenderer-client');

const client = new ZRendererClient({
  zrendererUrl: 'http://localhost:11011',
  accessToken: 'TU_TOKEN_GENERADO',
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    bucket: 'assets-juego'
  }
});

// Ejemplo: Renderizar un personaje y guardarlo en Supabase Storage
async function cachearPersonaje(config, path) {
  const publicUrl = await client.getPersistentSpriteUrl(config, path);
  console.log('Sprite disponible en:', publicUrl);
  return publicUrl;
}
```

---

## Paso 4: Visualización en el Frontend (React + Three.js)

Para mostrar los sprites dentro de tu juego en 3D, utiliza el componente `ROSpriteBillboard.jsx`.

```jsx
import { Canvas } from '@react-three/fiber';
import { ROSpriteBillboard } from './integration/react-three/ROSpriteBillboard';

function EscenaJuego() {
  const configPersonaje = {
    job: 1, // Swordman
    gender: 1,
    head: 5,
    action: 0 // Stand
  };

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <ROSpriteBillboard
        characterConfig={configPersonaje}
        rendererUrl="http://tu-proxy-node.com"
        position={[0, 1, 0]}
        scale={2}
      />
    </Canvas>
  );
}
```

## Arquitectura Recomendada

Para una mayor seguridad y rendimiento, recomendamos:
1.  **Proxy en el Backend**: No expongas el `accessToken` del renderizador en el frontend. Crea un endpoint en tu servidor Node.js que reciba la configuración del personaje, valide los permisos del usuario y haga la petición al `zrenderer`.
2.  **Caché en Storage**: Utiliza el método `getPersistentSpriteUrl` para guardar los sprites renderizados en un bucket de Supabase Storage. De esta forma, el frontend puede cargar las imágenes directamente desde un CDN sin saturar el renderizador.
