import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import ROSpriteBillboard from '../../../../integration/react-three/ROSpriteBillboard';

const DIRECTION_MAP = {
  'N': 4,
  'S': 0,
  'E': 6,
  'W': 2,
};

function GameScene() {
  const [job, setJob] = useState([4012]); // Sniper por defecto
  const [action, setAction] = useState(0); // Stand por defecto base
  const [gender, setGender] = useState(0); // Female por defecto
  const [head, setHead] = useState(5);
  const [charPos, setCharPos] = useState([0, 0, 0]);
  const [charName, setCharName] = useState('Héroe de Prueba');
  const moveTimeout = useRef(null);

  // Parámetros de ejemplo para el personaje
  const characterParams = {
    job,
    gender,
    head,
    action
  };

  // Recomendamos usar el proxy del backend para no exponer el token del renderizador
  const PROXY_URL = 'http://localhost:3001/api';

  // Cargar datos iniciales del personaje si hay un ID disponible
  useEffect(() => {
    fetch(`${PROXY_URL}/character/default-id`)
      .then(res => res.json())
      .then(data => {
        setCharName(data.name);
        if (data.visuals) {
          setJob(data.visuals.job);
          setGender(data.visuals.gender);
          setHead(data.visuals.head);
        }
        if (data.position) {
          setCharPos([data.position.x, data.position.y, data.position.z]);
        }
      })
      .catch(err => console.warn("Usando datos locales de prueba."));
  }, []);

  const move = (dir) => {
    // Calcular nueva posición
    let nextPos = [...charPos];
    if (dir === 'N') nextPos[2] -= 1;
    if (dir === 'S') nextPos[2] += 1;
    if (dir === 'E') nextPos[0] += 1;
    if (dir === 'W') nextPos[0] -= 1;

    // Dirección de RO (0: S, 1: SW, 2: W, 3: NW, 4: N, 5: NE, 6: E, 7: SE)
    const roDir = DIRECTION_MAP[dir];

    // Cambiar a animación de caminar (Base 8) + dirección
    setAction(8 + roDir);
    setCharPos(nextPos);

    // Persistir posición en el backend (silencioso)
    fetch(`${PROXY_URL}/character/default-id/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x: nextPos[0], y: nextPos[1], z: nextPos[2] })
    }).catch(() => {});

    // Volver a Stand (Base 0) después de un tiempo
    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    moveTimeout.current = setTimeout(() => {
      setAction(0 + roDir);
    }, 500);
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
        <h1 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>{charName}</h1>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
          <p style={{ margin: '2px 0' }}>Posición: X: {charPos[0]}, Z: {charPos[2]}</p>
          <p style={{ margin: '2px 0' }}>Job ID: {job[0]}</p>
          <p style={{ margin: '2px 0' }}>Action ID: {action}</p>
        </div>

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
            <span style={labelStyle}>Cabeza (Head)</span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="number"
                value={head}
                onChange={(e) => setHead(parseInt(e.target.value))}
                style={{...buttonStyle, width: '60px', textAlign: 'center'}}
              />
              <button onClick={() => setHead(prev => prev + 1)} style={buttonStyle}>+</button>
              <button onClick={() => setHead(prev => prev - 1)} style={buttonStyle}>-</button>
            </div>
          </div>

          <div>
            <span style={labelStyle}>Acción Directa</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <button onClick={() => setAction(0)} style={{...buttonStyle, background: (action % 8) === 0 && action < 8 ? '#28a745' : '#444'}}>Stand</button>
              <button onClick={() => setAction(17)} style={{...buttonStyle, background: action === 17 ? '#28a745' : '#444'}}>Sit</button>
              <button onClick={() => setAction(16)} style={{...buttonStyle, background: action >= 16 && action < 24 ? '#28a745' : '#444'}}>Attack</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default GameScene;
