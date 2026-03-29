/**
 * Helper client to interact with the zrenderer service from a Node.js backend.
 */
class ZRendererClient {
    constructor(baseUrl, accessToken) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.accessToken = accessToken;
    }

    /**
     * Build the render URL for a character.
     * Use downloadimage=true to get the PNG directly.
     */
    getRenderUrl() {
        const queryParams = new URLSearchParams({
            downloadimage: 'true'
        });

        return `${this.baseUrl}/render?${queryParams.toString()}`;
    }

    /**
     * Request a render and get the image as a Buffer.
     */
    async renderCharacter(params) {
        const response = await fetch(this.getRenderUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-accesstoken': this.accessToken
            },
            body: JSON.stringify({
                ...params,
                // Backend expects job to be an array of strings
                job: Array.isArray(params.job) ? params.job.map(String) : [String(params.job)]
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ statusMessage: 'Unknown error' }));
            throw new Error(`zrenderer error: ${error.statusMessage || response.statusText}`);
        }

        return Buffer.from(await response.arrayBuffer());
    }
}

module.exports = ZRendererClient;
