/**
 * Client for interacting with zrenderer API and Supabase Storage.
 */
class ZRendererClient {
  /**
   * @param {Object} options
   * @param {string} options.zrendererUrl - URL of the zrenderer service (e.g., http://localhost:11011)
   * @param {string} options.accessToken - Access token for zrenderer
   * @param {Object} [options.supabase] - Supabase configuration
   * @param {string} options.supabase.url - Supabase project URL
   * @param {string} options.supabase.key - Supabase anon/service_role key
   * @param {string} options.supabase.bucket - Supabase Storage bucket name
   */
  constructor({ zrendererUrl, accessToken, supabase }) {
    this.zrendererUrl = zrendererUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
    this.supabase = supabase;
  }

  /**
   * Request a sprite render from zrenderer.
   * @param {Object} params - Render parameters (see API spec)
   * @returns {Promise<Buffer>} - The rendered image buffer
   */
  async render(params) {
    const response = await fetch(`${this.zrendererUrl}/render?downloadimage=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-accesstoken': this.accessToken
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ statusMessage: 'Unknown error' }));
      throw new Error(`zrenderer error: ${error.statusMessage || response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Upload a buffer to Supabase Storage.
   * @param {Buffer} buffer - Image data
   * @param {string} path - Target path in the bucket
   * @returns {Promise<string>} - The public URL of the uploaded file
   */
  async uploadToSupabase(buffer, path) {
    if (!this.supabase) throw new Error('Supabase configuration is missing');

    const { url, key, bucket } = this.supabase;
    const storageUrl = `${url}/storage/v1/object/${bucket}/${path}`;

    const response = await fetch(storageUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'image/png',
        'x-upsert': 'true'
      },
      body: buffer
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Supabase error: ${error.message || response.statusText}`);
    }

    return `${url}/storage/v1/object/public/${bucket}/${path}`;
  }

  /**
   * Helper to get a sprite, upload it to Supabase and return the URL.
   * Useful for caching assets.
   */
  async getPersistentSpriteUrl(params, storagePath) {
    const buffer = await this.render(params);
    return await this.uploadToSupabase(buffer, storagePath);
  }
}

module.exports = ZRendererClient;
