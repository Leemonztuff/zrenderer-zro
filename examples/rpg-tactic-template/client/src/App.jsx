import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  // Parámetros de ejemplo para el personaje
  const characterParams = {
    job: [4012], // Sniper
    gender: 0,
    head: 5,
    action: 0 // Stand
  };

  // En una app real, podrías usar el proxy del backend para evitar CORS o exponer el token
  // const PROXY_URL = 'http://localhost:3001/api/render';
  const RENDERER_URL = 'http://localhost:11011';

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {/* El Billboard de RO */}
            <ROSpriteBillboard
              baseUrl={RENDERER_URL}
              accessToken="test-token" // Reemplazar con el token real generado en accesstokens.conf
              spriteParams={characterParams}
              position={[0, 1, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid />
        <OrbitControls makeDefault />
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif' }}>
        <h1>RPG Tactic Template</h1>
        <p>Usa el mouse para rotar la cámara.</p>
      </div>
    </div>
  );
}

export default GameScene;
