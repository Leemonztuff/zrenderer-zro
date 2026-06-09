import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

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
  const [charPos, setCharPos] = useState([0, 0, 0]);

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  // Ejemplo de cómo cargar un personaje desde el backend (que a su vez usa Supabase)
  useEffect(() => {
    fetch(`${PROXY_URL}/character/default-id`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
        if (data.pos) setCharPos(data.pos);
      })
      .catch(err => {
        console.error("Error al cargar personaje:", err);
        // Fallback local para pruebas
        setCharData({
            name: 'Héroe de Prueba',
            visuals: { job: [4012], gender: 1, head: 1, action: 0 }
        });
      });
  }, []);

  const moveChar = (dx, dz, direction) => {
    const newPos = [charPos[0] + dx, charPos[1], charPos[2] + dz];
    setCharPos(newPos);

    // Sincronizar con el backend
    if (charData.id && charData.id !== 'default-id') {
      fetch(`${PROXY_URL}/character/${charData.id}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: newPos[0], y: newPos[1], z: newPos[2] })
      }).catch(err => console.error("Error sincronizando posición:", err));
    }

    // Cambiar a animación de caminar (base 8) + dirección
    const walkAction = 8 + direction;
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, action: walkAction }
    }));

    // Volver a 'Stand' después de un momento
    setTimeout(() => {
      setCharData(prev => ({
        ...prev,
        visuals: { ...prev.visuals, action: 0 + direction }
      }));
    }, 500);
  };

  const updateVisuals = (key, value) => {
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
        <p>Posición: {charPos.join(', ')}</p>

        <div style={{ pointerEvents: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 50px)', gap: '5px', marginTop: '20px' }}>
          <div />
          <button onClick={() => moveChar(0, -1, 4)}>↑</button>
          <div />
          <button onClick={() => moveChar(-1, 0, 2)}>←</button>
          <div />
          <button onClick={() => moveChar(1, 0, 6)}>→</button>
          <div />
          <button onClick={() => moveChar(0, 1, 0)}>↓</button>
          <div />
        </div>

        <div style={{ pointerEvents: 'auto', marginTop: '20px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px' }}>
          <h3>Customización</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Género:
              <select onChange={(e) => updateVisuals('gender', parseInt(e.target.value))} value={charData.visuals.gender}>
                <option value={0}>Femenino</option>
                <option value={1}>Masculino</option>
              </select>
            </label>
            <label>Trabajo:
              <select onChange={(e) => updateVisuals('job', [parseInt(e.target.value)])} value={charData.visuals.job[0]}>
                <option value={4012}>Sniper</option>
                <option value={7}>Knight</option>
                <option value={12}>Assassin</option>
                <option value={1000}>Scorpion</option>
              </select>
            </label>
            <label>Acción:
              <select onChange={(e) => updateVisuals('action', parseInt(e.target.value))} value={charData.visuals.action}>
                <option value={0}>Stand</option>
                <option value={17}>Sit</option>
                <option value={16}>Attack</option>
              </select>
            </label>
            <label>Cabeza:
              <input type="number" min="1" max="25" value={charData.visuals.head}
                     onChange={(e) => updateVisuals('head', parseInt(e.target.value))}
                     style={{ width: '50px' }} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScene;
