import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  const [position, setPosition] = useState([0, 0, 0]);
  const [charData, setCharData] = useState({
    name: 'Cargando...',
    visuals: {
      job: [4012],
      gender: 0,
      head: 5,
      action: 0
    }
  });

  const PROXY_URL = 'http://localhost:3001/api';

  useEffect(() => {
    fetch(`${PROXY_URL}/character/default-id`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
      })
      .catch(err => {
        console.warn("Usando datos locales por defecto");
        setCharData({
            name: 'Héroe de Prueba',
            visuals: { job: [4012], gender: 0, head: 5, action: 0 }
        });
      });
  }, []);

  const updateVisuals = useCallback((newVisuals) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, ...newVisuals }
    }));
  }, []);

  const move = (dx, dz) => {
    const oldAction = charData.visuals.action;
    setPosition(prev => [prev[0] + dx, prev[1], prev[2] + dz]);

    // Cambiar a animación de caminar temporalmente
    updateVisuals({ action: 8 });
    setTimeout(() => {
        updateVisuals({ action: oldAction });
    }, 500);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
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

        <Grid infiniteGrid sectionSize={1} sectionColor="#444" cellColor="#333" />
        <OrbitControls makeDefault />
      </Canvas>

      {/* Interfaz de Usuario */}
      <div style={{
        position: 'absolute', top: 20, left: 20, color: 'white',
        fontFamily: 'sans-serif', pointerEvents: 'none',
        background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px'
      }}>
        <h1 style={{ margin: '0 0 10px 0' }}>{charData.name}</h1>

        <div style={{ pointerEvents: 'auto' }}>
          <h3>Movimiento</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '120px' }}>
            <div />
            <button onClick={() => move(0, -1)}>N</button>
            <div />
            <button onClick={() => move(-1, 0)}>W</button>
            <button onClick={() => move(0, 1)}>S</button>
            <button onClick={() => move(1, 0)}>E</button>
          </div>

          <h3>Clase</h3>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <button onClick={() => updateVisuals({ job: [4012] })}>Sniper</button>
            <button onClick={() => updateVisuals({ job: [7] })}>Knight</button>
            <button onClick={() => updateVisuals({ job: [12] })}>Assassin</button>
            <button onClick={() => updateVisuals({ job: [1001] })}>Scorpion</button>
          </div>

          <h3>Acción</h3>
          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
            <button onClick={() => updateVisuals({ action: 0 })}>Stand</button>
            <button onClick={() => updateVisuals({ action: 17 })}>Sit</button>
            <button onClick={() => updateVisuals({ action: 16 })}>Attack</button>
          </div>

          <h3>Género</h3>
          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
            <button onClick={() => updateVisuals({ gender: 0 })}>Femenino</button>
            <button onClick={() => updateVisuals({ gender: 1 })}>Masculino</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScene;
