import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

// IDs de Trabajo en Ragnarok Online
const JOBS = {
  SNIPER: [4012],
  KNIGHT: [7],
  ASSASSIN: [12],
  SCORPION: [1001]
};

// Bases de animación en RO (Base + Dirección)
const ANIMATION_BASES = {
  STAND: 0,
  WALK: 8,
  ATTACK: 16,
  SIT: 17
};

// Direcciones en RO (0:S, 1:SW, 2:W, 3:NW, 4:N, 5:NE, 6:E, 7:SE)
const DIRECTIONS = {
  N: 4,
  S: 0,
  E: 6,
  W: 2
};

function GameScene() {
  const [charData, setCharData] = useState({
    id: 'default-id',
    name: 'Cargando...',
    pos_x: 0,
    pos_y: 0,
    visuals: {
      job: JOBS.SNIPER,
      gender: 0,
      head: 5,
      action: 0
    }
  });

  const [currentActionBase, setCurrentActionBase] = useState(ANIMATION_BASES.STAND);
  const [currentDirection, setCurrentDirection] = useState(DIRECTIONS.S);
  const moveTimeout = useRef(null);

  const PROXY_URL = 'http://localhost:3001/api';

  // Cargar datos iniciales
  useEffect(() => {
    fetch(`${PROXY_URL}/character/default-id`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
        // La dirección inicial es S (0) por defecto si no viene en data
      })
      .catch(err => {
        console.error("Error al cargar personaje:", err);
        setCharData(prev => ({ ...prev, name: 'Héroe de Prueba (Offline)' }));
      });
  }, []);

  // Sincronizar acción final (Base + Dirección)
  const characterParams = {
    ...charData.visuals,
    action: currentActionBase + currentDirection
  };

  const updatePositionOnServer = useCallback((id, x, y) => {
    // Solo sincronizamos si no es el ID por defecto para evitar ruido inicial
    if (!id || id === 'default-id') return;

    fetch(`${PROXY_URL}/character/${id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y })
    }).catch(err => console.error("Error al guardar posición:", err));
  }, [PROXY_URL]);

  const move = (dirKey) => {
    const dirId = DIRECTIONS[dirKey];
    setCurrentDirection(dirId);
    setCurrentActionBase(ANIMATION_BASES.WALK);

    setCharData(prev => {
      let newX = prev.pos_x;
      let newY = prev.pos_y;

      if (dirKey === 'N') newY -= 1;
      if (dirKey === 'S') newY += 1;
      if (dirKey === 'E') newX += 1;
      if (dirKey === 'W') newX -= 1;

      // Programamos la actualización fuera del ciclo de renderizado de React
      setTimeout(() => updatePositionOnServer(prev.id, newX, newY), 0);

      return { ...prev, pos_x: newX, pos_y: newY };
    });

    // Volver a 'Stand' después de 500ms
    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    moveTimeout.current = setTimeout(() => {
      setCurrentActionBase(ANIMATION_BASES.STAND);
    }, 500);
  };

  const updateVisuals = (changes) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, ...changes }
    }));
  };

  const buttonStyle = { padding: '8px 12px', cursor: 'pointer', background: '#444', color: 'white', border: '1px solid #666', borderRadius: '4px' };
  const labelStyle = { fontSize: '0.8rem', marginBottom: '5px', display: 'block', fontWeight: 'bold' };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [8, 8, 8], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          {/* El personaje se posiciona en el grid. pos_y del juego es Z en Three.js */}
          <group position={[charData.pos_x, 1, charData.pos_y]}>
            <ROSpriteBillboard
              baseUrl={PROXY_URL}
              spriteParams={characterParams}
              position={[0, 0, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid sectionSize={1} sectionThickness={1.5} sectionColor="#444" gridBrightness={0.5} />
        <OrbitControls makeDefault />
      </Canvas>

      {/* UI Overlay */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none', maxWidth: '350px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>{charData.name}</h1>
        <p style={{ fontSize: '0.9rem', margin: '0 0 20px 0' }}>Posición Táctica: [{charData.pos_x}, {charData.pos_y}]</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <div>
            <span style={labelStyle}>Movimiento</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '120px' }}>
              <div />
              <button onClick={() => move('N')} style={buttonStyle}>N</button>
              <div />
              <button onClick={() => move('W')} style={buttonStyle}>W</button>
              <button onClick={() => move('S')} style={buttonStyle}>S</button>
              <button onClick={() => move('E')} style={buttonStyle}>E</button>
            </div>
          </div>

          <div>
            <span style={labelStyle}>Clase / Job</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {Object.entries(JOBS).map(([name, id]) => (
                <button
                  key={name}
                  onClick={() => updateVisuals({ job: id })}
                  style={{...buttonStyle, background: JSON.stringify(charData.visuals.job) === JSON.stringify(id) ? '#007bff' : '#444'}}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={labelStyle}>Género</span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => updateVisuals({ gender: 0 })} style={{...buttonStyle, background: charData.visuals.gender === 0 ? '#e83e8c' : '#444'}}>Female</button>
              <button onClick={() => updateVisuals({ gender: 1 })} style={{...buttonStyle, background: charData.visuals.gender === 1 ? '#007bff' : '#444'}}>Male</button>
            </div>
          </div>

          <div>
            <span style={labelStyle}>Acción Manual</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <button onClick={() => setCurrentActionBase(ANIMATION_BASES.STAND)} style={{...buttonStyle, background: currentActionBase === ANIMATION_BASES.STAND ? '#28a745' : '#444'}}>Stand</button>
              <button onClick={() => setCurrentActionBase(ANIMATION_BASES.WALK)} style={{...buttonStyle, background: currentActionBase === ANIMATION_BASES.WALK ? '#28a745' : '#444'}}>Walk</button>
              <button onClick={() => setCurrentActionBase(ANIMATION_BASES.ATTACK)} style={{...buttonStyle, background: currentActionBase === ANIMATION_BASES.ATTACK ? '#28a745' : '#444'}}>Attack</button>
              <button onClick={() => setCurrentActionBase(ANIMATION_BASES.SIT)} style={{...buttonStyle, background: currentActionBase === ANIMATION_BASES.SIT ? '#28a745' : '#444'}}>Sit</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default GameScene;
