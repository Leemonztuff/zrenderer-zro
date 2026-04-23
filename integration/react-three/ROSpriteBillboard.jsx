import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

/**
 * Componente React que renderiza un sprite de RO como un Billboard en Three.js.
 * @param {Object} props
 * @param {string} props.baseUrl - URL base del servicio zrenderer.
 * @param {string} props.accessToken - Token de acceso del servicio.
 * @param {Object} props.spriteParams - Parámetros para el renderizador (job, head, gender, etc.)
 * @param {number} props.scale - Escala para ajustar el sprite al mundo 3D.
 */
const ROSpriteBillboard = ({ baseUrl, accessToken, spriteParams, scale = 0.02, ...props }) => {
    const [texture, setTexture] = useState(null);
    const { scene } = useThree();

    // Re-calculamos la URL cada vez que cambien los parámetros del sprite
    const renderUrl = useMemo(() => {
        return `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}/render?downloadimage=true`;
    }, [baseUrl]);

    // Manejo de limpieza de textura para evitar fugas de memoria en la GPU
    useEffect(() => {
        return () => {
            if (texture) {
                texture.dispose();
            }
        };
    }, [texture]);

    useEffect(() => {
        let isMounted = true;
        let objectUrl = null;

        const loadSprite = async () => {
            try {
                // Normalizamos parámetros para el backend
                const params = {
                    ...spriteParams,
                    job: Array.isArray(spriteParams.job) ? spriteParams.job.map(String) : [String(spriteParams.job || '0')],
                    headgear: Array.isArray(spriteParams.headgear) ? spriteParams.headgear.map(Number) : (spriteParams.headgear ? [Number(spriteParams.headgear)] : []),
                    action: spriteParams.action !== undefined ? Number(spriteParams.action) : 0,
                    gender: spriteParams.gender !== undefined ? Number(spriteParams.gender) : 1,
                    head: spriteParams.head !== undefined ? Number(spriteParams.head) : 1,
                    bodyPalette: spriteParams.bodyPalette !== undefined ? Number(spriteParams.bodyPalette) : -1,
                    headPalette: spriteParams.headPalette !== undefined ? Number(spriteParams.headPalette) : -1,
                    headdir: spriteParams.headdir || 'all'
                };

                // Hacer el POST para obtener la imagen como blob
                const response = await fetch(renderUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-accesstoken': accessToken
                    },
                    body: JSON.stringify(params)
                });

                if (!response.ok) return;

                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);

                const loader = new THREE.TextureLoader();
                loader.load(objectUrl, (tex) => {
                    if (isMounted) {
                        // Para mantener el arte pixelado nítido
                        tex.minFilter = THREE.NearestFilter;
                        tex.magFilter = THREE.NearestFilter;
                        tex.needsUpdate = true;
                        setTexture(tex);
                    } else {
                        tex.dispose();
                    }
                });

            } catch (error) {
                console.error("Error cargando sprite de RO:", error);
            }
        };

        loadSprite();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [renderUrl, accessToken, JSON.stringify(spriteParams)]);

    if (!texture) return null;

    return (
        <sprite scale={[texture.image.width * scale, texture.image.height * scale, 1]} {...props}>
            <spriteMaterial
                map={texture}
                transparent={true}
                alphaTest={0.5} // Evita artefactos de profundidad
            />
        </sprite>
    );
};

export default ROSpriteBillboard;
