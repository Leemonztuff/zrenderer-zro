import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

/**
 * A Three.js Billboard component that renders a Ragnarok Online sprite.
 *
 * @param {Object} props
 * @param {string} props.baseUrl - The zrenderer base URL.
 * @param {string} props.accessToken - Access token for zrenderer.
 * @param {Object} props.spriteParams - Parameters for the render (job, action, frame, etc).
 */
const ROSpriteBillboard = ({ baseUrl, accessToken, spriteParams, ...meshProps }) => {
    const [texture, setTexture] = useState(null);

    useEffect(() => {
        let isMounted = true;
        let objectUrl = null;

        const fetchSprite = async () => {
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
                objectUrl = URL.createObjectURL(blob);

                const loader = new THREE.TextureLoader();
                loader.load(objectUrl, (tex) => {
                    if (isMounted) {
                        // RO sprites look better with nearest filtering (pixel art)
                        tex.minFilter = THREE.NearestFilter;
                        tex.magFilter = THREE.NearestFilter;
                        setTexture(tex);
                    }
                });
            } catch (error) {
                console.error('Error loading RO sprite:', error);
            }
        };

        fetchSprite();

        return () => {
            isMounted = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            if (texture) texture.dispose();
        };
    }, [baseUrl, accessToken, JSON.stringify(spriteParams)]);

    if (!texture) return null;

    return (
        <mesh {...meshProps}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={texture}
                transparent={true}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};

export default ROSpriteBillboard;
