import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

/**
 * ROSpriteBillboard Component
 * Renders a Ragnarok Online sprite as a billboard in a Three.js scene.
 *
 * @param {string} baseUrl - Base URL of the zrenderer service
 * @param {string} accessToken - Token for authorization
 * @param {Object} spriteParams - Parameters for the renderer (job, action, etc.)
 * @param {number} scale - Scaling factor for the sprite (default 1)
 */
const ROSpriteBillboard = ({ baseUrl, accessToken, spriteParams, scale = 1 }) => {
  const [texture, setTexture] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchSprite = async () => {
      try {
        const url = new URL(`${baseUrl.replace(/\/$/, '')}/render?downloadimage=true`);

        const response = await fetch(url, {
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

        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const loader = new THREE.TextureLoader();
        loader.load(objectUrl, (tex) => {
          if (!isMounted.current) {
            tex.dispose();
            URL.revokeObjectURL(objectUrl);
            return;
          }

          // Important for pixel art: use NearestFilter
          tex.minFilter = THREE.NearestFilter;
          tex.magFilter = THREE.NearestFilter;
          tex.needsUpdate = true;

          setTexture(tex);
          setDimensions({
            width: tex.image.width / 100 * scale,
            height: tex.image.height / 100 * scale
          });

          URL.revokeObjectURL(objectUrl);
        });
      } catch (err) {
        console.error('Failed to load RO sprite:', err);
      }
    };

    fetchSprite();

    return () => {
      isMounted.current = false;
      if (texture) texture.dispose();
    };
  }, [baseUrl, accessToken, JSON.stringify(spriteParams), scale]);

  if (!texture) return null;

  return (
    <sprite scale={[dimensions.width, dimensions.height, 1]}>
      <spriteMaterial
        attach="material"
        map={texture}
        transparent={true}
        alphaTest={0.5}
      />
    </sprite>
  );
};

export default ROSpriteBillboard;
