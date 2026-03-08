import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

/**
 * A Three.js Billboard component for displaying Ragnarok Online sprites.
 *
 * @param {Object} props
 * @param {string} props.rendererUrl - URL of the zrenderer service.
 * @param {number|string} props.job - Job ID.
 * @param {number} [props.action=0] - Action ID (e.g., 0 for Stand).
 * @param {number} [props.frame=0] - Frame ID (-1 for animation).
 * @param {string} [props.gender='male'] - 'male' or 'female'.
 * @param {number} [props.head=1] - Head ID.
 * @param {Array<number>} [props.headgear=[]] - Array of headgear IDs.
 * @param {number} [props.bodyPalette=-1] - Body palette ID.
 * @param {number} [props.headPalette=-1] - Head palette ID.
 * @param {number} [props.scale=1] - Scale of the billboard.
 * @param {string} [props.accessToken] - Optional access token if calling renderer directly.
 */
const ROSpriteBillboard = ({
  rendererUrl,
  job,
  action = 0,
  frame = 0,
  gender = 'male',
  head = 1,
  headgear = [],
  bodyPalette = -1,
  headPalette = -1,
  scale = 1,
  accessToken,
  ...props
}) => {
  const [texture, setTexture] = useState(null);

  // Clean renderer URL
  const baseUrl = useMemo(() => rendererUrl?.replace(/\/$/, ''), [rendererUrl]);

  useEffect(() => {
    let isMounted = true;

    const fetchSprite = async () => {
      const params = {
        job: [String(job)],
        action,
        frame,
        gender: gender === 'male' ? 1 : 0,
        head,
        headgear,
        bodyPalette,
        headPalette,
      };

      try {
        const response = await fetch(`${baseUrl}/render?downloadimage=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'x-accesstoken': accessToken })
          },
          body: JSON.stringify(params)
        });

        if (!response.ok) throw new Error('Failed to fetch sprite');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const loader = new THREE.TextureLoader();
        loader.load(url, (tex) => {
          if (isMounted) {
            // Set filtering for pixel art
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            setTexture(tex);
          }
          // Clean up the object URL
          URL.revokeObjectURL(url);
        });
      } catch (err) {
        console.error('Error loading RO sprite:', err);
      }
    };

    fetchSprite();

    return () => {
      isMounted = false;
      if (texture) texture.dispose();
    };
  }, [baseUrl, job, action, frame, gender, head, JSON.stringify(headgear), bodyPalette, headPalette, accessToken]);

  if (!texture) return null;

  return (
    <sprite scale={[scale * (texture.image.width / 100), scale * (texture.image.height / 100), 1]} {...props}>
      <spriteMaterial attach="material" map={texture} transparent={true} />
    </sprite>
  );
};

export default ROSpriteBillboard;
