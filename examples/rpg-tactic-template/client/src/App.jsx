import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  const [charData, setCharData] = useState({
    name: 'Cargando...',
    position: [0, 0, 0],
    visuals: {
      job: [4012],
      gender: 0,
      head: 5,
      action: 0
    }
  });

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  // Ejemplo de cómo cargar un personaje desde el backend (que a su vez usa Supabase)
  useEffect(() => {
    fetch(`${PROXY_URL}/character/default-id`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
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

  const updateHead = (newHead) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, head: newHead }
    }));
  };

  const updateGender = (newGender) => {
    setCharData(prev => ({
      ...prev,
      visuals: { ...prev.visuals, gender: newGender }
    }));
  };

  const move = (dx, dz) => {
    setCharData(prev => ({
      ...prev,
      position: [prev.position[0] + dx, prev.position[1], prev.position[2] + dz],
      visuals: { ...prev.visuals, action: 8 } // Activa animación de caminar
    }));
    // Volver a "Stand" después de un momento
    setTimeout(() => {
      setCharData(prev => ({
        ...prev,
        visuals: { ...prev.visuals, action: 0 }
      }));
    }, 500);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 45 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        <Suspense fallback={null}>
          <group position={charData.position}>
            {/* El Billboard de RO usando el proxy del backend */}
            <ROSpriteBillboard
              baseUrl={PROXY_URL}
              spriteParams={charData.visuals}
              position={[0, 1, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid
          infiniteGrid
          cellSize={1}
          sectionSize={5}
          fadeDistance={30}
          sectionColor="#333"
          cellColor="#444"
        />
        <OrbitControls makeDefault />
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
        <h1>{charData.name}</h1>
        <p>Usa el mouse para rotar la cámara y los botones para moverte.</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>

          <div style={{ display: 'flex', gap: '5px' }}>
            <strong>Clase:</strong>
            <button onClick={() => updateJob([4012])} style={{ padding: '4px 8px', cursor: 'pointer' }}>Sniper</button>
            <button onClick={() => updateJob([7])} style={{ padding: '4px 8px', cursor: 'pointer' }}>Knight</button>
            <button onClick={() => updateJob([12])} style={{ padding: '4px 8px', cursor: 'pointer' }}>Assassin</button>
          </div>

          <div style={{ display: 'flex', gap: '5px' }}>
            <strong>Género:</strong>
            <button onClick={() => updateGender(0)} style={{ padding: '4px 8px', cursor: 'pointer' }}>Mujer</button>
            <button onClick={() => updateGender(1)} style={{ padding: '4px 8px', cursor: 'pointer' }}>Hombre</button>
          </div>

          <div style={{ display: 'flex', gap: '5px' }}>
            <strong>Cabello:</strong>
            <button onClick={() => updateHead(1)} style={{ padding: '4px 8px', cursor: 'pointer' }}>1</button>
            <button onClick={() => updateHead(5)} style={{ padding: '4px 8px', cursor: 'pointer' }}>5</button>
            <button onClick={() => updateHead(10)} style={{ padding: '4px 8px', cursor: 'pointer' }}>10</button>
            <button onClick={() => updateHead(20)} style={{ padding: '4px 8px', cursor: 'pointer' }}>20</button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
                <div />
                <button onClick={() => move(0, -1)} style={{ padding: '10px', cursor: 'pointer' }}>N</button>
                <div />
                <button onClick={() => move(-1, 0)} style={{ padding: '10px', cursor: 'pointer' }}>W</button>
                <button onClick={() => move(0, 1)} style={{ padding: '10px', cursor: 'pointer' }}>S</button>
                <button onClick={() => move(1, 0)} style={{ padding: '10px', cursor: 'pointer' }}>E</button>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => updateAction(17)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Sentarse</button>
            <button onClick={() => updateAction(16)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Atacar</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default GameScene;
