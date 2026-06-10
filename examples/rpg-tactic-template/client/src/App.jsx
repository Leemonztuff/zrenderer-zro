import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

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

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  // Ejemplo de cómo cargar un personaje desde el backend (que a su vez usa Supabase)
  useEffect(() => {
    fetch(`${PROXY_URL}/character/default-id`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
        if (data.position) setCharPos(data.position);
      })
      .catch(err => {
        console.error("Error al cargar personaje:", err);
        // Fallback local si el servidor no está corriendo
        setCharData({
          id: 'local-test',
          name: 'Héroe de Prueba',
          visuals: { job: [4012], gender: 0, head: 5, action: 0 }
        });
      });
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

  const updateGender = (gender) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, gender }
    }));
  };

  const updateHead = (head) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, head }
    }));
  };

  const moveChar = (dx, dz) => {
    const newPos = [charPos[0] + dx, charPos[1], charPos[2] + dz];

    // Calcular dirección RO basada en el movimiento
    // 0:S, 1:SW, 2:W, 3:NW, 4:N, 5:NE, 6:E, 7:SE
    let direction = 0;
    if (dx > 0 && dz === 0) direction = 6; // East
    if (dx < 0 && dz === 0) direction = 2; // West
    if (dz > 0 && dx === 0) direction = 0; // South
    if (dz < 0 && dx === 0) direction = 4; // North

    // Animación de caminar (base 8 + dirección)
    const walkAction = 8 + direction;
    const standAction = 0 + direction;

    setCharPos(newPos);
    updateAction(walkAction);

    // Volver a Stand después de un breve momento
    setTimeout(() => {
      updateAction(standAction);
    }, 500);

    // Sincronizar con el backend
    fetch(`${PROXY_URL}/character/${charData.id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x: newPos[0], y: newPos[1], z: newPos[2] })
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
        <p>Usa los controles para mover al personaje.</p>
        <p>Posición: {charPos[0]}, {charPos[2]}</p>

        <div style={{ pointerEvents: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '150px', marginTop: '20px' }}>
          <div />
          <button onClick={() => moveChar(0, -1)} style={{ padding: '10px' }}>N</button>
          <div />
          <button onClick={() => moveChar(-1, 0)} style={{ padding: '10px' }}>W</button>
          <div />
          <button onClick={() => moveChar(1, 0)} style={{ padding: '10px' }}>E</button>
          <div />
          <button onClick={() => moveChar(0, 1)} style={{ padding: '10px' }}>S</button>
          <div />
        </div>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', maxWidth: '400px' }}>
          <div style={{ width: '100%' }}><strong>Job:</strong></div>
          <button onClick={() => updateJob([4012])} style={{ padding: '8px 16px', cursor: 'pointer' }}>Sniper</button>
          <button onClick={() => updateJob([7])} style={{ padding: '8px 16px', cursor: 'pointer' }}>Knight</button>
          <button onClick={() => updateJob([12])} style={{ padding: '8px 16px', cursor: 'pointer' }}>Assassin</button>
          <button onClick={() => updateJob([1000])} style={{ padding: '8px 16px', cursor: 'pointer' }}>Scorpion</button>

          <div style={{ width: '100%', marginTop: '10px' }}><strong>Gender:</strong></div>
          <button onClick={() => updateGender(0)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Female</button>
          <button onClick={() => updateGender(1)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Male</button>

          <div style={{ width: '100%', marginTop: '10px' }}><strong>Head:</strong></div>
          {[1, 5, 10, 15].map(h => (
            <button key={h} onClick={() => updateHead(h)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Style {h}</button>
          ))}

          <div style={{ width: '100%', marginTop: '10px' }}><strong>Action:</strong></div>
          <button onClick={() => updateAction(0)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Stand</button>
          <button onClick={() => updateAction(17)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Sit</button>
          <button onClick={() => updateAction(16)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Attack</button>
        </div>
      </div>
    </div>
  );
}

export default GameScene;
