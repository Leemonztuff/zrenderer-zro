import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  const [character, setCharacter] = useState({
    id: 'default-id',
    name: 'Cargando...',
    visuals: {
      job: [4012],
      gender: 0,
      head: 5,
      action: 0
    },
    position: { x: 0, y: 0 }
  });

  const [pos, setPos] = useState([0, 0, 0]);

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  // Ejemplo de cómo cargar un personaje desde el backend (que a su vez usa Supabase)
  useEffect(() => {
    fetch(`${PROXY_URL}/character/${character.id}`)
      .then(res => res.json())
      .then(data => {
        setCharacter(data);
        if (data.position) {
          setPos([data.position.x, 0, data.position.y]);
        }
      })
      .catch(err => {
        console.error("Error al cargar personaje:", err);
        // Fallback local en caso de error
        setCharacter(prev => ({ ...prev, name: 'Héroe de Prueba' }));
      });
  }, []);

  const updateVisuals = (changes) => {
    setCharacter(prev => ({
      ...prev,
      visuals: { ...prev.visuals, ...changes }
    }));
  };

  const move = (dir) => {
    const directions = {
      'S': { dx: 0, dz: 1, roDir: 0 },
      'SW': { dx: -1, dz: 1, roDir: 1 },
      'W': { dx: -1, dz: 0, roDir: 2 },
      'NW': { dx: -1, dz: -1, roDir: 3 },
      'N': { dx: 0, dz: -1, roDir: 4 },
      'NE': { dx: 1, dz: -1, roDir: 5 },
      'E': { dx: 1, dz: 0, roDir: 6 },
      'SE': { dx: 1, dz: 1, roDir: 7 }
    };

    const { dx, dz, roDir } = directions[dir];
    const newX = pos[0] + dx;
    const newZ = pos[2] + dz;

    // Actualizar posición y dirección (acción = base + roDir)
    // Stand base = 0, Walk base = 8
    const WALK_BASE = 8;
    const STAND_BASE = 0;

    setPos([newX, 0, newZ]);
    updateVisuals({ action: WALK_BASE + roDir });

    // Volver a 'Stand' después de un momento
    setTimeout(() => {
      updateVisuals({ action: STAND_BASE + roDir });
    }, 500);

    // Persistir en el backend
    fetch(`${PROXY_URL}/character/${character.id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x: newX, y: newZ })
    }).catch(err => console.error("Error persistiendo posición:", err));
  };

  const btnStyle = {
    padding: '8px',
    cursor: 'pointer',
    background: '#444',
    color: 'white',
    border: '1px solid #666',
    borderRadius: '4px',
    fontSize: '0.8rem'
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={[pos[0], pos[1] + 1, pos[2]]}>
            {/* El Billboard de RO usando el proxy del backend */}
            <ROSpriteBillboard
              baseUrl={PROXY_URL}
              spriteParams={character.visuals}
              position={[0, 0, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid sectionSize={1} sectionThickness={1.5} sectionColor="#444" gridBrightness={0.5} />
        <OrbitControls makeDefault />
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none', maxWidth: '400px' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>{character.name}</h1>
        <p style={{ fontSize: '0.9rem' }}>Posición: [{pos[0]}, {pos[2]}]</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>

            {/* Movimiento */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Movimiento Táctico</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '120px' }}>
                <div />
                <button onClick={() => move('N')} style={btnStyle}>N</button>
                <div />
                <button onClick={() => move('W')} style={btnStyle}>W</button>
                <button onClick={() => move('S')} style={btnStyle}>S</button>
                <button onClick={() => move('E')} style={btnStyle}>E</button>
              </div>
            </div>

            {/* Clase (Job) */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Clase (Job)</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                <button onClick={() => updateVisuals({ job: [4012] })} style={{...btnStyle, background: character.visuals.job[0] === 4012 ? '#007bff' : '#444'}}>Sniper</button>
                <button onClick={() => updateVisuals({ job: [7] })} style={{...btnStyle, background: character.visuals.job[0] === 7 ? '#007bff' : '#444'}}>Knight</button>
                <button onClick={() => updateVisuals({ job: [12] })} style={{...btnStyle, background: character.visuals.job[0] === 12 ? '#007bff' : '#444'}}>Assassin</button>
                <button onClick={() => updateVisuals({ job: [1001] })} style={{...btnStyle, background: character.visuals.job[0] === 1001 ? '#007bff' : '#444'}}>Scorpion</button>
              </div>
            </div>

            {/* Género */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Género</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => updateVisuals({ gender: 0 })} style={{...btnStyle, background: character.visuals.gender === 0 ? '#e83e8c' : '#444'}}>Female</button>
                <button onClick={() => updateVisuals({ gender: 1 })} style={{...btnStyle, background: character.visuals.gender === 1 ? '#007bff' : '#444'}}>Male</button>
              </div>
            </div>

            {/* Acción */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Acción</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                <button onClick={() => {
                  const dir = character.visuals.action % 8;
                  updateVisuals({ action: 0 + dir });
                }} style={{...btnStyle, background: character.visuals.action < 8 ? '#28a745' : '#444'}}>Stand</button>

                <button onClick={() => {
                  const dir = character.visuals.action % 8;
                  updateVisuals({ action: 8 + dir });
                }} style={{...btnStyle, background: character.visuals.action >= 8 && character.visuals.action < 16 ? '#28a745' : '#444'}}>Walk</button>

                <button onClick={() => {
                  const dir = character.visuals.action % 8;
                  updateVisuals({ action: 16 + dir });
                }} style={{...btnStyle, background: character.visuals.action >= 16 && character.visuals.action < 24 ? '#28a745' : '#444'}}>Attack</button>

                <button onClick={() => updateVisuals({ action: 17 })} style={{...btnStyle, background: character.visuals.action === 17 ? '#28a745' : '#444'}}>Sit</button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default GameScene;
