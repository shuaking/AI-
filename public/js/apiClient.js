/**
 * API Client for AI Workflow Studio
 * 
 * Handles communication with the REST backend for workflows, roles, prompts, and settings.
 * Provides fallback to localStorage when offline or on error.
 */

(function(window) {
    'use strict';

    const API_BASE_URL = window.location.origin;
    const API_PREFIX = '/api';
    const REQUEST_TIMEOUT = 10000; // 10 seconds
    const RETRY_ATTEMPTS = 1;
    const RETRY_DELAY = 1000; // 1 second

    // Cache keys for localStorage
    const CACHE_KEYS = {
        WORKFLOWS: 'workflowsCache',
        ROLES: 'rolesCache',
        PROMPTS: 'promptsCache',
        SETTINGS: 'settingsCache'
    };

    /**
     * Check if the browser is online
     */
    function isOnline() {
        return navigator.onLine;
    }

    /**
     * Make an HTTP request with timeout
     */
    async function request(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || REQUEST_TIMEOUT);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('请求超时');
            }
            
            throw error;
        }
    }

    /**
     * Retry wrapper for requests
     */
    async function requestWithRetry(url, options = {}, attempts = RETRY_ATTEMPTS) {
        let lastError;

        for (let i = 0; i <= attempts; i++) {
            try {
                return await request(url, options);
            } catch (error) {
                lastError = error;
                
                if (i < attempts) {
                    await sleep(RETRY_DELAY);
                }
            }
        }

        throw lastError;
    }

    /**
     * Sleep utility
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get data from localStorage cache
     */
    function getFromCache(cacheKey) {
        try {
            const cached = localStorage.getItem(cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error(`[ApiClient] Failed to read cache ${cacheKey}:`, error);
            return null;
        }
    }

    /**
     * Save data to localStorage cache
     */
    function saveToCache(cacheKey, data) {
        try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (error) {
            console.error(`[ApiClient] Failed to save cache ${cacheKey}:`, error);
        }
    }

    /**
     * Get workflows from API or cache
     */
    async function getWorkflows() {
        if (!isOnline()) {
            console.warn('[ApiClient] Offline: using cached workflows');
            return getFromCache(CACHE_KEYS.WORKFLOWS) || {};
        }

        try {
            const response = await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/workflows`);
            
            if (response.success && response.data) {
                saveToCache(CACHE_KEYS.WORKFLOWS, response.data);
                return response.data;
            }
            
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('[ApiClient] Failed to fetch workflows:', error);
            const cached = getFromCache(CACHE_KEYS.WORKFLOWS);
            
            if (cached) {
                console.warn('[ApiClient] Using cached workflows after error');
                return cached;
            }
            
            return {};
        }
    }

    /**
     * Save workflows to API
     */
    async function saveWorkflows(workflows) {
        saveToCache(CACHE_KEYS.WORKFLOWS, workflows);

        if (!isOnline()) {
            console.warn('[ApiClient] Offline: workflows saved to cache only');
            return { success: true, offline: true };
        }

        try {
            // Note: This requires PUT endpoints for bulk updates
            // For now, just cache locally
            console.warn('[ApiClient] Bulk workflow save not yet implemented on backend');
            return { success: true, cached: true };
        } catch (error) {
            console.error('[ApiClient] Failed to save workflows:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get roles from API or cache
     */
    async function getRoles() {
        if (!isOnline()) {
            console.warn('[ApiClient] Offline: using cached roles');
            return getFromCache(CACHE_KEYS.ROLES) || [];
        }

        try {
            const response = await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/roles`);
            
            if (response.success && response.data) {
                saveToCache(CACHE_KEYS.ROLES, response.data);
                return response.data;
            }
            
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('[ApiClient] Failed to fetch roles:', error);
            const cached = getFromCache(CACHE_KEYS.ROLES);
            
            if (cached) {
                console.warn('[ApiClient] Using cached roles after error');
                return cached;
            }
            
            return [];
        }
    }

    /**
     * Save roles to API
     */
    async function saveRoles(roles) {
        saveToCache(CACHE_KEYS.ROLES, roles);

        if (!isOnline()) {
            console.warn('[ApiClient] Offline: roles saved to cache only');
            return { success: true, offline: true };
        }

        try {
            console.warn('[ApiClient] Bulk role save not yet implemented on backend');
            return { success: true, cached: true };
        } catch (error) {
            console.error('[ApiClient] Failed to save roles:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get prompts from API or cache
     */
    async function getPrompts() {
        if (!isOnline()) {
            console.warn('[ApiClient] Offline: using cached prompts');
            return getFromCache(CACHE_KEYS.PROMPTS) || [];
        }

        try {
            const response = await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/prompts`);
            
            if (response.success && response.data) {
                saveToCache(CACHE_KEYS.PROMPTS, response.data);
                return response.data;
            }
            
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('[ApiClient] Failed to fetch prompts:', error);
            const cached = getFromCache(CACHE_KEYS.PROMPTS);
            
            if (cached) {
                console.warn('[ApiClient] Using cached prompts after error');
                return cached;
            }
            
            return [];
        }
    }

    /**
     * Save prompts to API
     */
    async function savePrompts(prompts) {
        saveToCache(CACHE_KEYS.PROMPTS, prompts);

        if (!isOnline()) {
            console.warn('[ApiClient] Offline: prompts saved to cache only');
            return { success: true, offline: true };
        }

        try {
            console.warn('[ApiClient] Bulk prompt save not yet implemented on backend');
            return { success: true, cached: true };
        } catch (error) {
            console.error('[ApiClient] Failed to save prompts:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get settings from API or cache
     */
    async function getSettings() {
        if (!isOnline()) {
            console.warn('[ApiClient] Offline: using cached settings');
            return getFromCache(CACHE_KEYS.SETTINGS) || { globalVariables: {}, customApiConfigs: {} };
        }

        try {
            const response = await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/settings`);
            
            if (response.success && response.data) {
                saveToCache(CACHE_KEYS.SETTINGS, response.data);
                return response.data;
            }
            
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('[ApiClient] Failed to fetch settings:', error);
            const cached = getFromCache(CACHE_KEYS.SETTINGS);
            
            if (cached) {
                console.warn('[ApiClient] Using cached settings after error');
                return cached;
            }
            
            return { globalVariables: {}, customApiConfigs: {} };
        }
    }

    /**
     * Save settings to API
     */
    async function saveSettings(settings) {
        saveToCache(CACHE_KEYS.SETTINGS, settings);

        if (!isOnline()) {
            console.warn('[ApiClient] Offline: settings saved to cache only');
            return { success: true, offline: true };
        }

        try {
            // Save variables
            if (settings.globalVariables) {
                await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/settings/variables`, {
                    method: 'PUT',
                    body: JSON.stringify(settings.globalVariables)
                });
            }

            // Save API configs
            if (settings.customApiConfigs) {
                await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/settings/api-configs`, {
                    method: 'PUT',
                    body: JSON.stringify(settings.customApiConfigs)
                });
            }

            return { success: true };
        } catch (error) {
            console.error('[ApiClient] Failed to save settings:', error);
            return { success: false, error: error.message };
        }
    }

    // Export API client
    const apiClient = {
        getWorkflows,
        saveWorkflows,
        getRoles,
        saveRoles,
        getPrompts,
        savePrompts,
        getSettings,
        saveSettings,
        isOnline,
        request: requestWithRetry
    };

    // Expose to window
    window.apiClient = apiClient;

    console.log('✅ API Client loaded');

})(window);
