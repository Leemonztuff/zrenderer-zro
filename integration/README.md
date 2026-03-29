# Integración de zrenderer para Juegos de RPG Táctico

Este directorio contiene herramientas y guías para integrar el renderizador `zrenderer` con un stack moderno de desarrollo para juegos web.

## Stack Sugerido
- **Frontend:** React + @react-three/fiber + @react-three/drei
- **Backend:** Node.js (Express o Fastify)
- **Base de Datos:** Supabase (PostgreSQL + Auth)
- **Renderizado de Assets:** zrenderer (esta herramienta)

## Estructura de este directorio
- `/supabase/init.sql`: Esquema SQL para almacenar parámetros visuales de personajes en Supabase.
- `/node-client/zrenderer-client.js`: Cliente helper para el backend de Node.js.
- `/react-three/ROSpriteBillboard.jsx`: Componente React para renderizar sprites en Three.js con pixel-art perfecto.

## Pasos para la Integración

### 1. Preparar los Assets de Ragnarok Online
Sigue las instrucciones en [RESOURCES.md](../RESOURCES.md) para extraer los archivos `.spr`, `.act` y `.lua` necesarios de tus archivos GRF. Los archivos deben estar en una carpeta llamada `resources/` en la raíz del proyecto.

### 2. Levantar el Servicio con Docker
Usa el archivo `docker-compose.yml` proporcionado:

```bash
docker-compose up -d
```
El servicio estará disponible en `http://localhost:11011`. Revisa los logs para obtener tu token de acceso generado automáticamente.

### 3. Configurar Supabase
Ejecuta el script `/supabase/init.sql` en el editor SQL de tu proyecto Supabase para crear la tabla de personajes con soporte para todos los parámetros de `zrenderer`.

### 4. Usar en React con Three.js
Importa el componente `ROSpriteBillboard` para mostrar tus personajes en 3D:

```jsx
import ROSpriteBillboard from './react-three/ROSpriteBillboard';

const Character = ({ data }) => (
  <ROSpriteBillboard
    baseUrl="http://mi-servidor:11011"
    accessToken="tu-token-aqui"
    spriteParams={{
      job: data.job,
      gender: data.gender,
      action: 0, // Stand
      frame: -1  // Animación completa
    }}
    position={[0, 1, 0]}
  />
);
```

### 5. Backend de Node.js
Usa `ZRendererClient` para obtener URLs de renderizado o buffers de imagen si necesitas procesarlas en el servidor (por ejemplo, para pre-renders o cacheado).

## Notas Adicionales
- **CORS:** Asegúrate de habilitar CORS en `zrenderer.docker.conf` (`enableCORS=true`) si vas a realizar peticiones directamente desde el navegador al servicio de renderizado.
- **Pixel Art:** El componente de Three.js incluido usa `NearestFilter` para mantener la estética original del pixel art de RO sin desenfoque.
