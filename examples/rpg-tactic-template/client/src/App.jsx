import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function GameScene() {
  const [job, setJob] = useState([4012]); // Sniper por defecto
  const [action, setAction] = useState(0); // Stand por defecto
  const [gender, setGender] = useState(0); // Female por defecto
  const [charPos, setCharPos] = useState([0, 0, 0]);

  // Parámetros de ejemplo para el personaje
  const characterParams = {
    job,
    gender,
    head: 5,
    action
  };

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  const move = (direction) => {
    setCharPos(([x, y, z]) => {
      switch (direction) {
        case 'N': return [x, y, z - 1];
        case 'S': return [x, y, z + 1];
        case 'E': return [x + 1, y, z];
        case 'W': return [x - 1, y, z];
        default: return [x, y, z];
      }
    });
  };

  const buttonStyle = { padding: '8px 12px', cursor: 'pointer', background: '#444', color: 'white', border: '1px solid #666', borderRadius: '4px' };
  const labelStyle = { fontSize: '0.8rem', marginBottom: '5px', display: 'block', fontWeight: 'bold' };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={[charPos[0], charPos[1] + 1, charPos[2]]}>
            {/* El Billboard de RO usando el proxy del backend */}
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

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none', maxWidth: '300px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>RPG Tactic Template</h1>
        <p style={{ fontSize: '0.9rem' }}>Posición: [{charPos[0]}, {charPos[2]}]</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>

          <div>
            <span style={labelStyle}>Movimiento Táctico</span>
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
            <span style={labelStyle}>Clase (Job)</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <button onClick={() => setJob([4012])} style={{...buttonStyle, background: job[0] === 4012 ? '#007bff' : '#444'}}>Sniper</button>
              <button onClick={() => setJob([7])} style={{...buttonStyle, background: job[0] === 7 ? '#007bff' : '#444'}}>Knight</button>
              <button onClick={() => setJob([12])} style={{...buttonStyle, background: job[0] === 12 ? '#007bff' : '#444'}}>Assassin</button>
              <button onClick={() => setJob([1001])} style={{...buttonStyle, background: job[0] === 1001 ? '#007bff' : '#444'}}>Scorpion</button>
            </div>
          </div>

          <div>
            <span style={labelStyle}>Género</span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => setGender(0)} style={{...buttonStyle, background: gender === 0 ? '#e83e8c' : '#444'}}>Female</button>
              <button onClick={() => setGender(1)} style={{...buttonStyle, background: gender === 1 ? '#007bff' : '#444'}}>Male</button>
            </div>
          </div>

          <div>
            <span style={labelStyle}>Acción</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <button onClick={() => setAction(0)} style={{...buttonStyle, background: action === 0 ? '#28a745' : '#444'}}>Stand</button>
              <button onClick={() => setAction(17)} style={{...buttonStyle, background: action === 17 ? '#28a745' : '#444'}}>Sit</button>
              <button onClick={() => setAction(8)} style={{...buttonStyle, background: action === 8 ? '#28a745' : '#444'}}>Walk</button>
              <button onClick={() => setAction(16)} style={{...buttonStyle, background: action === 16 ? '#28a745' : '#444'}}>Attack</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default GameScene;
