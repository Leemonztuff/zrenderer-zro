import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  const [job, setJob] = useState([4012]); // Sniper por defecto
  const [action, setAction] = useState(0); // Stand por defecto
  const [characterId, setCharacterId] = useState('');
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState([0, 0, 0]);

  // Parámetros de ejemplo para el personaje
  const [characterParams, setCharacterParams] = useState({
    job: [4012],
    gender: 0,
    head: 5,
    action: 0
  });

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  const fetchCharacter = async () => {
    if (!characterId) return;
    setLoading(true);
    try {
      const response = await fetch(`${PROXY_URL}/character/${characterId}`);
      if (response.ok) {
        const data = await response.json();
        setCharacterParams(data.visuals);
        setJob(data.visuals.job);
        setAction(data.visuals.action);
      } else {
        alert('Personaje no encontrado');
      }
    } catch (error) {
      console.error("Error fetching character:", error);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar parámetros manuales
  const updateManualAction = (newAction) => {
    setAction(newAction);
    setCharacterParams(prev => ({ ...prev, action: newAction }));
  };

  const updateManualJob = (newJob) => {
    setJob(newJob);
    setCharacterParams(prev => ({ ...prev, job: newJob }));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={position}>
            {/* El Billboard de RO usando el proxy del backend */}
            <ROSpriteBillboard
              baseUrl={PROXY_URL}
              spriteParams={characterParams}
              position={[0, 1, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid />
        <OrbitControls makeDefault />
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
        <h1>RPG Tactic Template</h1>
        <p>Usa el mouse para rotar la cámara.</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="UUID del Personaje"
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              style={{ padding: '8px' }}
            />
            <button onClick={fetchCharacter} disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              {loading ? 'Cargando...' : 'Cargar de DB'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => updateManualJob([4012])} style={{ padding: '8px 16px', cursor: 'pointer' }}>Sniper</button>
            <button onClick={() => updateManualJob([1001])} style={{ padding: '8px 16px', cursor: 'pointer' }}>Scorpion</button>
            <button onClick={() => updateManualAction(0)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Stand</button>
            <button onClick={() => updateManualAction(8)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Walk</button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setPosition([position[0] - 1, 0, position[2]])} style={{ padding: '8px', cursor: 'pointer' }}>Oeste</button>
            <button onClick={() => setPosition([position[0] + 1, 0, position[2]])} style={{ padding: '8px', cursor: 'pointer' }}>Este</button>
            <button onClick={() => setPosition([position[0], 0, position[2] - 1])} style={{ padding: '8px', cursor: 'pointer' }}>Norte</button>
            <button onClick={() => setPosition([position[0], 0, position[2] + 1])} style={{ padding: '8px', cursor: 'pointer' }}>Sur</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScene;
