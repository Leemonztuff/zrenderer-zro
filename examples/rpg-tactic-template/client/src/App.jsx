import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

const JOBS = [
  { id: 4012, name: 'Sniper' },
  { id: 4001, name: 'Lord Knight' },
  { id: 4018, name: 'Assassin Cross' },
  { id: 1001, name: 'Scorpion (Monster)' }
];

const ACTIONS = [
  { id: 0, name: 'Stand' },
  { id: 8, name: 'Walk' },
  { id: 16, name: 'Attack' },
  { id: 17, name: 'Sit' }
];

function GameScene() {
  const [job, setJob] = useState([4012]);
  const [action, setAction] = useState(0);
  const [gender, setGender] = useState(1); // 1: Male, 0: Female

  const characterParams = {
    job,
    gender,
    head: 5,
    action
  };

  // URL del proxy del servidor (asegúrate de que el servidor en /server esté corriendo)
  const PROXY_URL = 'http://localhost:3001/api';

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas camera={{ position: [4, 4, 4], fov: 45 }}>
        <ambientLight intensity={1.0} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
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
          fadeDistance={50}
          fadeStrength={5}
          sectionSize={1}
          sectionColor="#333"
          cellSize={0.5}
          cellColor="#222"
        />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>

      {/* Interfaz de Usuario */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        padding: '20px',
        borderRadius: '12px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        pointerEvents: 'none',
        border: '1px solid #444'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>Tactical RPG Template</h1>
        <p style={{ margin: '0 0 20px 0', opacity: 0.8 }}>Visualizador de Sprites Ragnarok Online</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Trabajo / Monstruo:</label>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {JOBS.map(j => (
                <button
                  key={j.id}
                  onClick={() => setJob([j.id])}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    background: job[0] === j.id ? '#4a90e2' : '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  {j.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Género:</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={() => setGender(1)}
                style={{
                  flex: 1, padding: '6px', cursor: 'pointer',
                  background: gender === 1 ? '#4a90e2' : '#333',
                  color: 'white', border: 'none', borderRadius: '4px'
                }}
              >
                Masculino
              </button>
              <button
                onClick={() => setGender(0)}
                style={{
                  flex: 1, padding: '6px', cursor: 'pointer',
                  background: gender === 0 ? '#e24a4a' : '#333',
                  color: 'white', border: 'none', borderRadius: '4px'
                }}
              >
                Femenino
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Acción:</label>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {ACTIONS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAction(a.id)}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    background: action === a.id ? '#50c878' : '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.6 }}>
          Click derecho para desplazar, scroll para zoom.
        </p>
      </div>
    </div>
  );
}

export default GameScene;
