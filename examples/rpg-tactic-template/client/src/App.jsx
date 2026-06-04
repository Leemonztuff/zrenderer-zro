import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

const PROXY_URL = 'http://localhost:3001/api';

const JOBS = [
  { name: 'Sniper', id: [4012] },
  { name: 'Knight', id: [7] },
  { name: 'Assassin', id: [12] },
  { name: 'Scorpion', id: [1000] }
];

const ACTIONS = [
  { name: 'Stand', id: 0 },
  { name: 'Walk', id: 8 },
  { name: 'Attack', id: 16 },
  { name: 'Sit', id: 17 }
];

function GameScene() {
  const [charData, setCharData] = useState({
    name: 'Cargando...',
    visuals: {
      job: [4012],
      gender: 0,
      head: 5,
      action: 0
    }
  });

  const [position, setPosition] = useState([0, 0, 0]);

  // Cargar personaje inicial
  useEffect(() => {
    fetch(`${PROXY_URL}/character/default-id`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
      })
      .catch(err => {
        console.warn("Backend no disponible, usando local fallback");
        setCharData({
          name: 'Héroe de Prueba',
          visuals: { job: [4012], gender: 0, head: 5, action: 0 }
        });
      });
  }, []);

  const updateVisuals = (patch) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, ...patch }
    }));
  };

  const move = useCallback((dx, dz) => {
    // Activar animación de caminar
    updateVisuals({ action: 8 });

    // Actualizar posición
    setPosition(prev => [prev[0] + dx, prev[1], prev[2] + dz]);

    // Volver a 'Stand' después de un momento
    setTimeout(() => {
      updateVisuals({ action: 0 });
    }, 500);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [8, 8, 8], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={position}>
            <ROSpriteBillboard
              baseUrl={PROXY_URL}
              spriteParams={charData.visuals}
              position={[0, 1, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid sectionSize={1} cellSize={0.5} />
        <OrbitControls makeDefault />
      </Canvas>

      {/* UI Overlay */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        color: 'white', fontFamily: 'sans-serif',
        pointerEvents: 'none', background: 'rgba(0,0,0,0.5)',
        padding: '20px', borderRadius: '8px'
      }}>
        <h1 style={{ margin: '0 0 10px 0' }}>{charData.name}</h1>
        <p>Posición: {position[0]}, {position[2]}</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>

          {/* Movimiento */}
          <div>
            <strong>Movimiento:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: '5px', marginTop: '5px' }}>
              <div />
              <button onClick={() => move(0, -1)} title="North">▲</button>
              <div />
              <button onClick={() => move(-1, 0)} title="West">◀</button>
              <button onClick={() => move(0, 1)} title="South">▼</button>
              <button onClick={() => move(1, 0)} title="East">▶</button>
            </div>
          </div>

          {/* Trabajo / Job */}
          <div>
            <strong>Clase:</strong>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
              {JOBS.map(job => (
                <button
                  key={job.name}
                  onClick={() => updateVisuals({ job: job.id })}
                  style={{ background: charData.visuals.job[0] === job.id[0] ? '#4CAF50' : '#fff' }}
                >
                  {job.name}
                </button>
              ))}
            </div>
          </div>

          {/* Acción */}
          <div>
            <strong>Acción:</strong>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
              {ACTIONS.map(action => (
                <button
                  key={action.name}
                  onClick={() => updateVisuals({ action: action.id })}
                  style={{ background: charData.visuals.action === action.id ? '#2196F3' : '#fff' }}
                >
                  {action.name}
                </button>
              ))}
            </div>
          </div>

          {/* Otros Parámetros */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <label>
              Género:
              <select
                value={charData.visuals.gender}
                onChange={(e) => updateVisuals({ gender: parseInt(e.target.value) })}
              >
                <option value={0}>Female</option>
                <option value={1}>Male</option>
              </select>
            </label>
            <label>
              Cabeza:
              <input
                type="number"
                value={charData.visuals.head}
                min={1} max={30}
                style={{ width: '40px' }}
                onChange={(e) => updateVisuals({ head: parseInt(e.target.value) })}
              />
            </label>
          </div>

        </div>
      </div>
    </div>
  );
}

export default GameScene;
