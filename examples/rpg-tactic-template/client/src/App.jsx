import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

// Mapeo de direcciones RO (0:S, 1:SW, 2:W, 3:NW, 4:N, 5:NE, 6:E, 7:SE)
const DIRECTION_MAP = {
  'N': 4,
  'S': 0,
  'E': 6,
  'W': 2
};

function GameScene() {
  const [charData, setCharData] = useState({
    id: 'default-id',
    name: 'Cargando...',
    visuals: {
      job: [7],
      gender: 1,
      head: 1,
      action: 0
    }
  });

  const [charPos, setCharPos] = useState([0, 0, 0]);
  const [direction, setDirection] = useState('S');
  const moveTimeout = useRef(null);

  const PROXY_URL = 'http://localhost:3001/api';

  useEffect(() => {
    fetch(`${PROXY_URL}/character/default-id`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
        if (data.position) setCharPos(data.position);
      })
      .catch(err => {
        console.warn("Backend no disponible, usando Héroe de Prueba");
        setCharData({
          id: 'local-hero',
          name: 'Héroe de Prueba',
          visuals: { job: [7], gender: 1, head: 1, action: 0 }
        });
      });
  }, []);

  const updateVisuals = (changes) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, ...changes }
    }));
  };

  const move = (dir) => {
    const [x, y, z] = charPos;
    let nextX = x, nextZ = z;

    if (dir === 'N') nextZ -= 1;
    if (dir === 'S') nextZ += 1;
    if (dir === 'E') nextX += 1;
    if (dir === 'W') nextX -= 1;

    const roDir = DIRECTION_MAP[dir];
    setDirection(dir);
    setCharPos([nextX, y, nextZ]);

    // Cambiar a animación de caminar (8 es la base de Walk)
    updateVisuals({ action: 8 + roDir });

    // Persistir posición en el backend
    fetch(`${PROXY_URL}/character/${charData.id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x: nextX, y, z: nextZ })
    }).catch(() => {});

    // Volver a Stand después de 500ms
    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    moveTimeout.current = setTimeout(() => {
      updateVisuals({ action: 0 + roDir });
    }, 500);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111', overflow: 'hidden' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={charPos}>
            <ROSpriteBillboard
              baseUrl={PROXY_URL}
              spriteParams={charData.visuals}
              position={[0, 0.8, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid sectionSize={1} sectionColor="#444" cellColor="#222" />
        <OrbitControls makeDefault />
      </Canvas>

      {/* Interfaz de Usuario */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'monospace', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0 }}>{charData.name}</h1>
        <p>Pos: ({charPos[0]}, {charPos[2]}) | Job: {charData.visuals.job[0]} | Action: {charData.visuals.action}</p>

        <div style={{ pointerEvents: 'auto', marginTop: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Movimiento:</strong><br/>
            <button onClick={() => move('N')} style={btnStyle}>↑ N</button>
            <div style={{ display: 'flex' }}>
              <button onClick={() => move('W')} style={btnStyle}>← W</button>
              <button onClick={() => move('S')} style={btnStyle}>↓ S</button>
              <button onClick={() => move('E')} style={btnStyle}>→ E</button>
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Clase:</strong><br/>
            <select onChange={(e) => updateVisuals({ job: [parseInt(e.target.value)] })} value={charData.visuals.job[0]} style={selectStyle}>
              <option value="4012">Sniper</option>
              <option value="7">Knight</option>
              <option value="12">Assassin</option>
              <option value="1001">Scorpion</option>
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Género:</strong><br/>
            <button onClick={() => updateVisuals({ gender: 0 })} style={btnStyle}>Femenino</button>
            <button onClick={() => updateVisuals({ gender: 1 })} style={btnStyle}>Masculino</button>
          </div>

          <div>
            <strong>Cabeza:</strong><br/>
            <input type="range" min="1" max="30" value={charData.visuals.head} onChange={(e) => updateVisuals({ head: parseInt(e.target.value) })} style={{ pointerEvents: 'auto' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: '8px 12px',
  margin: '2px',
  cursor: 'pointer',
  background: '#333',
  color: 'white',
  border: '1px solid #555',
  borderRadius: '4px'
};

const selectStyle = {
  padding: '8px',
  background: '#333',
  color: 'white',
  border: '1px solid #555',
  borderRadius: '4px',
  marginTop: '5px'
};

export default GameScene;
