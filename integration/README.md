# Guía de Integración para RPG Táctico

Esta guía te ayudará a integrar el renderizador de sprites de Ragnarok Online (`zrenderer`) en un juego de RPG táctico utilizando **React**, **Node.js**, **Supabase** y **Three.js**.

## 1. Preparación de Recursos

Para que el renderizador funcione, necesitas extraer los assets de los archivos `.grf` del juego oficial.

1. Usa [zextractor](https://github.com/zhad3/zextractor) para extraer los archivos necesarios.
2. Sigue los filtros indicados en `RESOURCES.md` de la raíz de este repositorio.
3. Coloca todos los archivos extraídos en una carpeta llamada `resources` en la raíz de este proyecto.

## 2. Configuración con Docker

Hemos incluido un archivo `docker-compose.yml` para facilitar el despliegue.

```bash
# Iniciar el servicio del renderizador
docker-compose up -d zrenderer
```

El servicio estará disponible en `http://localhost:11011`. En la primera ejecución, se generará un archivo `accesstokens.conf` que contiene el token necesario para las peticiones.

## 3. Persistencia con Supabase

En la carpeta `integration/supabase/` encontrarás `init.sql`. Ejecuta este script en el editor SQL de tu proyecto de Supabase para crear la tabla de personajes.

Esta tabla (`public.characters`) guarda todos los parámetros necesarios para reconstruir visualmente a un personaje (job, head, headgear, etc.).

### Flujo de Datos Recomendado
1. **Frontend**: Solicita datos del personaje a tu API en Node.js.
2. **Backend**: Consulta a Supabase los parámetros visuales (e.g., `job: [4012], gender: 0`).
3. **Backend (Proxy)**: Envía estos parámetros al `zrenderer` y retorna la imagen al frontend.
4. **Frontend (Three.js)**: Usa `ROSpriteBillboard` para mostrar el sprite en la escena 3D.

## 4. Integración en el Backend (Node.js)

Usa el cliente `ZRendererClient` en `integration/node-client/zrenderer-client.js` para comunicarte con el renderizador desde tu servidor.

```javascript
const ZRendererClient = require('./integration/node-client/zrenderer-client');

const client = new ZRendererClient('http://localhost:11011', 'TU_TOKEN_AQUI');

// Obtener un buffer de imagen para procesar o guardar
const imageBuffer = await client.renderImage({
    job: [1001],
    action: 0,
    gender: 1
});
```

## 5. Integración en el Frontend (React + Three.js)

Para visualizar los personajes en un mundo 3D, usa el componente `ROSpriteBillboard` de `integration/react-three/ROSpriteBillboard.jsx`.

```jsx
import { Canvas } from '@react-three/fiber';
import ROSpriteBillboard from './integration/react-three/ROSpriteBillboard';

function GameScene() {
    const charParams = {
        job: [4012],
        head: 1,
        gender: 0,
        action: 0
    };

    return (
        <Canvas>
            <ambientLight />
            <ROSpriteBillboard
                baseUrl="http://localhost:11011"
                accessToken="TU_TOKEN"
                spriteParams={charParams}
                position={[0, 1, 0]}
            />
        </Canvas>
    );
}
```

## Dependencias

Asegúrate de instalar las dependencias necesarias en tu proyecto (ver `integration/package.json`):
- `@supabase/supabase-js`
- `three`
- `@react-three/fiber`
- `react`
- `react-dom`
