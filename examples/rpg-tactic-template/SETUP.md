# Configuración del Proyecto RPG Táctico

Este template proporciona una base sólida para crear un juego de RPG táctico utilizando el renderizador de Ragnarok Online (`zrenderer`), React, Node.js, Supabase y Three.js.

## Arquitectura del Proyecto

- **zrenderer**: Servicio en D que se encarga de procesar los assets de RO y generar los sprites.
- **Backend (Node.js)**: Actúa como un proxy para el renderizador y gestiona la persistencia de datos con Supabase. Incluye endpoints para obtener personajes y actualizar su posición en el grid.
- **Frontend (React + Three.js)**: Interfaz de juego con movimiento táctico por celdas, cámara orbital y gestión de animaciones RO (Stand, Walk, Attack, etc.).
- **Supabase**: Persistencia de personajes (clase, género, posición, etc.).

## Pasos para la Configuración

### 1. Iniciar el Renderizador (zrenderer)

Asegúrate de tener los assets de RO en la carpeta `resources/` de la raíz del repo y luego inicia el servicio con Docker:

```bash
# Desde la raíz del repositorio
docker-compose up -d zrenderer
```

El token de acceso se generará en `accesstokens.conf`.

### 2. Configurar la Base de Datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ve al editor SQL y ejecuta el contenido de `integration/supabase/init.sql`.
3. Inserta un personaje de prueba manualmente o mediante el panel para ver la persistencia en acción.

### 3. Configurar el Backend (Server)

1. Entra en `examples/rpg-tactic-template/server`.
2. Crea un archivo `.env`:
   ```env
   PORT=3001
   ZRENDERER_URL=http://localhost:11011
   ZRENDERER_TOKEN=tu_token_de_accesstokens_conf
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_KEY=tu_anon_key_de_supabase
   ```
3. Instala e inicia:
   ```bash
   npm install
   npm start
   ```

### 4. Configurar el Frontend (Client)

1. Entra en `examples/rpg-tactic-template/client`.
2. Instala e inicia el servidor de desarrollo:
   ```bash
   npm install
   npm run dev
   ```

El juego estará disponible en `http://localhost:3000`.

## Características del Template

- **Movimiento Táctico**: Las flechas de dirección en la UI mueven al personaje por un grid.
- **Animaciones Automáticas**: Al moverte, el personaje cambia a la animación 'Walk' y vuelve a 'Stand' al detenerse.
- **Persistencia**: La posición `pos_x` y `pos_y` se sincroniza con Supabase mediante el endpoint `PATCH`.
- **Customización**: Selectores integrados para cambiar de Job (Sniper, Knight, Assassin) y Género en tiempo real.
