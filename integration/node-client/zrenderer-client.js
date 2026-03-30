/**
 * Client for interacting with the zrenderer service in Node.js environments.
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
   * Renders a sprite based on the provided parameters.
   * @param {Object} params - The rendering parameters
   * @returns {Promise<Object>} The response from the renderer
   */
  async render(params) {
    const formattedParams = {
      ...params,
      // Ensure job is an array of strings as required by the backend
      job: Array.isArray(params.job) ? params.job.map(String) : [String(params.job)]
    };

    const response = await fetch(`${this.baseUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-accesstoken': this.accessToken
      },
      body: JSON.stringify(formattedParams)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`zrenderer error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Gets a direct URL to a rendered image.
   * Useful for React/frontend applications.
   * @param {Object} params - Rendering parameters
   * @returns {string} The direct URL
   */
  /**
   * Gets a direct URL to a rendered image.
   * Note: The zrenderer API primarily uses POST for complex configurations.
   * This helper is useful if your parameters are simple enough for a GET request
   * or if you are using a proxy that handles the transformation.
   * @param {Object} params - Rendering parameters
   * @returns {string} The direct URL
   */
  getRenderUrl(params) {
    const queryParams = new URLSearchParams();
    queryParams.append('downloadimage', 'true');

    if (params.job) {
      const jobStr = Array.isArray(params.job) ? params.job.join(',') : String(params.job);
      queryParams.append('job', jobStr);
    }

    // Add other simple params if present
    const simpleParams = ['action', 'frame', 'gender', 'head', 'outfit', 'garment', 'weapon', 'shield'];
    simpleParams.forEach(p => {
      if (params[p] !== undefined) queryParams.append(p, params[p]);
    });

    return `${this.baseUrl}/render?${queryParams.toString()}`;
  }

  /**
   * Fetches the rendered sprite as a Blob (useful for Three.js textures).
   * @param {Object} params - Rendering parameters
   * @returns {Promise<Blob>}
   */
  async fetchSpriteBlob(params) {
    const formattedParams = {
      ...params,
      job: Array.isArray(params.job) ? params.job.map(String) : [String(params.job)]
    };

    const response = await fetch(`${this.baseUrl}/render?downloadimage=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-accesstoken': this.accessToken
      },
      body: JSON.stringify(formattedParams)
    });

    if (!response.ok) {
      throw new Error(`zrenderer error (${response.status})`);
    }

    return response.blob();
  }
}

module.exports = ZRendererClient;
