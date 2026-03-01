/**
 * Client for the zrenderer API.
 * This client simplifies interactions with the zrenderer service.
 */
class ZRendererClient {
    /**
     * @param {string} baseUrl The base URL of the zrenderer service (e.g., 'http://localhost:11011')
     * @param {string} accessToken The access token for the zrenderer service.
     */
    constructor(baseUrl, accessToken) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        this.accessToken = accessToken;
    }

    /**
     * Renders a character sprite.
     * @param {Object} config The character configuration.
     * @param {boolean} downloadImage Whether to return the raw PNG data.
     * @returns {Promise<Response>} The response from the renderer.
     */
    async renderCharacter(config, downloadImage = true) {
        const url = new URL(`${this.baseUrl}/render`);
        if (downloadImage) {
            url.searchParams.set('downloadimage', 'true');
        }

        // Map camelCase to the zrenderer snake_case/param name style if needed
        const body = {
            job: Array.isArray(config.job) ? config.job : [String(config.job)],
            action: config.action ?? 0,
            frame: config.frame ?? 0,
            gender: config.gender ?? 1,
            head: config.head ?? 1,
            outfit: config.outfit ?? 0,
            headgear: config.headgear ?? [],
            garment: config.garment ?? 0,
            weapon: config.weapon ?? 0,
            shield: config.shield ?? 0,
            bodyPalette: config.bodyPalette ?? -1,
            headPalette: config.headPalette ?? -1,
            headdir: config.headdir ?? 0,
            madogearType: config.madogearType ?? 0,
            enableShadow: config.enableShadow ?? true,
            canvas: config.canvas ?? "",
            outputFormat: config.outputFormat ?? 0
        };

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-accesstoken': this.accessToken
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ statusMessage: 'Unknown error' }));
            throw new Error(`zrenderer error: ${error.statusMessage || response.statusText}`);
        }

        return response;
    }

    /**
     * Gets the sprite as a Blob (useful for React/Three.js).
     * @param {Object} config
     * @returns {Promise<Blob>}
     */
    async getCharacterSpriteBlob(config) {
        const response = await this.renderCharacter(config, true);
        return await response.blob();
    }

    /**
     * Gets the health status of the service.
     * @returns {Promise<Object>}
     */
    async getHealth() {
        const response = await fetch(`${this.baseUrl}/admin/health`, {
            headers: {
                'x-accesstoken': this.accessToken
            }
        });
        return await response.json();
    }
}

module.exports = ZRendererClient;
