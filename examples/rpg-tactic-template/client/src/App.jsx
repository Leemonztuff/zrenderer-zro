import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function Scene({ characters }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={30} />

      {characters.map((char, index) => (
        <ROSpriteBillboard
          key={char.id || index}
          baseUrl="http://localhost:3001/api" // Apuntamos al proxy del servidor
          accessToken="not-needed-for-proxy"
          spriteParams={{
            job: char.job,
            head: char.head,
            gender: char.gender,
            action: char.action || 0,
            headgear: char.headgear
          }}
          position={[char.pos_x || index * 2, 0.5, char.pos_y || 0]}
          scale={0.015}
        />
      ))}
    </>
  );
}

function App() {
  const [characters, setCharacters] = useState([
    { id: 1, name: 'Knight', job: [1001], head: 1, gender: 1, action: 0, pos_x: 0, pos_y: 0 },
    { id: 2, name: 'Sniper', job: [4012], head: 2, gender: 0, action: 0, pos_x: 2, pos_y: 2 }
  ]);

  const updateAction = (actionId) => {
    setCharacters(prev => prev.map(c => ({ ...c, action: actionId })));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, color: 'white' }}>
        <h1>RPG Tactic Template</h1>
        <p>Control de Animaciones:</p>
        <button onClick={() => updateAction(0)}>Stand</button>
        <button onClick={() => updateAction(16)}>Attack</button>
        <button onClick={() => updateAction(17)}>Sit</button>
      </div>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <Scene characters={characters} />
      </Canvas>
    </div>
  );
}

export default App;
