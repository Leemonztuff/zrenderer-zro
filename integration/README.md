# Guía de Integración para Juego RPG Táctico

Esta guía proporciona instrucciones paso a paso para integrar `zrenderer` en un stack moderno utilizando React, Node.js, Supabase y Three.js.

## 1. Configuración de los Assets de Ragnarok Online

Para que el renderizador funcione, necesitas extraer los archivos de los archivos `.grf` del juego original.

1.  Usa una herramienta como [zextractor](https://github.com/zhad3/zextractor).
2.  Extrae los archivos siguiendo los filtros definidos en el archivo `RESOURCES.md` de la raíz de este repo.
3.  Coloca los archivos extraídos en una carpeta llamada `resources` en la raíz de este proyecto.
4.  Asegúrate de que los archivos estén **descomprimidos** y **sin cifrar**.

## 2. Ejecución con Docker

Hemos incluido un archivo `docker-compose.yml` para facilitar la ejecución de los servicios.

```bash
docker-compose up -d
```

En la primera ejecución, `zrenderer` generará un token de administrador automáticamente. Puedes encontrarlo en los logs:

```bash
docker logs zrenderer
```

## 3. Integración con Supabase

El archivo `integration/supabase/init.sql` contiene el esquema básico para persistir las configuraciones visuales de los personajes.

1.  Ve a tu dashboard de Supabase (o instancia local).
2.  Ejecuta el contenido de `init.sql` en el SQL Editor.
3.  Esto creará la tabla `characters` que incluye campos para `job`, `head`, `headgear`, `palettes`, etc.

## 4. Uso del Cliente Node.js

Usa el archivo en `integration/node-client/zrenderer-client.js` para realizar peticiones desde tu backend (p. ej., para validar equipos o generar previsualizaciones persistentes).

```javascript
const ZRendererClient = require('./lib/zrenderer-client');
const client = new ZRendererClient('http://zrenderer:11011', 'tu_token_aqui');

// Ejemplo: Obtener la URL de un sprite para un Novice (ID 0) sentado (acción 17)
const renderData = await client.render({
  job: 0,
  action: 17,
  gender: 1
});
```

## 5. Visualización en 3D con React y Three.js

El componente `integration/react-three/ROSpriteBillboard.jsx` permite renderizar los sprites directamente como "billboards" (planos que siempre miran a la cámara) en una escena 3D.

```jsx
import { Canvas } from '@react-three/fiber';
import ROSpriteBillboard from './components/ROSpriteBillboard';

function GameScene() {
  return (
    <Canvas>
      <ambientLight />
      <ROSpriteBillboard
        baseUrl="http://localhost:11011"
        accessToken="tu_token_aqui"
        spriteParams={{
          job: 4012, // Sniper
          action: 0,  // Stand
          gender: 0   // Female
        }}
        scale={2}
      />
    </Canvas>
  );
}
```

## Recomendaciones de Rendimiento

*   **Cache:** El renderizador soporta `enableUniqueFilenames`. Úsalo para que el servicio no tenga que re-procesar sprites idénticos.
*   **Texturas:** Las texturas se cargan con `NearestFilter` para mantener el estilo pixel-art nítido.
*   **Supabase:** Te recomendamos usar Supabase Storage para guardar copias de los sprites generados si planeas tener miles de peticiones recurrentes, reduciendo la carga sobre el renderizador en tiempo real.
