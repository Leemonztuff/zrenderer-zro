import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  // Parámetros de ejemplo para el personaje
  const [characterParams, setCharacterParams] = React.useState({
    job: [4012], // Sniper
    gender: 0,
    head: 5,
    action: 0 // Stand
  });

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  const jobs = {
    Sniper: [4012],
    LordKnight: [4008],
    HighPriest: [4011],
    Whitesmith: [4010]
  };

  const actions = {
    Stand: 0,
    Walk: 8,
    Attack: 16,
    Hurt: 24,
    Sit: 32
  };

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
              position={[0, 1.2, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid
          infiniteGrid
          fadeDistance={30}
          cellColor="#444"
          sectionColor="#666"
        />
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
        <h1>RPG Tactic Template</h1>
        <p>Usa el mouse para rotar la cámara.</p>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'rgba(0,0,0,0.5)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Job:</span>
          {Object.entries(jobs).map(([name, id]) => (
            <button
              key={name}
              onClick={() => setCharacterParams(prev => ({ ...prev, job: id }))}
              style={{
                padding: '5px 10px',
                background: characterParams.job[0] === id[0] ? '#007bff' : '#444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Acción:</span>
          {Object.entries(actions).map(([name, id]) => (
            <button
              key={name}
              onClick={() => setCharacterParams(prev => ({ ...prev, action: id }))}
              style={{
                padding: '5px 10px',
                background: characterParams.action === id ? '#28a745' : '#444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameScene;
