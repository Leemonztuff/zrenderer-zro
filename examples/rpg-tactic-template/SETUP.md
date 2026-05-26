# Configuración del Proyecto RPG Táctico

Este template proporciona una base sólida para crear un juego de RPG táctico utilizando el renderizador de Ragnarok Online (`zrenderer`), React, Node.js, Supabase y Three.js.

## Arquitectura del Proyecto

- **zrenderer**: Servicio en D que se encarga de procesar los assets de RO y generar los sprites.
- **Backend (Node.js)**: Actúa como un proxy para el renderizador y gestiona la persistencia de datos con Supabase.
- **Frontend (React + Three.js)**: La interfaz del juego que visualiza los personajes en un entorno 3D.
- **Supabase**: Base de datos para guardar personajes, cuentas y progreso.

## Pasos para la Configuración

### 1. Iniciar el Renderizador (zrenderer)

Asegúrate de tener los assets de RO en la carpeta `resources/` y luego inicia el servicio con Docker:

```bash
docker-compose up -d zrenderer
```

El token de acceso se generará en el archivo `accesstokens.conf`.

### 2. Configurar la Base de Datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ve al editor SQL y ejecuta el contenido de `integration/supabase/init.sql`. Esto creará la tabla `public.characters`.

### 3. Configurar el Backend (Server)

1. Entra en `examples/rpg-tactic-template/server`.
2. Crea un archivo `.env` basado en los parámetros necesarios:
   ```env
   PORT=3001
   ZRENDERER_URL=http://localhost:11011
   ZRENDERER_TOKEN=tu_token_de_accesstokens_conf
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_KEY=tu_anon_key_de_supabase
   ```
3. Instala las dependencias e inicia el servidor:
   ```bash
   npm install
   npm start
   ```

### 4. Configurar el Frontend (Client)

1. Entra en `examples/rpg-tactic-template/client`.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

El cliente estará disponible en `http://localhost:3000`.

## Uso del Componente ROSpriteBillboard

El frontend utiliza el componente `ROSpriteBillboard` que se encuentra en `integration/react-three/`. Este componente se encarga de solicitar el sprite al backend proxy y renderizarlo como un billboard nítido en Three.js.

```jsx
<ROSpriteBillboard
    baseUrl="http://localhost:3001/api" // Apunta al proxy de tu backend
    spriteParams={{
        job: [4012], // ID del trabajo (Sniper)
        gender: 1,   // Género (1: Male, 0: Female)
        head: 1,     // ID de la cabeza
        action: 0    // ID de la acción (Stand, Walk, etc.)
    }}
    position={[0, 1, 0]}
    scale={0.03}
/>
```
