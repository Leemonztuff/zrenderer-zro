import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  const [params, setParams] = useState({
    job: [4012], // Sniper
    gender: 0,
    head: 5,
    action: 0 // Stand
  });

  const updateJob = (jobId) => {
    setParams(prev => ({ ...prev, job: [jobId] }));
  };

  const updateAction = (actionId) => {
    setParams(prev => ({ ...prev, action: actionId }));
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
              spriteParams={params}
              position={[0, 1, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid />
        <OrbitControls makeDefault />
      </Canvas>

      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontFamily: 'sans-serif',
        pointerEvents: 'none'
      }}>
        <h1 style={{ margin: 0 }}>RPG Tactic Template</h1>
        <p>Usa el mouse para rotar la cámara.</p>

        <div style={{
          marginTop: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'auto'
        }}>
          <div>
            <strong>Trabajo:</strong><br/>
            <button onClick={() => updateJob(4012)}>Sniper</button>
            <button onClick={() => updateJob(0)}>Novice</button>
            <button onClick={() => updateJob(1001)}>Scorpion (Mob)</button>
          </div>
          <div>
            <strong>Acción:</strong><br/>
            <button onClick={() => updateAction(0)}>Stand</button>
            <button onClick={() => updateAction(17)}>Sit</button>
            <button onClick={() => updateAction(8)}>Attack</button>
          </div>
          <div style={{ fontSize: '0.8em', marginTop: 10, opacity: 0.7 }}>
            Job: {params.job[0]} | Action: {params.action}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScene;
