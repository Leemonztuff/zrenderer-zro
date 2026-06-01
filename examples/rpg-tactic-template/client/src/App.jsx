import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  const [position, setPosition] = useState([0, 1, 0]);
  const [charData, setCharData] = useState({
    name: 'Tactical Explorer',
    visuals: {
      job: [4012], // Sniper
      gender: 0,
      head: 5,
      action: 0
    }
  });

  const PROXY_URL = 'http://localhost:3001/api';

  useEffect(() => {
    // Intentar cargar personaje real de Supabase si está configurado
    fetch(`${PROXY_URL}/character/default-id`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => setCharData(data))
      .catch(() => console.log("Usando datos locales de prueba."));
  }, []);

  const updateVisuals = (changes) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, ...changes }
    }));
  };

  const move = (dx, dz) => {
    // Cambiar a animación de caminar (Walk ID: 8)
    updateVisuals({ action: 8 });

    // Actualizar posición en la grilla
    setPosition(prev => [prev[0] + dx, prev[1], prev[2] + dz]);

    // Volver a 'Stand' (ID: 0) después de un breve momento
    setTimeout(() => {
      updateVisuals({ action: 0 });
    }, 500);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas camera={{ position: [8, 8, 8], fov: 40 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={position}>
            <ROSpriteBillboard
              baseUrl={PROXY_URL}
              spriteParams={charData.visuals}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid cellColor="#444" sectionColor="#666" fadeDistance={30} />
        <OrbitControls makeDefault />
      </Canvas>

      {/* Interfaz de Usuario Overlay */}
      <div style={{
        position: 'absolute', top: 20, left: 20, color: 'white',
        fontFamily: 'monospace', pointerEvents: 'none',
        background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>{charData.name}</h2>
        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <section>
            <div>MOVIMIENTO</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '120px', marginTop: '5px' }}>
              <div />
              <button onClick={() => move(0, -1)}>N</button>
              <div />
              <button onClick={() => move(-1, 0)}>W</button>
              <button onClick={() => move(0, 1)}>S</button>
              <button onClick={() => move(1, 0)}>E</button>
            </div>
          </section>

          <section>
            <div>PERSONALIZACIÓN</div>
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <button onClick={() => updateVisuals({ gender: charData.visuals.gender === 0 ? 1 : 0 })}>GENDER</button>
              <select
                value={charData.visuals.job[0]}
                onChange={(e) => updateVisuals({ job: [parseInt(e.target.value)] })}
                style={{ background: '#333', color: 'white', border: '1px solid #666' }}
              >
                <option value="4012">Sniper</option>
                <option value="12">Assassin</option>
                <option value="7">Knight</option>
                <option value="1001">Scorpion</option>
              </select>
              <input
                type="number"
                min="1" max="30"
                value={charData.visuals.head}
                onChange={(e) => updateVisuals({ head: parseInt(e.target.value) })}
                style={{ width: '40px', background: '#333', color: 'white', border: '1px solid #666' }}
              />
            </div>
          </section>

          <section>
            <div>ACCIONES</div>
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <button onClick={() => updateVisuals({ action: 0 })}>Stand</button>
              <button onClick={() => updateVisuals({ action: 17 })}>Sit</button>
              <button onClick={() => updateVisuals({ action: 16 })}>Attack</button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default GameScene;
