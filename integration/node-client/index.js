const axios = require('axios');

class ZRendererClient {
    /**
     * @param {string} baseURL The URL of the zrenderer service (e.g., http://localhost:11011)
     * @param {string} token The access token for the service
     */
    constructor(baseURL, token) {
        this.client = axios.create({
            baseURL,
            headers: {
                'x-accesstoken': token,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Renders a sprite and returns the image buffer.
     * @param {Object} params Parameters for the RenderRequest (see OpenAPI spec)
     * @returns {Promise<Buffer>} The rendered PNG image buffer
     */
    async renderSprite(params) {
        try {
            const response = await this.client.post('/render', params, {
                params: { downloadimage: true },
                responseType: 'arraybuffer'
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                // Try to parse error message if possible
                const msg = error.response.data.toString();
                throw new Error(`zrenderer error: ${msg}`);
            }
            throw error;
        }
    }

    /**
     * Utility to convert render params from Supabase schema to zrenderer format
     * @param {Object} character A character object from the 'characters' table
     */
    static mapCharacterToRenderParams(character) {
        return {
            job: [character.job_id.toString()],
            gender: character.gender === 'male' ? 1 : 0,
            head: character.head_id,
            headgear: character.headgear_ids || [],
            garment: character.garment_id || 0,
            weapon: character.weapon_id || 0,
            shield: character.shield_id || 0,
            bodyPalette: character.body_palette || -1,
            headPalette: character.head_palette || -1,
            action: character.current_action || 0,
            frame: character.current_frame || -1
        };
    }
}

module.exports = ZRendererClient;
