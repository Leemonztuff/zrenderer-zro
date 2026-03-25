# Integración de zrenderer para RPG Táctico

Esta guía explica cómo integrar `zrenderer` en tu juego RPG táctico utilizando Node.js, React, Supabase y Three.js.

## Estructura de Integración
Hemos preparado las herramientas básicas en el directorio `integration/`:

1.  **Node Client** (`node-client/zrenderer-client.js`): Cliente para realizar peticiones desde tu servidor Node.js.
2.  **React Component** (`react-three/ROSpriteBillboard.jsx`): Componente para mostrar los sprites en una escena de Three.js con `@react-three/fiber`.
3.  **Supabase Schema** (`supabase/init.sql`): Esquema de base de datos para almacenar los atributos visuales de tus personajes.

## Pasos para la Integración

### 1. Preparación de Assets de Ragnarok Online
`zrenderer` requiere los archivos `.spr`, `.act`, `.pal` y archivos `.lua` del juego original. Estos deben estar extraídos, descomprimidos y sin encriptar.

Utiliza [zextractor](https://github.com/zhad3/zextractor) con los filtros indicados en `RESOURCES.md` para obtener solo los archivos necesarios y guárdalos en una carpeta llamada `resources/` en la raíz de este proyecto.

### 2. Despliegue con Docker
Usa el archivo `docker-compose.yml` proporcionado:

```bash
docker-compose up -d
```

Esto levantará el servidor de renderizado en `http://localhost:11011`. Asegúrate de que el archivo `zrenderer.docker.conf` esté configurado correctamente.

### 3. Uso en el Servidor (Node.js)
El `ZRendererClient` facilita la interacción con la API.

```javascript
const ZRendererClient = require('./integration/node-client/zrenderer-client');
const client = new ZRendererClient('http://localhost:11011', 'tu_token_de_acceso');

// Ejemplo de renderizado de un Sniper sentado
const spriteBlob = await client.render({
  job: [4012],
  action: 17,
  frame: 2
});
```

### 4. Uso en el Frontend (React + Three.js)
Integra los sprites directamente en tu escena 3D. El componente `ROSpriteBillboard` se encarga de aplicar el filtrado "nearest" para mantener el estilo pixel art.

```jsx
import ROSpriteBillboard from './integration/react-three/ROSpriteBillboard';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <ROSpriteBillboard
        baseUrl="http://mi-servidor.com:11011"
        accessToken="mi_token"
        spriteParams={{ job: 4012, action: 17, frame: 2 }}
        position={[0, 1, 0]}
        scale={2}
      />
    </>
  );
}
```

### 5. Persistencia con Supabase
Ejecuta el script `integration/supabase/init.sql` en el editor SQL de tu panel de Supabase. Esto creará la tabla `characters` con todos los campos necesarios para recrear la apariencia de un personaje de Ragnarok Online.

---
Cualquier duda o problema, revisa los archivos originales en la raíz del repositorio o los logs del contenedor de `zrenderer`.
