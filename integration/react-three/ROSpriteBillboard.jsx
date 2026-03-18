import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * ROSpriteBillboard - Component to display Ragnarok Online Sprites as Billboards in Three.js
 *
 * @param {string} baseUrl - Renderer URL
 * @param {string} accessToken - Token (if direct browser access is enabled)
 * @param {Object} spriteParams - Character config (job, action, frame, gender, head, etc.)
 */
export const ROSpriteBillboard = ({
  baseUrl = 'http://localhost:11011',
  accessToken,
  spriteParams = { job: 1, action: 0, frame: 0, gender: 1 },
  ...props
}) => {
  const [texture, setTexture] = useState(null);

  // Note: For complex production setups, it's better to render on your Node backend
  // and upload the resulting PNG to Supabase Storage, then load that URL here.
  // This example assumes direct access for rapid development.

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const fetchSprite = async () => {
      // Ensure job is always sent as an array of strings
      const params = {
        ...spriteParams,
        job: Array.isArray(spriteParams.job) ? spriteParams.job.map(String) : [String(spriteParams.job)]
      };

      try {
        const response = await fetch(`${baseUrl}/render?downloadimage=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-accesstoken': accessToken
          },
          body: JSON.stringify(params)
        });

        if (response.ok && isMounted) {
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          const loader = new THREE.TextureLoader();
          loader.load(objectUrl, (tex) => {
            if (!isMounted) {
              tex.dispose();
              URL.revokeObjectURL(objectUrl);
              return;
            }
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            setTexture(tex);
          });
        }
      } catch (err) {
        console.error('Failed to load RO sprite texture:', err);
      }
    };

    fetchSprite();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (texture) {
        texture.dispose();
        setTexture(null);
      }
    };
  }, [JSON.stringify(spriteParams), baseUrl, accessToken]);

  if (!texture) return null;

  return (
    <group {...props}>
      <sprite scale={[2, 2, 1]}>
        <spriteMaterial map={texture} transparent={true} />
      </sprite>
    </group>
  );
};
