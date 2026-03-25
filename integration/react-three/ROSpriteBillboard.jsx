import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

/**
 * Componente React para mostrar un sprite de Ragnarok Online como Billboard en Three.js.
 * Utiliza @react-three/fiber para la integración con la escena 3D.
 *
 * @param {string} baseUrl URL base del servicio zrenderer.
 * @param {string} accessToken Token de acceso para la API.
 * @param {object} spriteParams Parámetros de renderizado (job, head, gender, etc.).
 * @param {Array} position Posición del sprite en el espacio 3D [x, y, z].
 * @param {number} scale Escala del sprite.
 */
const ROSpriteBillboard = ({ baseUrl, accessToken, spriteParams, position = [0, 0, 0], scale = 1 }) => {
  const [texture, setTexture] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const fetchSprite = async () => {
      try {
        const payload = {
          ...spriteParams,
          job: Array.isArray(spriteParams.job) ? spriteParams.job.map(String) : [String(spriteParams.job)]
        };

        const response = await fetch(`${baseUrl}/render?downloadimage=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-accesstoken': accessToken
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Render request failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const loader = new THREE.TextureLoader();
        loader.load(url, (tex) => {
          if (isMounted.current) {
            // NearestFilter es clave para mantener la estética de pixel art sin borrosidad.
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            setTexture(tex);
          }
          // Limpiar el objeto URL una vez cargada la textura
          URL.revokeObjectURL(url);
        });
      } catch (err) {
        console.error('Error rendering RO sprite:', err);
      }
    };

    fetchSprite();

    return () => {
      isMounted.current = false;
      if (texture) texture.dispose();
    };
  }, [baseUrl, accessToken, JSON.stringify(spriteParams)]);

  if (!texture) return null;

  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial map={texture} transparent={true} />
    </sprite>
  );
};

export default ROSpriteBillboard;
