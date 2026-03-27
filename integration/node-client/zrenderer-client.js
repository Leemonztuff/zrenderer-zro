/**
 * ZRendererClient - A Node.js client for the zrenderer service.
 * This client provides a wrapper around the zrenderer API to facilitate
 * rendering Ragnarok Online sprites in game applications.
 */
class ZRendererClient {
  /**
   * @param {string} baseUrl - The base URL of the zrenderer service (e.g., 'http://localhost:11011')
   * @param {string} accessToken - The access token for authentication
   */
  constructor(baseUrl, accessToken) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  /**
   * Helper to perform a POST request to the /render endpoint
   * @param {Object} params - The rendering parameters (job, action, frame, etc.)
   * @param {boolean} downloadImage - If true, returns the raw image data (Blob/Buffer)
   * @returns {Promise<Object|Response>}
   */
  async render(params, downloadImage = false) {
    const url = new URL(`${this.baseUrl}/render`);
    if (downloadImage) {
      url.searchParams.append('downloadimage', 'true');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-accesstoken': this.accessToken
      },
      body: JSON.stringify({
        ...params,
        // Ensure job is always an array as expected by the API
        job: Array.isArray(params.job) ? params.job.map(String) : [String(params.job)]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ statusMessage: 'Unknown error' }));
      throw new Error(`zrenderer error: ${response.status} - ${errorData.statusMessage}`);
    }

    return downloadImage ? response : response.json();
  }

  /**
   * Get the full URL for a render request (useful for <img> src or Three.js loaders)
   * Note: This usually requires the server to be configured to allow GET or use query param auth
   * @param {Object} params - The rendering parameters
   * @returns {string}
   */
  getRenderUrl(params) {
    const url = new URL(`${this.baseUrl}/render`);
    url.searchParams.append('downloadimage', 'true');
    url.searchParams.append('accesstoken', this.accessToken);

    // Note: zrenderer 1.3 usually expects JSON POST, but this helper can be
    // used if the server logic is extended or for local dev proxies.
    // For full compatibility with the current zrenderer, it's better to fetch and use ObjectURLs.
    return url.toString();
  }

  /**
   * Get health information from the service
   */
  async getHealth() {
    const response = await fetch(`${this.baseUrl}/admin/health`, {
      headers: { 'x-accesstoken': this.accessToken }
    });
    if (!response.ok) throw new Error('Could not fetch health');
    return response.json();
  }
}

module.exports = ZRendererClient;
