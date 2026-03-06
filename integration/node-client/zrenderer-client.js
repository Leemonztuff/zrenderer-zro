/**
 * Client for interacting with zrenderer API and optionally Supabase Storage.
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
   * @param {Object} config - Render parameters
   * @param {boolean} downloadImage - Whether to return the raw PNG data
   * @returns {Promise<Response>} - The response from the renderer
   */
  async render(config, downloadImage = true) {
    const url = new URL(`${this.zrendererUrl}/render`);
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
   * Upload data to Supabase Storage.
   * @param {ArrayBuffer|Buffer|Blob} data - Image data
   * @param {string} path - Target path in the bucket
   * @returns {Promise<string>} - The public URL of the uploaded file
   */
  async uploadToSupabase(data, path) {
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
      body: data
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
  async getPersistentSpriteUrl(config, storagePath) {
    const response = await this.render(config, true);
    const arrayBuffer = await response.arrayBuffer();
    return await this.uploadToSupabase(arrayBuffer, storagePath);
  }

  /**
   * Gets the health status of the service.
   * @returns {Promise<Object>}
   */
  async getHealth() {
    const response = await fetch(`${this.zrendererUrl}/admin/health`, {
        headers: {
            'x-accesstoken': this.accessToken
        }
    });
    return await response.json();
  }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZRendererClient;
}
