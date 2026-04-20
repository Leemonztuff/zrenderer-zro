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
     * Obtiene la URL de renderizado para un conjunto de parámetros.
     * @param {Object} params - Parámetros de renderizado (job, head, gender, etc.)
     * @returns {string} - URL completa para el endpoint de renderizado
     */
    getRenderUrl(params) {
        const queryParams = new URLSearchParams({
            downloadimage: 'true',
            accesstoken: this.accessToken
        });

        // Opcionalmente podemos añadir parámetros comunes a la query para que la URL sea más descriptiva
        // aunque el renderizador prefiera el cuerpo JSON en el POST.
        if (params.job) queryParams.append('job', Array.isArray(params.job) ? params.job.join(',') : params.job);
        if (params.action !== undefined) queryParams.append('action', Number(params.action));
        if (params.gender !== undefined) queryParams.append('gender', Number(params.gender));

        return `${this.baseUrl}/render?${queryParams.toString()}`;
    }

    /**
     * Normaliza los parámetros de renderizado para el backend.
     * @param {Object} request - Parámetros de entrada
     * @returns {Object} - Parámetros normalizados
     */
    _normalizeParams(request) {
        return {
            ...request,
            job: Array.isArray(request.job) ? request.job.map(String) : [String(request.job)],
            action: request.action !== undefined ? Number(request.action) : undefined,
            gender: request.gender !== undefined ? Number(request.gender) : undefined,
            head: request.head !== undefined ? Number(request.head) : undefined,
            bodyPalette: request.bodyPalette !== undefined ? Number(request.bodyPalette) : undefined,
            headPalette: request.headPalette !== undefined ? Number(request.headPalette) : undefined
        };
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
