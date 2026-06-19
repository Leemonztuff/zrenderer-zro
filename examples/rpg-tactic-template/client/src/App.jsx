import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

/**
 * Mapeo de direcciones de RO:
 * 0: Sur, 1: Sur-Oeste, 2: Oeste, 3: Nor-Oeste,
 * 4: Norte, 5: Nor-Este, 6: Este, 7: Sur-Este
 */
const DIRECTION_MAP = {
  'S': 0, 'W': 2, 'N': 4, 'E': 6
};

function GameScene() {
  const [charData, setCharData] = useState({
    id: 'default-id',
    name: 'Cargando...',
    visuals: {
      job: [4012],
      gender: 0,
      head: 5,
      action: 0
    }
  });

  const [charPos, setCharPos] = useState([0, 0, 0]);
  const [direction, setDirection] = useState(0); // 0: South
  const [animBase, setAnimBase] = useState(0); // 0: Stand, 8: Walk, 16: Attack, 17: Sit
  const moveTimeout = useRef(null);

  const PROXY_URL = 'http://localhost:3001/api';

  // Carga inicial del personaje
  useEffect(() => {
    fetch(`${PROXY_URL}/character/${charData.id}`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
        if (data.pos_x !== undefined) {
          setCharPos([data.pos_x, 0, data.pos_z || 0]);
        }
      })
      .catch(err => {
        console.warn("Usando personaje de prueba local");
        setCharData(prev => ({ ...prev, name: 'Héroe de Prueba' }));
      });
  }, []);

  // Sincronizar posición con el backend
  const syncPosition = (pos) => {
    fetch(`${PROXY_URL}/character/${charData.id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x: pos[0], y: pos[1], z: pos[2] })
    }).catch(err => console.error("Error sincronizando posición:", err));
  };

  const move = (dirKey) => {
    const roDir = DIRECTION_MAP[dirKey];
    setDirection(roDir);
    setAnimBase(8); // Cambiar a animación de 'Walk'

    setCharPos(([x, y, z]) => {
      let newPos = [x, y, z];
      if (dirKey === 'N') newPos = [x, y, z - 1];
      if (dirKey === 'S') newPos = [x, y, z + 1];
      if (dirKey === 'E') newPos = [x + 1, y, z];
      if (dirKey === 'W') newPos = [x - 1, y, z];

      syncPosition(newPos);
      return newPos;
    });

    // Volver a 'Stand' después de un breve momento (simulando paso a paso)
    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    moveTimeout.current = setTimeout(() => {
      setAnimBase(0);
    }, 500);
  };

  const updateVisual = (key, value) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, [key]: value }
    }));
  };

  // El action ID final es la base de la animación + la dirección
  const currentAction = animBase + (animBase === 17 ? 0 : direction); // Sit no suele rotar igual

  const buttonStyle = { padding: '8px 12px', cursor: 'pointer', background: '#444', color: 'white', border: '1px solid #666', borderRadius: '4px' };
  const labelStyle = { fontSize: '0.8rem', marginBottom: '5px', display: 'block', fontWeight: 'bold', color: '#aaa' };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={[charPos[0], 0, charPos[2]]}>
            <ROSpriteBillboard
              baseUrl={PROXY_URL}
              spriteParams={{ ...charData.visuals, action: currentAction }}
              position={[0, 1, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid sectionSize={1} sectionColor="#444" cellColor="#333" />
        <OrbitControls makeDefault />
      </Canvas>

      {/* UI de Control */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none', background: 'rgba(0,0,0,0.7)', padding: '20px', borderRadius: '8px', maxWidth: '300px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{charData.name}</h1>
        <p style={{ fontSize: '0.8rem', margin: '0 0 15px 0' }}>Pos: {charPos[0]}, {charPos[2]} | Action: {currentAction}</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <span style={labelStyle}>Movimiento</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '120px' }}>
              <div />
              <button onClick={() => move('N')} style={buttonStyle}>N</button>
              <div />
              <button onClick={() => move('W')} style={buttonStyle}>W</button>
              <button onClick={() => move('S')} style={buttonStyle}>S</button>
              <button onClick={() => move('E')} style={buttonStyle}>E</button>
            </div>
          </div>

          <div>
            <span style={labelStyle}>Clase / Trabajo</span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button onClick={() => updateVisual('job', [4012])} style={buttonStyle}>Sniper</button>
              <button onClick={() => updateVisual('job', [7])} style={buttonStyle}>Knight</button>
              <button onClick={() => updateVisual('job', [12])} style={buttonStyle}>Assassin</button>
              <button onClick={() => updateVisual('job', [1001])} style={buttonStyle}>Scorpion</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>Género</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => updateVisual('gender', 0)} style={buttonStyle}>F</button>
                <button onClick={() => updateVisual('gender', 1)} style={buttonStyle}>M</button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>Cabeza</span>
              <select
                onChange={(e) => updateVisual('head', parseInt(e.target.value))}
                style={{ ...buttonStyle, width: '100%' }}
                value={charData.visuals.head}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(h => <option key={h} value={h}>Estilo {h}</option>)}
              </select>
            </div>
          </div>

          <div>
            <span style={labelStyle}>Acción Base</span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button onClick={() => setAnimBase(0)} style={buttonStyle}>Stand</button>
              <button onClick={() => setAnimBase(17)} style={buttonStyle}>Sit</button>
              <button onClick={() => setAnimBase(16)} style={buttonStyle}>Attack</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScene;
