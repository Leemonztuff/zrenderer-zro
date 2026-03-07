const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

class ZRendererClient {
    constructor(config) {
        this.rendererUrl = config.rendererUrl || 'http://localhost:11011';
        this.accessToken = config.accessToken;
        this.supabaseUrl = config.supabaseUrl;
        this.supabaseKey = config.supabaseKey;
        this.storageBucket = config.storageBucket || 'sprites';

        if (this.supabaseUrl && this.supabaseKey) {
            this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        }
    }

    async renderSprite(params) {
        try {
            const response = await axios.post(`${this.rendererUrl}/render?downloadimage=true`, params, {
                headers: {
                    'x-accesstoken': this.accessToken,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            });
            return response.data;
        } catch (error) {
            console.error('Error rendering sprite:', error.response ? error.response.data.toString() : error.message);
            throw error;
        }
    }

    async uploadToSupabase(buffer, path) {
        if (!this.supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await this.supabase.storage
            .from(this.storageBucket)
            .upload(path, buffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) throw error;
        return data;
    }

    async getPublicUrl(path) {
        if (!this.supabase) throw new Error('Supabase client not initialized');

        const { data } = this.supabase.storage
            .from(this.storageBucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }
}

module.exports = ZRendererClient;
