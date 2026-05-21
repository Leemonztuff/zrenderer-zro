# RPG Tactic Template (RO Renderer)

Este es un punto de partida para crear un juego de RPG táctico utilizando sprites de Ragnarok Online renderizados dinámicamente.

## Estructura del Proyecto

- `server/`: Backend en Node.js/Express. Sirve como puente entre el juego y el renderizador/base de datos.
- `client/`: Frontend en React utilizando Vite, Three.js y @react-three/fiber.

## Requisitos Previos

1. Tener los assets de RO extraídos en la carpeta `resources/` de la raíz del proyecto.
2. Haber levantado el servicio `zrenderer` con Docker:
   ```bash
   docker-compose up -d zrenderer
   ```
3. Obtener el token de acceso de `accesstokens.conf`.

## Instalación y Uso

### 1. Renderizador (zrenderer)

Asegúrate de tener Docker instalado y configurado.

```bash
# Desde la raíz del proyecto
docker-compose up -d zrenderer
```

En la primera ejecución, se generará el archivo `accesstokens.conf`. Abre este archivo para copiar tu token de acceso.

### 2. Servidor (Backend)

```bash
cd server
npm install
```

Crea un archivo `.env` o edita `index.js` para configurar el token del renderizador:
```env
ZRENDERER_TOKEN=TU_TOKEN_AQUI
```

Inicia el servidor:
```bash
npm start
```

El servidor correrá en `http://localhost:3001`.

### 3. Cliente (Frontend)

El cliente está configurado para comunicarse con el servidor proxy en el puerto 3001.

```bash
cd client
npm install
npm run dev
```

El cliente estará disponible en `http://localhost:3000`.

## Flujo de Trabajo Recomendado

1. **Proxy de Backend**: El juego (Frontend) no debería conectarse directamente al `zrenderer` para evitar exponer el token de acceso. En su lugar, usa el endpoint `/api/render` de tu servidor Node.js.
2. **Persistencia**: Guarda los parámetros visuales (`job`, `head`, `gender`) en la tabla `characters` de Supabase. El servidor proxy ya tiene un endpoint `/api/character/:id` para recuperar estos datos.

## Integración con Supabase

Para persistir tus personajes, utiliza el script SQL ubicado en `integration/supabase/init.sql`.

1. Crea un proyecto en Supabase.
2. Ejecuta el SQL en el editor de consultas de Supabase.
3. Actualiza el backend para consultar la tabla `public.characters` en lugar de usar datos estáticos.

## Créditos

Basado en el motor de renderizado [zrenderer](https://github.com/zhad3/zrenderer).
Los assets de Ragnarok Online son propiedad de Gravity Co., Ltd.
