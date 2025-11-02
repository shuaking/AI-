/**
 * API Client Module
 * Handles all communication with the backend REST API
 * Includes error handling, retry logic, and offline detection
 */

class ApiClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.timeout = 10000;
  }

  /**
   * Check if the browser is online
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Make a fetch request with timeout
   */
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Make an API request with retry logic
   */
  async request(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await this.fetchWithTimeout(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          success: false,
          error: 'Request Failed',
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Check if we should retry
      if (retryCount < this.maxRetries && this.isOnline()) {
        console.warn(`[ApiClient] Request failed, retrying (${retryCount + 1}/${this.maxRetries})...`);
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.request(endpoint, options, retryCount + 1);
      }

      // If offline, throw a specific error
      if (!this.isOnline()) {
        throw new Error('OFFLINE: No internet connection');
      }

      throw error;
    }
  }

  /**
   * Delay helper for retries
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }

  // Workflows API
  async getWorkflows() {
    return this.request('/workflows');
  }

  async getWorkflow(id) {
    return this.request(`/workflows/${id}`);
  }

  async createWorkflow(id, workflow) {
    return this.request('/workflows', {
      method: 'POST',
      body: JSON.stringify({ id, ...workflow })
    });
  }

  async updateWorkflow(id, workflow) {
    return this.request(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow)
    });
  }

  async deleteWorkflow(id) {
    return this.request(`/workflows/${id}`, {
      method: 'DELETE'
    });
  }

  // Roles API
  async getRoles() {
    return this.request('/roles');
  }

  async getRole(id) {
    return this.request(`/roles/${id}`);
  }

  async createRole(role) {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(role)
    });
  }

  async updateRole(id, role) {
    return this.request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(role)
    });
  }

  async deleteRole(id) {
    return this.request(`/roles/${id}`, {
      method: 'DELETE'
    });
  }

  // Prompts API
  async getPrompts() {
    return this.request('/prompts');
  }

  async getPrompt(id) {
    return this.request(`/prompts/${id}`);
  }

  async createPrompt(prompt) {
    return this.request('/prompts', {
      method: 'POST',
      body: JSON.stringify(prompt)
    });
  }

  async updatePrompt(id, prompt) {
    return this.request(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(prompt)
    });
  }

  async deletePrompt(id) {
    return this.request(`/prompts/${id}`, {
      method: 'DELETE'
    });
  }

  // Settings API
  async getSettings() {
    return this.request('/settings');
  }

  async getVariables() {
    return this.request('/settings/variables');
  }

  async getVariable(key) {
    return this.request(`/settings/variables/${key}`);
  }

  async updateVariables(variables) {
    return this.request('/settings/variables', {
      method: 'PUT',
      body: JSON.stringify(variables)
    });
  }

  async updateVariable(key, value) {
    return this.request(`/settings/variables/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
  }

  async deleteVariable(key) {
    return this.request(`/settings/variables/${key}`, {
      method: 'DELETE'
    });
  }

  async getApiConfigs() {
    return this.request('/settings/api-configs');
  }

  async getApiConfig(name) {
    return this.request(`/settings/api-configs/${name}`);
  }

  async updateApiConfigs(configs) {
    return this.request('/settings/api-configs', {
      method: 'PUT',
      body: JSON.stringify(configs)
    });
  }

  async updateApiConfig(name, config) {
    return this.request(`/settings/api-configs/${name}`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  async deleteApiConfig(name) {
    return this.request(`/settings/api-configs/${name}`, {
      method: 'DELETE'
    });
  }
}

// Export for use in other modules
window.ApiClient = ApiClient;
