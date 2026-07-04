import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

// Mapa de direcciones de RO (0:S, 1:SW, 2:W, 3:NW, 4:N, 5:NE, 6:E, 7:SE)
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
  const moveTimeout = useRef(null);

  const PROXY_URL = 'http://localhost:3001/api';

  useEffect(() => {
    fetch(`${PROXY_URL}/character/default-id`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
        if (data.position) setCharPos(data.position);
      })
      .catch(err => console.error("Error al cargar personaje:", err));
  }, []);

  const moveCharacter = (dir) => {
    const [x, y, z] = charPos;
    let newX = x, newZ = z;
    const step = 1;

    if (dir === 'N') newZ -= step;
    if (dir === 'S') newZ += step;
    if (dir === 'E') newX += step;
    if (dir === 'W') newX -= step;

    const roDir = DIRECTION_MAP[dir];
    const walkAction = 8 + roDir;
    const standAction = 0 + roDir;

    // Actualizar visual a caminar
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, action: walkAction }
    }));

    setCharPos([newX, y, newZ]);

    // Persistir posición
    fetch(`${PROXY_URL}/character/${charData.id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x: newX, y, z: newZ })
    }).catch(err => console.error("Error guardando posición:", err));

    // Volver a estado 'Stand' después de un momento
    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    moveTimeout.current = setTimeout(() => {
      setCharData(prev => ({
        ...prev,
        visuals: { ...prev.visuals, action: standAction }
      }));
    }, 500);
  };

  const updateVisual = (key, value) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, [key]: value }
    }));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222', position: 'relative' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={charPos}>
            <ROSpriteBillboard
              baseUrl={PROXY_URL}
              spriteParams={charData.visuals}
              position={[0, 0.5, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid sectionSize={1} sectionColor="#444" cellColor="#333" />
        <OrbitControls makeDefault />
      </Canvas>

      {/* Interfaz de Usuario */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0 }}>{charData.name}</h1>
        <p>Posición: {charPos[0].toFixed(1)}, {charPos[2].toFixed(1)}</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <div>
            <label>Clase: </label>
            <select onChange={(e) => updateVisual('job', [parseInt(e.target.value)])} value={charData.visuals.job[0]}>
              <option value="4012">Sniper</option>
              <option value="7">Knight</option>
              <option value="12">Assassin</option>
              <option value="1001">Scorpion</option>
            </select>
          </div>

          <div>
            <label>Género: </label>
            <button onClick={() => updateVisual('gender', 0)}>F</button>
            <button onClick={() => updateVisual('gender', 1)}>M</button>
          </div>

          <div>
            <label>Cabeza: </label>
            <input type="number" value={charData.visuals.head} min="1" max="20"
              onChange={(e) => updateVisual('head', parseInt(e.target.value))}
              style={{ width: '40px' }} />
          </div>

          <div style={{ marginTop: '20px' }}>
            <p>Movimiento:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: '5px' }}>
              <div />
              <button onClick={() => moveCharacter('N')}>↑</button>
              <div />
              <button onClick={() => moveCharacter('W')}>←</button>
              <button onClick={() => moveCharacter('S')}>↓</button>
              <button onClick={() => moveCharacter('E')}>→</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 20, right: 20, color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
        Usa el mouse para rotar y zoom. Botones para mover al personaje.
      </div>
    </div>
  );
}

export default GameScene;
