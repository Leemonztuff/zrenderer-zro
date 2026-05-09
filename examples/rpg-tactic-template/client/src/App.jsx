import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  const [job, setJob] = useState([4012]); // Sniper por defecto
  const [action, setAction] = useState(0); // Stand por defecto
  const [gender, setGender] = useState(0); // Female por defecto

  // Parámetros de ejemplo para el personaje
  const characterParams = {
    job,
    gender,
    head: 5,
    action
  };

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  const jobs = [
    { name: 'Sniper', id: [4012] },
    { name: 'Knight', id: [4008] },
    { name: 'Assassin', id: [4013] },
    { name: 'Scorpion', id: [1001] },
  ];

  const actions = [
    { name: 'Stand', id: 0 },
    { name: 'Sit', id: 8 },
    { name: 'Walk', id: 24 }, // En algunas versiones el walk es 24+, depende del sprite
    { name: 'Attack', id: 16 },
  ];

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

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <div>
            <strong>Gender:</strong>
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <button onClick={() => setGender(1)} style={{ padding: '8px 16px', cursor: 'pointer', background: gender === 1 ? '#555' : '#fff' }}>Male</button>
              <button onClick={() => setGender(0)} style={{ padding: '8px 16px', cursor: 'pointer', background: gender === 0 ? '#555' : '#fff' }}>Female</button>
            </div>
          </div>

          <div>
            <strong>Job:</strong>
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px', flexWrap: 'wrap' }}>
              {jobs.map(j => (
                <button key={j.name} onClick={() => setJob(j.id)} style={{ padding: '8px 16px', cursor: 'pointer', background: JSON.stringify(job) === JSON.stringify(j.id) ? '#555' : '#fff' }}>
                  {j.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <strong>Action:</strong>
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              {actions.map(a => (
                <button key={a.name} onClick={() => setAction(a.id)} style={{ padding: '8px 16px', cursor: 'pointer', background: action === a.id ? '#555' : '#fff' }}>
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScene;
