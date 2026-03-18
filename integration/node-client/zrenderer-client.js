/**
 * ZRendererClient - Node.js Client for zrenderer API
 *
 * Facilitates rendering requests from a Node.js backend.
 */
class ZRendererClient {
  /**
   * @param {string} baseUrl - The URL where zrenderer is running (e.g., http://localhost:11011)
   * @param {string} accessToken - The access token for the renderer
   */
  constructor(baseUrl, accessToken) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  /**
   * Request a sprite render
   * @param {Object} options - Rendering options (job, action, frame, etc.)
   * @returns {Promise<Object>} - The render response containing output paths
   */
  async render(options) {
    // Ensure job is an array of strings as required by the DTO
    if (options.job && !Array.isArray(options.job)) {
      options.job = [String(options.job)];
    } else if (options.job) {
      options.job = options.job.map(String);
    }

    const response = await fetch(`${this.baseUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-accesstoken': this.accessToken
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ statusMessage: 'Unknown error' }));
      throw new Error(`ZRenderer Error: ${error.statusMessage || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Helper to get a direct image URL for a character configuration
   * @param {Object} options - Rendering options
   * @returns {string} - The URL to use in an <img> tag or Three.js texture
   */
  getRenderUrl(options) {
    const queryParams = {
      ...options,
      downloadimage: 'true',
      accesstoken: this.accessToken // Can also be passed via query param
    };

    // Ensure job is correctly formatted for query params
    if (queryParams.job && Array.isArray(queryParams.job)) {
      queryParams.job = queryParams.job.join(',');
    }

    const params = new URLSearchParams(queryParams);

    // Note: Most complex options should be sent via POST /render?downloadimage=true
    // but the API supports some via query if implemented.
    // For full RO sprites, it's recommended to use POST and handle the returned path or direct download.
    return `${this.baseUrl}/render?${params.toString()}`;
  }
}

module.exports = ZRendererClient;
