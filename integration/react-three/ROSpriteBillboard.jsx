import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * ROSpriteBillboard: A Three.js component that renders a Ragnarok Online sprite
 * from the zrenderer service on a billboarded plane.
 *
 * @param {string} baseUrl - zrenderer server URL
 * @param {string} accessToken - Access token for zrenderer
 * @param {Object} spriteParams - Parameters for the renderer (job, action, head, etc.)
 * @param {number} scale - Optional scale for the sprite
 * @param {boolean} billboard - Whether the sprite should always face the camera
 */
const ROSpriteBillboard = ({
  baseUrl,
  accessToken,
  spriteParams,
  scale = 1,
  billboard = true
}) => {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const loadTexture = async () => {
      try {
        const response = await fetch(`${baseUrl}/render?downloadimage=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-accesstoken': accessToken
          },
          body: JSON.stringify({
            ...spriteParams,
            job: Array.isArray(spriteParams.job) ? spriteParams.job.map(String) : [String(spriteParams.job)]
          })
        });

        if (!response.ok) throw new Error('Failed to fetch sprite');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const loader = new THREE.TextureLoader();
        loader.load(url, (tex) => {
          if (!isMounted) return;

          // RO Sprites use pixel art, so we need nearest filtering
          tex.minFilter = THREE.NearestFilter;
          tex.magFilter = THREE.NearestFilter;

          setTexture(tex);
          setAspectRatio(tex.image.width / tex.image.height);

          // Cleanup URL
          URL.revokeObjectURL(url);
        });
      } catch (error) {
        console.error('Error loading RO sprite:', error);
      }
    };

    loadTexture();

    return () => {
      isMounted = false;
      if (texture) texture.dispose();
    };
  }, [baseUrl, accessToken, JSON.stringify(spriteParams)]);

  useFrame((state) => {
    if (billboard && meshRef.current) {
      meshRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} scale={[scale * aspectRatio, scale, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        side={THREE.DoubleSide}
        alphaTest={0.5} // RO sprites often have clean alpha borders
      />
    </mesh>
  );
};

export default ROSpriteBillboard;
