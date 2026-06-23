import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

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
    position: [0, 0, 0],
    visuals: {
      job: [4012],
      gender: 0,
      head: 5,
      action: 0
    }
  });

  const [charPos, setCharPos] = useState([0, 0, 0]);
  const moveTimeout = useRef(null);

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  // Ejemplo de cómo cargar un personaje desde el backend (que a su vez usa Supabase)
  useEffect(() => {
    fetch(`${PROXY_URL}/character/${charData.id}`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
        if (data.position) setCharPos(data.position);
      })
      .catch(err => console.error("Error al cargar personaje:", err));
  }, []);

  const updateAction = (newAction) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, action: newAction }
    }));
  };

  const updateJob = (newJob) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, job: newJob }
    }));
  };

  const updateVisuals = (key, value) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, [key]: value }
    }));
  };

  const move = (dx, dz, direction) => {
    const newPos = [charPos[0] + dx, charPos[1], charPos[2] + dz];
    const dirIndex = DIRECTION_MAP[direction];

    setCharPos(newPos);
    updateAction(8 + dirIndex); // Walk + Direction

    // Sincronizar con el backend
    syncPosition(newPos);

    // Volver a Stand después de un momento
    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    moveTimeout.current = setTimeout(() => {
      updateAction(0 + dirIndex); // Stand + Direction
    }, 500);
  };

  const syncPosition = (pos) => {
    fetch(`${PROXY_URL}/character/${charData.id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x: pos[0], y: pos[1], z: pos[2] })
    }).catch(err => console.error("Error sincronizando posición:", err));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={charPos}>
            {/* El Billboard de RO usando el proxy del backend */}
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
        <p>Posición: {charPos[0]}, {charPos[2]} | Job: {charData.visuals.job[0]} | Action: {charData.visuals.action}</p>
        <p>Usa los controles para mover al personaje.</p>

        <div style={{ pointerEvents: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '150px', marginTop: '10px' }}>
          <div />
          <button onClick={() => move(0, -1, 'N')} style={{ padding: '10px' }}>N</button>
          <div />
          <button onClick={() => move(-1, 0, 'W')} style={{ padding: '10px' }}>W</button>
          <div />
          <button onClick={() => move(1, 0, 'E')} style={{ padding: '10px' }}>E</button>
          <div />
          <button onClick={() => move(0, 1, 'S')} style={{ padding: '10px' }}>S</button>
          <div />
        </div>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', maxWidth: '400px' }}>
          <div style={{ width: '100%' }}>
            <strong>Clase:</strong><br/>
            <button onClick={() => updateJob([4012])}>Sniper</button>
            <button onClick={() => updateJob([7])}>Knight</button>
            <button onClick={() => updateJob([12])}>Assassin</button>
            <button onClick={() => updateJob([1001])}>Scorpion</button>
          </div>

          <div style={{ width: '100%' }}>
            <strong>Género:</strong><br/>
            <button onClick={() => updateVisuals('gender', 0)}>Femenino</button>
            <button onClick={() => updateVisuals('gender', 1)}>Masculino</button>
          </div>

          <div style={{ width: '100%' }}>
            <strong>Cabeza:</strong><br/>
            {[1, 5, 10, 15].map(h => (
              <button key={h} onClick={() => updateVisuals('head', h)}>{h}</button>
            ))}
          </div>

          <div style={{ width: '100%' }}>
            <strong>Acción:</strong><br/>
            <button onClick={() => updateAction(0)}>Stand</button>
            <button onClick={() => updateAction(17)}>Sit</button>
            <button onClick={() => updateAction(16)}>Attack</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScene;
