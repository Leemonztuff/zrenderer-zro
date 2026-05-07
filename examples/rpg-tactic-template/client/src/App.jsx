import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

function App() {
  const [job, setJob] = useState([4012]); // Sniper por defecto
  const [action, setAction] = useState(0); // Stand por defecto
  const [gender, setGender] = useState(0); // Female por defecto
  const [headdir, setHeaddir] = useState('straight');

  // Parámetros de ejemplo para el personaje
  const characterParams = {
    job,
    gender,
    head: 5,
    action,
    headdir
  };

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {/* El Billboard de RO usando el proxy del backend */}
            <ROSpriteBillboard
              baseUrl={PROXY_URL}
              spriteParams={characterParams}
              position={[0, 1, 0]}
              scale={0.03}
            />
          </group>
        </Suspense>

        <Grid infiniteGrid fadeDistance={20} cellColor="#444" sectionColor="#666" />
        <OrbitControls makeDefault />
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>RO Tactical RPG</h1>
        <p>Preview interactivo de assets</p>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Género:</label>
            <button onClick={() => setGender(0)} style={{ padding: '8px 12px', cursor: 'pointer', background: gender === 0 ? '#007bff' : '#444', border: 'none', color: 'white', marginRight: '5px' }}>Mujer</button>
            <button onClick={() => setGender(1)} style={{ padding: '8px 12px', cursor: 'pointer', background: gender === 1 ? '#007bff' : '#444', border: 'none', color: 'white' }}>Hombre</button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Clase (Job):</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              <button onClick={() => setJob([4012])} style={{ padding: '8px', cursor: 'pointer' }}>Sniper</button>
              <button onClick={() => setJob([4001])} style={{ padding: '8px', cursor: 'pointer' }}>Knight</button>
              <button onClick={() => setJob([4009])} style={{ padding: '8px', cursor: 'pointer' }}>Assassin</button>
              <button onClick={() => setJob([1001])} style={{ padding: '8px', cursor: 'pointer' }}>Scorpion (Mob)</button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Acción:</label>
            <button onClick={() => setAction(0)} style={{ padding: '8px 12px', cursor: 'pointer', marginRight: '5px' }}>Stand</button>
            <button onClick={() => setAction(17)} style={{ padding: '8px 12px', cursor: 'pointer', marginRight: '5px' }}>Sit</button>
            <button onClick={() => setAction(8)} style={{ padding: '8px 12px', cursor: 'pointer' }}>Walk</button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Mirar (HeadDir):</label>
            <select value={headdir} onChange={(e) => setHeaddir(e.target.value)} style={{ padding: '8px', width: '100%' }}>
              <option value="straight">Al frente</option>
              <option value="left">Izquierda</option>
              <option value="right">Derecha</option>
            </select>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
