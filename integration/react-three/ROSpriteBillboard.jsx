import React, { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

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

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const loader = new THREE.TextureLoader();
        loader.load(url, (tex) => {
          tex.minFilter = THREE.NearestFilter;
          tex.magFilter = THREE.NearestFilter;
          setTexture(tex);
        });

        // Cleanup function for the effect to revoke URL
        return () => URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to load RO sprite texture:', err);
    }
  };

  useEffect(() => {
    let cleanup;
    fetchSprite().then(c => cleanup = c);
    return () => {
      if (cleanup) cleanup();
      if (texture) texture.dispose();
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
