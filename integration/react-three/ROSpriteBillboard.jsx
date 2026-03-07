import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const ROSpriteBillboard = ({
  job,
  action = 0,
  frame = 0,
  gender = 1,
  head = 1,
  headgear = [],
  garment = 0,
  weapon = 0,
  shield = 0,
  bodyPalette = -1,
  headPalette = -1,
  headdir = 0,
  rendererUrl = 'http://localhost:11011',
  accessToken = '',
  scale = 1,
  position = [0, 0, 0],
  onLoad = () => {},
  onError = () => {}
}) => {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let currentTexture = null;
    let objectUrl = null;
    let isMounted = true;

    const fetchSprite = async () => {
      setLoading(true);
      try {
        const payload = {
          job: Array.isArray(job) ? job : [String(job)],
          action,
          frame,
          gender,
          head,
          headgear,
          garment,
          weapon,
          shield,
          bodyPalette,
          headPalette,
          headdir,
          outputFormat: 0 // png
        };

        const response = await fetch(`${rendererUrl}/render?downloadimage=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-accesstoken': accessToken
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Renderer returned ${response.status}: ${errorText}`);
        }

        const blob = await response.blob();
        if (!isMounted) return;

        objectUrl = URL.createObjectURL(blob);

        const loader = new THREE.TextureLoader();
        loader.load(objectUrl, (tex) => {
          if (!isMounted) {
            tex.dispose();
            URL.revokeObjectURL(objectUrl);
            return;
          }
          tex.magFilter = THREE.NearestFilter;
          tex.minFilter = THREE.NearestFilter;
          tex.generateMipmaps = false;

          currentTexture = tex;
          setTexture(tex);
          onLoad();
          setLoading(false);
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }, undefined, (err) => {
          console.error('Texture load error:', err);
          if (isMounted) {
            onError(err);
            setLoading(false);
          }
        });

      } catch (err) {
        console.error('Fetch sprite error:', err);
        if (isMounted) {
          onError(err);
          setLoading(false);
        }
      }
    };

    fetchSprite();

    return () => {
      isMounted = false;
      if (currentTexture) {
        currentTexture.dispose();
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [
    JSON.stringify(job), action, frame, gender, head,
    JSON.stringify(headgear), garment, weapon,
    shield, bodyPalette, headPalette, headdir,
    rendererUrl, accessToken
  ]);

  useFrame((state) => {
    if (meshRef.current) {
      // Basic billboarding: face the camera
      meshRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  if (!texture || loading) return null;

  // Aspect ratio correction based on texture
  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  const meshScale = [scale * aspect, scale, 1];

  return (
    <mesh ref={meshRef} position={position} scale={meshScale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        side={THREE.DoubleSide}
        alphaTest={0.5}
      />
    </mesh>
  );
};

export default ROSpriteBillboard;
