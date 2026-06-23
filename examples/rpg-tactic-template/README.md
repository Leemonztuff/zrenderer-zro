# RPG Tactic Template (RO Renderer)

Este es un punto de partida para crear un juego de RPG táctico utilizando sprites de Ragnarok Online renderizados dinámicamente.

## Estructura del Proyecto

- `server/`: Backend en Node.js/Express. Gestiona la lógica de personajes, persistencia en Supabase y actúa como proxy para el renderizador.
- `client/`: Frontend en React utilizando Vite, Three.js y @react-three/fiber. Incluye lógica de movimiento y sincronización.

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

```bash
cd client
npm install
npm run dev
```

El cliente estará disponible en `http://localhost:3000`.

## Integración con Supabase

Para persistir tus personajes, utiliza el script SQL ubicado en `integration/supabase/init.sql`. Este esquema incluye campos para la apariencia (job, head, gender) y la posición (`pos_x`, `pos_y`, `pos_z`).

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ejecuta el SQL en el editor de consultas de Supabase.
3. El backend ya está configurado para usar esta tabla, solo necesitas configurar tus credenciales en el archivo `.env`.

## Características del Template

- **Renderizado Dinámico**: Usa `zrenderer` para generar sprites de RO sobre la marcha.
- **Movimiento 3D**: Lógica de movimiento en rejilla (N, S, E, W) con animaciones de caminata automáticas.
- **Sincronización**: Guarda la posición del personaje en la base de datos automáticamente al moverlo.
- **Personalización**: Interfaz para cambiar de clase, género y estilo de cabeza en tiempo real.

## Créditos

Basado en el motor de renderizado [zrenderer](https://github.com/zhad3/zrenderer).
Los assets de Ragnarok Online son propiedad de Gravity Co., Ltd.
