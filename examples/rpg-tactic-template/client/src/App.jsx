import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

// Mapeo de direcciones RO (0: S, 1: SW, 2: W, 3: NW, 4: N, 5: NE, 6: E, 7: SE)
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
      job: [4012],
      gender: 0,
      head: 5,
      action: 0
    }
  });

  const [charPos, setCharPos] = useState([0, 0, 0]);
  const PROXY_URL = 'http://localhost:3001/api';
  const moveTimeout = useRef(null);

  // Cargar personaje inicial
  useEffect(() => {
    fetch(`${PROXY_URL}/character/${charData.id}`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
        if (data.position) setCharPos(data.position);
      })
      .catch(err => {
        console.error("Error al cargar personaje:", err);
        setCharData({
          id: 'local-hero',
          name: 'Héroe de Prueba',
          visuals: { job: [4012], gender: 0, head: 5, action: 0 }
        });
      });
  }, []);

  const move = (direction) => {
    if (moveTimeout.current) clearTimeout(moveTimeout.current);

    const [x, y, z] = charPos;
    let nextX = x;
    let nextZ = z;

    if (direction === 'N') nextZ -= 1;
    if (direction === 'S') nextZ += 1;
    if (direction === 'E') nextX += 1;
    if (direction === 'W') nextX -= 1;

    const roDir = DIRECTION_MAP[direction];
    const walkAction = 8 + roDir;
    const standAction = 0 + roDir;

    // Actualizar estado para caminar
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, action: walkAction }
    }));
    setCharPos([nextX, y, nextZ]);

    // Volver a 'Stand' después de un momento
    moveTimeout.current = setTimeout(() => {
      setCharData(prev => ({
        ...prev,
        visuals: { ...prev.visuals, action: standAction }
      }));
    }, 500);

    // Sincronizar con el backend
    fetch(`${PROXY_URL}/character/${charData.id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x: nextX, y, z: nextZ })
    }).catch(err => console.error("Error al sincronizar posición:", err));
  };

  const updateVisual = (key, value) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, [key]: value }
    }));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
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

        <Grid infiniteGrid sectionSize={1} sectionColor="#444" cellColor="#333" />
        <OrbitControls makeDefault />
      </Canvas>

      {/* UI de Control y Estado */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0 }}>{charData.name}</h1>
        <p>Pos: {charPos[0]}, {charPos[2]} | Job: {charData.visuals.job[0]} | Action: {charData.visuals.action}</p>

        <div style={{ pointerEvents: 'auto', marginTop: '20px' }}>
          <h3>Movimiento</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 50px)', gap: '5px' }}>
            <div /> <button onClick={() => move('N')} style={{ height: '40px' }}>↑</button> <div />
            <button onClick={() => move('W')} style={{ height: '40px' }}>←</button>
            <button onClick={() => move('S')} style={{ height: '40px' }}>↓</button>
            <button onClick={() => move('E')} style={{ height: '40px' }}>→</button>
          </div>

          <h3 style={{ marginTop: '20px' }}>Personalización</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <select onChange={(e) => updateVisual('job', [parseInt(e.target.value)])} value={charData.visuals.job[0]}>
              <option value="4012">Sniper</option>
              <option value="7">Knight</option>
              <option value="12">Assassin</option>
              <option value="1001">Scorpion</option>
            </select>

            <select onChange={(e) => updateVisual('gender', parseInt(e.target.value))} value={charData.visuals.gender}>
              <option value="1">Male</option>
              <option value="0">Female</option>
            </select>

            <select onChange={(e) => updateVisual('head', parseInt(e.target.value))} value={charData.visuals.head}>
              {[1, 5, 10, 15, 20].map(h => (
                <option key={h} value={h}>Head {h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScene;
