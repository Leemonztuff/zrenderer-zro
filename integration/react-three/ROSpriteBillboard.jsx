import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * A React Three Fiber component that renders a Ragnarok Online sprite as a billboard.
 *
 * @param {Object} props
 * @param {Object} props.characterConfig The character configuration from Supabase.
 * @param {string} props.rendererUrl The base URL for the zrenderer proxy or service.
 * @param {string} [props.accessToken] Optional access token (if calling renderer directly).
 * @param {number[]} props.position The [x, y, z] position in the 3D scene.
 * @param {number} props.scale The scale of the sprite.
 */
export const ROSpriteBillboard = ({ characterConfig, rendererUrl, accessToken, position = [0, 0, 0], scale = 1 }) => {
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
              job: Array.isArray(characterConfig.job) ? characterConfig.job : [String(characterConfig.job)]
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
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
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
  }, [JSON.stringify(characterConfig), rendererUrl]);

  if (!texture) return null;

  return (
    <sprite position={position} scale={[scale, scale, 1]}>
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
