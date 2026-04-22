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
     * Normaliza los parámetros para asegurar tipos correctos para el backend.
     * @private
     */
    _normalizeParams(params) {
        return {
            ...params,
            job: Array.isArray(params.job) ? params.job.map(String) : [String(params.job)],
            action: params.action !== undefined ? Number(params.action) : 0,
            gender: params.gender !== undefined ? Number(params.gender) : 1,
            bodyPalette: params.bodyPalette !== undefined ? Number(params.bodyPalette) : -1,
            headPalette: params.headPalette !== undefined ? Number(params.headPalette) : -1,
            headdir: params.headdir !== undefined ? String(params.headdir) : 'all'
        };
    }

    /**
     * Obtiene la URL de renderizado para un conjunto de parámetros.
     * @param {Object} params - Parámetros de renderizado (job, head, gender, etc.)
     * @returns {string} - URL completa para el endpoint de renderizado
     */
    getRenderUrl(params) {
        const normalized = this._normalizeParams(params);
        const queryParams = new URLSearchParams({
            downloadimage: 'true',
            accesstoken: this.accessToken
        });

        // Opcionalmente podemos añadir parámetros comunes a la query para que la URL sea más descriptiva
        // aunque el renderizador prefiera el cuerpo JSON en el POST.
        if (normalized.job) queryParams.append('job', normalized.job.join(','));
        if (normalized.action !== undefined) queryParams.append('action', normalized.action);
        if (normalized.gender !== undefined) queryParams.append('gender', normalized.gender);

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
        const params = this._normalizeParams(renderRequest);
        const url = this.getRenderUrl(params);

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
