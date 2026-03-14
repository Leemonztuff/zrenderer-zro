import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * ROSpriteBillboard Component
 * Renders a Ragnarok Online sprite as a billboard in Three.js
 *
 * @param {Object} characterConfig - The character configuration (job, head, etc.)
 * @param {string} rendererUrl - The URL of the zrenderer proxy or service
 * @param {string} [accessToken] - Optional access token if connecting directly to zrenderer
 * @param {number[]} position - [x, y, z] position
 * @param {number} scale - Scale multiplier
 */
export const ROSpriteBillboard = ({
  characterConfig,
  rendererUrl,
  accessToken,
  position = [0, 0, 0],
  scale = 1
}) => {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    let objectUrl = null;
    let currentTexture = null;

    const fetchSprite = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (accessToken) {
          headers['x-accesstoken'] = accessToken;
        }

        const response = await fetch(`${rendererUrl}/render?downloadimage=true`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...characterConfig,
            job: Array.isArray(characterConfig.job) ? characterConfig.job.map(String) : [String(characterConfig.job)]
          })
        });

        if (!response.ok) throw new Error('Failed to fetch sprite');

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (!isCancelled) {
          const loader = new THREE.TextureLoader();
          loader.load(objectUrl, (tex) => {
            if (isCancelled) {
              tex.dispose();
              return;
            }
            // Pixel-art filtering
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            tex.needsUpdate = true;

            setTexture(tex);
            currentTexture = tex;
          });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching RO sprite:', error);
        }
      }
    };

    if (characterConfig && rendererUrl) {
      fetchSprite();
    }

    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (currentTexture) currentTexture.dispose();
    };
  }, [JSON.stringify(characterConfig), rendererUrl, accessToken]);

  if (!texture) return null;

  // Adjust aspect ratio based on texture dimensions
  const aspect = texture.image ? texture.image.width / texture.image.height : 1;

  return (
    <sprite position={position} scale={[aspect * scale, scale, 1]}>
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
