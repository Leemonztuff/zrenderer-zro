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

### 1. Servidor (Backend)

```bash
cd server
npm install
# Configura el token en index.js o mediante variables de entorno
npm start
```

### 2. Cliente (Frontend)

```bash
cd client
npm install
npm run dev
```

## Integración con Supabase

Para persistir tus personajes, utiliza el script SQL ubicado en `integration/supabase/init.sql`.

1. Crea un proyecto en Supabase.
2. Ejecuta el SQL en el editor de consultas de Supabase.
3. Actualiza el backend para consultar la tabla `public.characters` en lugar de usar datos estáticos.

## Créditos

Basado en el motor de renderizado [zrenderer](https://github.com/zhad3/zrenderer).
Los assets de Ragnarok Online son propiedad de Gravity Co., Ltd.
