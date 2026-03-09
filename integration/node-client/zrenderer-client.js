const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

/**
 * Client for interacting with zrenderer and managing sprite uploads to Supabase.
 */
class ZRendererClient {
  /**
   * @param {Object} config
   * @param {string} config.rendererUrl - Base URL of the zrenderer service.
   * @param {string} config.accessToken - Access token for the zrenderer service.
   * @param {string} [config.supabaseUrl] - Supabase project URL.
   * @param {string} [config.supabaseKey] - Supabase service role or anon key.
   * @param {string} [config.storageBucket='sprites'] - Supabase storage bucket name.
   */
  constructor(config) {
    this.rendererUrl = config.rendererUrl.replace(/\/$/, '');
    this.accessToken = config.accessToken;
    this.storageBucket = config.storageBucket || 'sprites';

    if (config.supabaseUrl && config.supabaseKey) {
      this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    }

    this.api = axios.create({
      baseURL: this.rendererUrl,
      headers: {
        'x-accesstoken': this.accessToken,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Request a sprite render from the service.
   * @param {Object} params - Render parameters (see zrenderer API docs).
   * @returns {Promise<Object>} - The render response.
   */
  async render(params) {
    try {
      const response = await this.api.post('/render', params);
      return response.data;
    } catch (error) {
      console.error('Error rendering sprite:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Request a sprite render and download the image directly.
   * @param {Object} params - Render parameters.
   * @returns {Promise<Buffer>} - The image data.
   */
  async renderAndDownload(params) {
    try {
      const response = await this.api.post('/render?downloadimage=true', params, {
        responseType: 'arraybuffer'
      });
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      console.error('Error downloading rendered sprite:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Renders a sprite and automatically uploads it to Supabase storage if not already present.
   * @param {Object} params - Render parameters.
   * @param {string} filename - Target filename in the storage bucket.
   * @returns {Promise<string>} - The public URL of the uploaded sprite.
   */
  async getOrUploadSprite(params, filename) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized. Provide supabaseUrl and supabaseKey in constructor.');
    }

    // 1. Check if file already exists in storage
    const { data: fileData } = await this.supabase.storage
      .from(this.storageBucket)
      .list('', { search: filename });

    if (fileData && fileData.length > 0) {
      const { data } = this.supabase.storage
        .from(this.storageBucket)
        .getPublicUrl(filename);
      return data.publicUrl;
    }

    // 2. If not, render it
    console.log(`Sprite ${filename} not found in storage. Rendering...`);
    const imageBuffer = await this.renderAndDownload(params);

    // 3. Upload to Supabase
    const { error: uploadError } = await this.supabase.storage
      .from(this.storageBucket)
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // 4. Return public URL
    const { data } = this.supabase.storage
      .from(this.storageBucket)
      .getPublicUrl(filename);
    return data.publicUrl;
  }
}

module.exports = ZRendererClient;
