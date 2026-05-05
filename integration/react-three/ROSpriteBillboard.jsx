import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

/**
 * Componente React que renderiza un sprite de RO como un Billboard en Three.js.
 * @param {Object} props
 * @param {string} props.baseUrl - URL base del servicio (puente backend o zrenderer directo).
 * @param {string} [props.accessToken] - Token de acceso (opcional si se usa un proxy).
 * @param {Object} props.spriteParams - Parámetros para el renderizador (job, head, gender, etc.)
 * @param {number} props.scale - Escala para ajustar el sprite al mundo 3D.
 */
const ROSpriteBillboard = ({ baseUrl, accessToken, spriteParams, scale = 0.02, ...props }) => {
    const [texture, setTexture] = useState(null);

    // Re-calculamos la URL base
    const renderUrl = useMemo(() => {
        const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        return `${base}/render?downloadimage=true`;
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
                    job: Array.isArray(spriteParams.job) ? spriteParams.job.map(String) : [String(spriteParams.job)],
                    action: Number(spriteParams.action || 0),
                    gender: Number(spriteParams.gender || 1)
                };

                const headers = {
                    'Content-Type': 'application/json'
                };

                if (accessToken) {
                    headers['x-accesstoken'] = accessToken;
                }

                const response = await fetch(renderUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(params)
                });

                if (!response.ok) return;

                const blob = await response.blob();
                if (!isMounted) return;

                objectUrl = URL.createObjectURL(blob);

                const loader = new THREE.TextureLoader();
                loader.load(objectUrl, (tex) => {
                    if (isMounted) {
                        // Filtros Nearest para pixel-art nítido
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
        // Usamos JSON.stringify para detectar cambios profundos en los parámetros
    }, [renderUrl, accessToken, JSON.stringify(spriteParams)]);

    if (!texture) return null;

    // Calculamos el tamaño del sprite basado en las dimensiones de la imagen
    const width = texture.image ? texture.image.width : 100;
    const height = texture.image ? texture.image.height : 100;

    return (
        <sprite scale={[width * scale, height * scale, 1]} {...props}>
            <spriteMaterial
                map={texture}
                transparent={true}
                alphaTest={0.5}
            />
        </sprite>
    );
};

export default ROSpriteBillboard;
