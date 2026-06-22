import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  const [charPos, setCharPos] = useState([0, 0, 0]);
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

  const PROXY_URL = 'http://localhost:3001/api';
  const moveTimeout = useRef(null);

  useEffect(() => {
    fetch(`${PROXY_URL}/character/default-id`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
        if (data.position) setCharPos(data.position);
      })
      .catch(err => {
        console.error("Error al cargar personaje:", err);
        setCharData({
            id: 'default-id',
            name: 'Héroe de Prueba',
            visuals: { job: [4012], gender: 0, head: 5, action: 0 }
        });
      });
  }, []);

  const syncPosition = (newPos) => {
    fetch(`${PROXY_URL}/character/${charData.id}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: newPos[0], y: newPos[1], z: newPos[2] })
    }).catch(err => console.error("Error al sincronizar posición:", err));
  };

  const move = (dx, dz) => {
    if (moveTimeout.current) clearTimeout(moveTimeout.current);

    const newPos = [charPos[0] + dx, charPos[1], charPos[2] + dz];
    setCharPos(newPos);

    // Cambiar a animación de caminar (ID 8)
    setCharData(prev => ({
        ...prev,
        visuals: { ...prev.visuals, action: 8 }
    }));

    // Sincronizar con el backend
    syncPosition(newPos);

    // Volver a 'Stand' (ID 0) después de un breve momento
    moveTimeout.current = setTimeout(() => {
        setCharData(prev => ({
            ...prev,
            visuals: { ...prev.visuals, action: 0 }
        }));
    }, 500);
  };

  const updateJob = (newJob) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, job: newJob }
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
              position={[0, 1, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid />
        <OrbitControls makeDefault />
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
        <h1>{charData.name}</h1>
        <p>Posición: {charPos[0]}, {charPos[2]}</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => updateJob([4012])} style={btnStyle}>Sniper</button>
            <button onClick={() => updateJob([1001])} style={btnStyle}>Scorpion</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '150px' }}>
            <div />
            <button onClick={() => move(0, -1)} style={btnStyle}>▲</button>
            <div />
            <button onClick={() => move(-1, 0)} style={btnStyle}>◀</button>
            <button onClick={() => move(0, 1)} style={btnStyle}>▼</button>
            <button onClick={() => move(1, 0)} style={btnStyle}>▶</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnStyle = { padding: '8px', cursor: 'pointer', background: '#444', color: 'white', border: '1px solid #666' };

export default GameScene;
