# Ragnarok Online Sprite Integration Package

This package provides tools to integrate the `zrenderer` service with modern web stacks, including **React (Three.js/Fiber)**, **Node.js**, and **Supabase**.

## Components

### 1. Supabase Schema (`/supabase/init.sql`)
A PostgreSQL schema for character management. It includes:
- A `characters` table storing all visual parameters (job, head, headgear, etc.).
- Row Level Security (RLS) policies to protect user-owned characters.
- Automatic timestamps for updates.

### 2. Node.js Client (`/node-client/index.js`)
A lightweight wrapper for the `zrenderer` API. Use it on your server to:
- Securely communicate with the renderer using your API token.
- Fetch sprite data as JSON or binary PNGs.
- Proxy requests to avoid exposing API tokens on the frontend.

### 3. React Three.js Billboard (`/react-three/ROSpriteBillboard.jsx`)
A React component for `@react-three/fiber` that:
- Fetches and displays a character sprite as a 3D billboard.
- Uses `THREE.NearestFilter` to maintain the pixel-art aesthetic.
- Handles texture loading and cleanup.

## Getting Started

### Step 1: Extract RO Assets
You need the official Ragnarok Online assets. Use [zextractor](https://github.com/zhad3/zextractor) with the filter list provided in `RESOURCES.md` of this repository.

### Step 2: Run zrenderer via Docker
Place your extracted assets in a `resources/` folder and run the renderer:

```bash
docker run -d --name zrenderer \
  -v ./zrenderer.docker.conf:/zren/zrenderer.conf \
  -v ./output:/zren/output \
  -v ./resources:/zren/resources \
  -p 11011:11011 \
  zhade/zrenderer:latest
```

### Step 3: Setup Supabase
Run the SQL found in `integration/supabase/init.sql` in your Supabase SQL Editor.

### Step 4: Integrate the Frontend
In your React application, use the `ROSpriteBillboard` component within your `Canvas`:

```jsx
import { Canvas } from '@react-three/fiber';
import { ROSpriteBillboard } from './integration/react-three/ROSpriteBillboard';

function MyGame() {
  const character = {
    job: 1, // Swordsman
    gender: 1,
    head: 5,
    // ... other config from Supabase
  };

  return (
    <Canvas>
      <ambientLight />
      <ROSpriteBillboard
        characterConfig={character}
        rendererUrl="http://your-node-proxy.com"
        position={[0, 1, 0]}
        scale={2}
      />
    </Canvas>
  );
}
```

## Architecture Recommendation
We recommend creating a **Node.js proxy** in your backend. This proxy should:
1. Receive a character ID from the frontend.
2. Fetch the character's config from Supabase.
3. Use the `Node.js Client` to request the sprite from `zrenderer`.
4. Return the PNG image to the frontend.

This prevents exposing your `zrenderer` access token and character configuration logic to the client.
