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
     * Normaliza los parámetros para asegurar que los tipos sean correctos para el backend.
     * @private
     */
    _normalizeParams(params) {
        return {
            ...params,
            job: Array.isArray(params.job) ? params.job.map(String) : [String(params.job)],
            action: params.action !== undefined ? Number(params.action) : 0,
            gender: params.gender !== undefined ? Number(params.gender) : 1,
            head: params.head !== undefined ? Number(params.head) : 1,
            bodyPalette: params.bodyPalette !== undefined ? Number(params.bodyPalette) : -1,
            headPalette: params.headPalette !== undefined ? Number(params.headPalette) : -1,
            headdir: params.headdir || 'all'
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

        // Añadimos parámetros a la query para facilitar cache y depuración
        queryParams.append('job', normalized.job.join(','));
        queryParams.append('action', normalized.action);
        queryParams.append('gender', normalized.gender);
        if (normalized.bodyPalette !== -1) queryParams.append('bodyPalette', normalized.bodyPalette);
        if (normalized.headPalette !== -1) queryParams.append('headPalette', normalized.headPalette);

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
            let errorText;
            try {
                const error = await response.json();
                errorText = error.statusMessage || response.statusText;
            } catch (e) {
                errorText = response.statusText;
            }
            throw new Error(`Error en zrenderer: ${errorText}`);
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
