# Integración de zrenderer para RPG Tácticos

Esta guía explica cómo integrar `zrenderer` en un stack moderno de desarrollo: **ReactJS, Node.js, Supabase y Three.js**.

## Arquitectura Recomendada

1.  **zrenderer (Microservicio):** Corre en un contenedor Docker y se encarga puramente de generar los PNGs.
2.  **Node.js Backend:** Actúa como orquestador. Recibe peticiones de creación/actualización de personajes, llama a `zrenderer`, y sube el resultado a un bucket de **Supabase Storage**.
3.  **Supabase:** Almacena los metadatos de los personajes (stats, equipamiento, apariencia) y los archivos de imagen renderizados.
4.  **React + Three.js:** El cliente descarga los metadatos de Supabase y visualiza el sprite usando el componente `ROSpriteBillboard`.

## Paso 1: Configuración de Recursos

Antes de empezar, necesitas los assets de Ragnarok Online.
1.  Extrae los archivos necesarios de tus archivos `.grf` (puedes usar `zextractor`).
2.  Colócalos en una carpeta llamada `resources/` en la raíz de este proyecto siguiendo la estructura de `RESOURCES.md`.
3.  Inicia el servicio:
    ```bash
    docker-compose up -d
    ```

## Paso 2: Base de Datos (Supabase)

Ejecuta el script SQL en `supabase/init.sql` en el editor SQL de tu panel de Supabase. Esto creará la tabla `characters` con los campos necesarios para mapear visualmente al personaje.

## Paso 3: Backend (Node.js)

Usa el cliente proporcionado en `node-client/zrenderer-client.js`.

```javascript
const ZRendererClient = require('./zrenderer-client');
const renderer = new ZRendererClient('http://localhost:11011', 'tu_token_aqui');

// Ejemplo: Generar imagen para un nuevo personaje
async function createCharacterSprite(charData) {
  const result = await renderer.render({
    job: charData.job,
    gender: charData.gender,
    head: charData.head,
    action: 0, // Stand
    frame: 0
  });

  // El resultado contiene la ruta local en el contenedor.
  // En producción, podrías configurar el renderer para que devuelva la imagen directamente
  // usando ?downloadimage=true y subirla a Supabase Storage.
  return result;
}
```

## Paso 4: Frontend (React + Three.js)

Usa el componente `ROSpriteBillboard.jsx` dentro de tu escena de `@react-three/fiber`.

```jsx
import { Canvas } from '@react-three/fiber';
import { ROSpriteBillboard } from './integration/react-three/ROSpriteBillboard';

function GameScene() {
  return (
    <Canvas>
      <ambientLight />
      <ROSpriteBillboard
        position={[0, 0, 0]}
        spriteParams={{
          job: 1,      // Swordman
          gender: 1,   // Male
          head: 5,
          action: 0    // Stand
        }}
      />
    </Canvas>
  );
}
```

## Notas Adicionales
- **Rendimiento:** No renderices en tiempo real para cada frame en producción. Lo ideal es renderizar las animaciones necesarias una vez, guardarlas en el Storage y servirlas vía CDN.
- **Seguridad:** Asegúrate de que el puerto `11011` del renderer solo sea accesible por tu backend de Node.js y no esté expuesto directamente a internet si no usas autenticación robusta.
