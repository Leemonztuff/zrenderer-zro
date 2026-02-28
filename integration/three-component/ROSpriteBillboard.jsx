import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

/**
 * ROSpriteBillboard renders a Ragnarok Online sprite as a billboard in a Three.js scene.
 *
 * @param {string} url - The URL to fetch the rendered sprite (from your Node.js backend)
 * @param {number} scale - Scale of the sprite (default: 1)
 * @param {Array} position - [x, y, z] position
 */
const ROSpriteBillboard = ({ url, scale = 1, position = [0, 0, 0] }) => {
  // We use useTexture to load the PNG image from our backend
  // Note: Your backend should return the PNG buffer directly or a URL to it
  const texture = useTexture(url);

  // Set texture filtering to Nearest for that crisp pixel art look
  useMemo(() => {
    if (texture) {
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.needsUpdate = true;
    }
  }, [texture]);

  if (!texture) return null;

  // Calculate aspect ratio to maintain sprite proportions
  const { width, height } = texture.image;
  const aspectRatio = width / height;

  return (
    <sprite position={position} scale={[scale * aspectRatio, scale, 1]}>
      <spriteMaterial attach="material" map={texture} transparent={true} />
    </sprite>
  );
};

export default ROSpriteBillboard;
