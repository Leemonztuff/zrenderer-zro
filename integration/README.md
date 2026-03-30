# Integration for Tactical RPG (React, Node, Supabase, Three.js)

Esta carpeta contiene las herramientas necesarias para integrar `zrenderer` en tu juego RPG táctico.

## 1. Requisitos Previos

1. **Recursos de Ragnarok Online**: Debes extraer los archivos `.spr`, `.act` y `.lua` de los archivos `.grf` del juego original.
   - Usa [zextractor](https://github.com/zhad3/zextractor) para esto.
   - Sigue los filtros detallados en [RESOURCES.md](../RESOURCES.md).

2. **Docker**: La forma más fácil de ejecutar el servidor de renderizado es a través de Docker.

## 2. Configuración del Servidor (zrenderer)

Utiliza el archivo `docker-compose.yml` en la raíz del proyecto para levantar el servicio:

```bash
docker-compose up -d
```

Asegúrate de tener tus recursos en la carpeta `resources/` y el archivo `zrenderer.docker.conf` configurado.

**Nota Importante**: La primera vez que se ejecute, se generará un archivo `accesstokens.conf`. Deberás leerlo para obtener el token que usarás en el cliente Node.js y en el componente de React.

## 3. Componentes de Integración

### Cliente Node.js (`/node-client/zrenderer-client.js`)
Un cliente sencillo para interactuar con la API desde tu backend de Node.js si necesitas pre-generar sprites o manejarlos desde el servidor.

### Componente React Three Fiber (`/react-three/ROSpriteBillboard.jsx`)
Un componente listo para usar en tu escena de Three.js que renderiza al personaje con los parámetros visuales adecuados y aplica el filtro `NearestFilter` para mantener el estilo pixel art.

```jsx
import ROSpriteBillboard from './integration/react-three/ROSpriteBillboard';

// En tu componente de escena:
<ROSpriteBillboard
  baseUrl="http://mi-servidor:11011"
  accessToken="mi-token-generado"
  spriteParams={{
    job: 0, // Novice
    head: 15,
    gender: 1, // Male
    action: 0, // Stand
    headgear: [1, 24]
  }}
  scale={2}
/>
```

### Esquema de Base de Datos (Supabase) (`/supabase/init.sql`)
Incluimos un script SQL para crear la tabla de `public.characters` que guarda todos los parámetros visuales necesarios para reconstruir la apariencia del personaje en cada renderizado.

## 4. Flujo de Trabajo Recomendado

1. **Persistencia**: Cuando un jugador crea un personaje, guarda sus IDs visuales (job, head, headgears, palettes) en la tabla `characters` de Supabase.
2. **Renderizado**: En tu cliente de React, consulta la base de datos para obtener los parámetros visuales.
3. **Visualización**: Pasa esos parámetros al componente `ROSpriteBillboard`, el cual se encargará de pedir el sprite dinámico al servidor `zrenderer`.
4. **Animación**: Cambia el parámetro `action` en los `spriteParams` para animar al personaje (ataque, caminar, daño, etc.).

---
*Todos los medios y contenido relacionados con Ragnarok Online tienen copyright © de Gravity Co., Ltd & Lee Myoungjin.*
