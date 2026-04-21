/**
 * Cliente de Node.js para interactuar con el servicio zrenderer.
 * Facilita la obtención de sprites de personajes de Ragnarok Online.
 */
class ZRendererClient {
    /**
     * @param {string} baseUrl - URL base del servicio zrenderer (e.g. http://localhost:11011)
     * @param {string} accessToken - Token de acceso del servicio (generado en accesstokens.conf)
     */
    constructor(baseUrl, accessToken) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        this.accessToken = accessToken;
    }

    /**
     * Normaliza los parámetros para asegurar que coincidan con los tipos esperados por el backend D.
     * @param {Object} params - Parámetros de renderizado.
     * @returns {Object} - Parámetros normalizados.
     * @private
     */
    _normalizeParams(params) {
        const normalized = { ...params };

        if (params.job) {
            normalized.job = Array.isArray(params.job) ? params.job.map(String) : [String(params.job)];
        }

        if (params.headgear) {
            normalized.headgear = Array.isArray(params.headgear) ? params.headgear.map(Number) : [Number(params.headgear)];
        }

        // Asegurar tipos numéricos para parámetros opcionales
        const numericParams = ['action', 'frame', 'gender', 'head', 'outfit', 'garment', 'weapon', 'shield', 'bodyPalette', 'headPalette'];
        numericParams.forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                normalized[key] = Number(params[key]);
            }
        });

        return normalized;
    }

    /**
     * Obtiene la URL de renderizado para un conjunto de parámetros.
     * @param {Object} params - Parámetros de renderizado (job, head, gender, etc.)
     * @returns {string} - URL completa para el endpoint de renderizado
     */
    getRenderUrl(params) {
        const queryParams = new URLSearchParams({
            downloadimage: 'true',
            accesstoken: this.accessToken
        });

        const normalized = this._normalizeParams(params);

        if (normalized.job) queryParams.append('job', normalized.job.join(','));
        if (normalized.action !== undefined) queryParams.append('action', normalized.action);
        if (normalized.gender !== undefined) queryParams.append('gender', normalized.gender);
        if (normalized.headdir !== undefined) queryParams.append('headdir', normalized.headdir);

        return `${this.baseUrl}/render?${queryParams.toString()}`;
    }

    /**
     * Realiza una petición POST al renderizador para obtener la lista de archivos generados.
     * @param {Object} renderRequest - Objeto RenderRequestData
     * @returns {Promise<Object>} - RenderResponseData { output: string[] }
     */
    async render(renderRequest) {
        const params = this._normalizeParams(renderRequest);

        const response = await fetch(`${this.baseUrl}/render`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-accesstoken': this.accessToken
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Error en zrenderer: ${error.statusMessage || response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Obtiene el buffer de imagen (PNG) de un personaje renderizado.
     * @param {Object} renderRequest - Objeto RenderRequestData
     * @returns {Promise<Buffer>} - Buffer de la imagen PNG
     */
    async renderImage(renderRequest) {
        const url = this.getRenderUrl(renderRequest);
        const params = this._normalizeParams(renderRequest);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-accesstoken': this.accessToken
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error(`Error descargando imagen: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
}

module.exports = ZRendererClient;
