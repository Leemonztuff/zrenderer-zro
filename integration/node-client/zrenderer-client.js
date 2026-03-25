/**
 * ZRendererClient para Node.js
 * Facilita la comunicación con el servicio zrenderer para generar sprites de Ragnarok Online.
 */
class ZRendererClient {
    constructor(baseUrl, accessToken) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.accessToken = accessToken;
    }

    /**
     * Construye la URL de renderizado con los parámetros proporcionados.
     */
    getRenderUrl(spriteParams) {
        const url = new URL(`${this.baseUrl}/render`);
        url.searchParams.append('downloadimage', 'true');
        return url.toString();
    }

    /**
     * Solicita al renderer que genere un sprite y devuelva la imagen en formato PNG.
     */
    async render(spriteParams) {
        // Asegurar que el job sea un array de strings para cumplir con el DTO RenderRequestData
        const payload = {
            ...spriteParams,
            job: Array.isArray(spriteParams.job) ? spriteParams.job.map(String) : [String(spriteParams.job)]
        };

        const response = await fetch(`${this.baseUrl}/render?downloadimage=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-accesstoken': this.accessToken
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ZRenderer error: ${response.status} - ${errorText}`);
        }

        return response.blob();
    }
}

if (typeof module !== 'undefined') {
    module.exports = ZRendererClient;
}
