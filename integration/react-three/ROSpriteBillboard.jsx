import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

/**
 * Componente React que renderiza un sprite de RO como un Billboard en Three.js.
 * @param {Object} props
 * @param {string} props.baseUrl - URL base del servicio zrenderer.
 * @param {string} props.accessToken - Token de acceso del servicio (opcional si se usa un proxy).
 * @param {Object} props.spriteParams - Parámetros para el renderizador (job, head, gender, etc.)
 * @param {number} props.scale - Escala para ajustar el sprite al mundo 3D.
 */
const ROSpriteBillboard = ({ baseUrl, accessToken, spriteParams, scale = 0.02, ...props }) => {
    const [texture, setTexture] = useState(null);

    // Re-calculamos la URL base
    const renderUrl = useMemo(() => {
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        return `${cleanBaseUrl}/render?downloadimage=true`;
    }, [baseUrl]);

    // Limpieza de textura para evitar fugas de memoria en la GPU
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
                // Normalización básica de parámetros
                const params = {
                    ...spriteParams,
                    job: Array.isArray(spriteParams.job) ? spriteParams.job.map(String) : [String(spriteParams.job)]
                };

                const headers = {
                    'Content-Type': 'application/json'
                };
                if (accessToken) {
                    headers['x-accesstoken'] = accessToken;
                }

                // Hacer el POST para obtener la imagen como blob
                const response = await fetch(renderUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(params)
                });

                if (!response.ok) {
                    console.error("Error en la respuesta del renderizador:", response.statusText);
                    return;
                }

                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);

                const loader = new THREE.TextureLoader();
                loader.load(objectUrl, (tex) => {
                    if (isMounted) {
                        // Para mantener el arte pixelado nítido
                        tex.minFilter = THREE.NearestFilter;
                        tex.magFilter = THREE.NearestFilter;
                        tex.needsUpdate = true;
                        setTexture(prevTex => {
                            if (prevTex) prevTex.dispose();
                            return tex;
                        });
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
                alphaTest={0.5}
            />
        </sprite>
    );
};

export default ROSpriteBillboard;
