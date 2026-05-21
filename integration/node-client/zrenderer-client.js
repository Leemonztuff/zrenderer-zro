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
            downloadimage: 'true'
        });

        if (this.accessToken) {
            queryParams.append('accesstoken', this.accessToken);
        }

        // Opcionalmente podemos añadir parámetros comunes a la query para que la URL sea más descriptiva
        // aunque el renderizador prefiera el cuerpo JSON en el POST.
        if (params.job) queryParams.append('job', Array.isArray(params.job) ? params.job.join(',') : params.job);
        if (params.action !== undefined) queryParams.append('action', params.action);
        if (params.gender !== undefined) queryParams.append('gender', params.gender);

        return `${this.baseUrl}/render?${queryParams.toString()}`;
    }

    /**
     * Realiza una petición POST al renderizador para obtener la lista de archivos generados.
     * @param {Object} renderRequest - Objeto RenderRequestData
     * @returns {Promise<Object>} - RenderResponseData { output: string[] }
     */
    async render(renderRequest) {
        const params = {
            ...renderRequest,
            job: Array.isArray(renderRequest.job) ? renderRequest.job.map(String) : [String(renderRequest.job)]
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.accessToken) {
            headers['x-accesstoken'] = this.accessToken;
        }

        const response = await fetch(`${this.baseUrl}/render`, {
            method: 'POST',
            headers,
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const error = await response.json();
                errorMessage = error.statusMessage || errorMessage;
            } catch (e) {
                // Si no es JSON, usamos el statusText
            }
            throw new Error(`Error en zrenderer: ${errorMessage}`);
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

        const params = {
            ...renderRequest,
            job: Array.isArray(renderRequest.job) ? renderRequest.job.map(String) : [String(renderRequest.job)]
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.accessToken) {
            headers['x-accesstoken'] = this.accessToken;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
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
