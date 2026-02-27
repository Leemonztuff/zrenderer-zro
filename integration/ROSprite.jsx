import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

/**
 * ROSprite Component
 * Renders a Ragnarok Online sprite as a billboard in Three.js
 *
 * @param {string} url - The URL of the rendered sprite image
 * @param {number[]} position - [x, y, z] position
 * @param {number} scale - Scale multiplier
 */
const ROSprite = ({ url, position = [0, 0, 0], scale = 1 }) => {
  // Load texture
  const texture = useTexture(url);

  // Configure texture for pixel art look
  useMemo(() => {
    if (texture) {
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.needsUpdate = true;
    }
  }, [texture]);

  // Adjust scale based on image aspect ratio
  const spriteScale = useMemo(() => {
    if (!texture.image) return [1, 1, 1];
    const aspect = texture.image.width / texture.image.height;
    // We scale by height and adjust width by aspect ratio
    // RO sprites are roughly 1 unit tall in our coordinate system
    return [aspect * scale, scale, 1];
  }, [texture, scale]);

  return (
    <sprite position={position} scale={spriteScale}>
      <spriteMaterial
        map={texture}
        transparent={true}
        alphaTest={0.1}
      />
    </sprite>
  );
};

export default ROSprite;
