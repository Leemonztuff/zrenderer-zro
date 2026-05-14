import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  const [job, setJob] = useState([4012]); // Sniper por defecto
  const [action, setAction] = useState(0); // Stand por defecto

  // Parámetros de ejemplo para el personaje
  const characterParams = {
    job,
    gender: 0,
    head: 5,
    action
  };

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {/* El Billboard de RO usando el proxy del backend */}
            <ROSpriteBillboard
              baseUrl={PROXY_URL}
              spriteParams={characterParams}
              position={[0, 1, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid />
        <OrbitControls makeDefault />
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
        <h1>RPG Tactic Template</h1>
        <p>Usa el mouse para rotar la cámara.</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => setJob([4012])} style={{ padding: '8px 16px', cursor: 'pointer' }}>Sniper</button>
          <button onClick={() => setJob([1001])} style={{ padding: '8px 16px', cursor: 'pointer' }}>Scorpion</button>
          <button onClick={() => setAction(0)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Stand</button>
          <button onClick={() => setAction(8)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Walk</button>
        </div>
      </div>
    </div>
  );
}

export default GameScene;
