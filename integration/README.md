# Tactical RPG Integration Guide (zrenderer)

This directory contains components and configurations to integrate `zrenderer` into a modern web stack (React, Node.js, Supabase, Three.js).

## Architecture

1.  **Renderer (D):** Runs in a Docker container, providing a REST API to render RO sprites.
2.  **Backend (Node.js):** Acts as a proxy/client to the renderer, handling authentication and character data retrieval from Supabase.
3.  **Database (Supabase):** Stores character configurations (Job ID, Head ID, etc.).
4.  **Frontend (React + Three.js):** Displays the rendered sprites as billboards in a 3D tactical map.

## Setup Instructions

### 1. Run the Renderer

Extract your RO assets (using [zextractor](https://github.com/zhad3/zextractor)) and place them in a `resources/` directory.

Run the renderer using Docker:

```bash
docker run -d --name zrenderer \
  -v ./zrenderer.docker.conf:/zren/zrenderer.conf \
  -v ./output:/zren/output \
  -v ./resources:/zren/resources \
  -p 11011:11011 \
  zhade/zrenderer:latest
```

### 2. Backend Integration (Node.js)

Use the provided client in `node-client/`.

```javascript
const ZRendererClient = require('./integration/node-client');

const client = new ZRendererClient('http://localhost:11011', 'YOUR_TOKEN');

// Example: Express route to serve a sprite
app.get('/api/sprite/:characterId', async (req, res) => {
  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('id', req.params.characterId)
    .single();

  const params = ZRendererClient.mapCharacterToRenderParams(character);
  const imageBuffer = await client.renderSprite(params);

  res.set('Content-Type', 'image/png');
  res.send(imageBuffer);
});
```

### 3. Database (Supabase)

Run the SQL script in `supabase-schema/init.sql` in your Supabase SQL Editor. This will create the `characters` table with all necessary fields for the renderer.

### 4. Frontend (React + Three.js)

Use the `ROSpriteBillboard` component to display characters.

```jsx
import { Canvas } from '@react-three/fiber';
import ROSpriteBillboard from './integration/three-component/ROSpriteBillboard';

function GameScene() {
  return (
    <Canvas>
      <ambientLight />
      {/* Positioned on a tactical grid */}
      <ROSpriteBillboard
        url="http://your-backend.com/api/sprite/char-123"
        position={[2, 0, 5]}
        scale={2}
      />
    </Canvas>
  );
}
```

## Tips for Tactical RPGs

*   **Caching:** The renderer supports `returnExistingFiles`. Ensure your Node.js client or a CDN caches the rendered PNGs to avoid re-rendering the same sprite/action multiple times.
*   **Animations:** To animate, change the `action` and `frame` parameters. `zrenderer` can also return APNGs or ZIPs of frames if needed.
*   **Pixel Art:** Always use `THREE.NearestFilter` for textures to keep the Ragnarok Online pixel art style crisp.
