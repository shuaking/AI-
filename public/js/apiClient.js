/**
 * API Client for AI Workflow Studio
 * 
 * Handles communication with the REST backend for workflows, roles, prompts, and settings.
 * Provides fallback to localStorage when offline or on error.
 */

(function(window) {
    'use strict';

    // Get API base URL from runtime config, fallback to same-origin
    const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.apiBaseUrl !== 'window.location.origin') 
        ? window.APP_CONFIG.apiBaseUrl 
        : window.location.origin;
    const API_PREFIX = '/api';
    const REQUEST_TIMEOUT = 10000; // 10 seconds
    const RETRY_ATTEMPTS = 1;
    const RETRY_DELAY = 1000; // 1 second

    console.log('[ApiClient] Initialized with API base URL:', API_BASE_URL);

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
     * Save workflows to API (bulk update - for backward compatibility)
     */
    async function saveWorkflows(workflows) {
        saveToCache(CACHE_KEYS.WORKFLOWS, workflows);
        console.warn('[ApiClient] Bulk workflow save - use createWorkflow/updateWorkflow instead');
        return { success: true, cached: true };
    }

    /**
     * Create a new workflow
     */
    async function createWorkflow(workflow) {
        saveToCache(CACHE_KEYS.WORKFLOWS, { ...getFromCache(CACHE_KEYS.WORKFLOWS), [workflow.id]: workflow });

        if (!isOnline()) {
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'workflows',
                    action: 'create',
                    payload: workflow
                });
            }
            return { success: true, offline: true, queued: true };
        }

        try {
            const response = await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/workflows`, {
                method: 'POST',
                body: JSON.stringify(workflow)
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('[ApiClient] Failed to create workflow:', error);
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'workflows',
                    action: 'create',
                    payload: workflow
                });
            }
            return { success: false, error: error.message, queued: true };
        }
    }

    /**
     * Update an existing workflow
     */
    async function updateWorkflow(id, workflow) {
        const workflows = getFromCache(CACHE_KEYS.WORKFLOWS) || {};
        workflows[id] = workflow;
        saveToCache(CACHE_KEYS.WORKFLOWS, workflows);

        if (!isOnline()) {
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'workflows',
                    action: 'update',
                    payload: { ...workflow, id }
                });
            }
            return { success: true, offline: true, queued: true };
        }

        try {
            const response = await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/workflows/${id}`, {
                method: 'PUT',
                body: JSON.stringify(workflow)
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('[ApiClient] Failed to update workflow:', error);
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'workflows',
                    action: 'update',
                    payload: { ...workflow, id }
                });
            }
            return { success: false, error: error.message, queued: true };
        }
    }

    /**
     * Delete a workflow
     */
    async function deleteWorkflow(id) {
        const workflows = getFromCache(CACHE_KEYS.WORKFLOWS) || {};
        delete workflows[id];
        saveToCache(CACHE_KEYS.WORKFLOWS, workflows);

        if (!isOnline()) {
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'workflows',
                    action: 'delete',
                    payload: id
                });
            }
            return { success: true, offline: true, queued: true };
        }

        try {
            await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/workflows/${id}`, {
                method: 'DELETE'
            });
            return { success: true };
        } catch (error) {
            console.error('[ApiClient] Failed to delete workflow:', error);
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'workflows',
                    action: 'delete',
                    payload: id
                });
            }
            return { success: false, error: error.message, queued: true };
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
     * Save roles to API (bulk update - for backward compatibility)
     */
    async function saveRoles(roles) {
        saveToCache(CACHE_KEYS.ROLES, roles);
        console.warn('[ApiClient] Bulk role save - use createRole/updateRole instead');
        return { success: true, cached: true };
    }

    /**
     * Create a new role
     */
    async function createRole(role) {
        const roles = getFromCache(CACHE_KEYS.ROLES) || [];
        roles.push(role);
        saveToCache(CACHE_KEYS.ROLES, roles);

        if (!isOnline()) {
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'roles',
                    action: 'create',
                    payload: role
                });
            }
            return { success: true, offline: true, queued: true };
        }

        try {
            const response = await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/roles`, {
                method: 'POST',
                body: JSON.stringify(role)
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('[ApiClient] Failed to create role:', error);
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'roles',
                    action: 'create',
                    payload: role
                });
            }
            return { success: false, error: error.message, queued: true };
        }
    }

    /**
     * Update an existing role
     */
    async function updateRole(id, role) {
        const roles = getFromCache(CACHE_KEYS.ROLES) || [];
        const index = roles.findIndex(r => r.id === id);
        if (index !== -1) {
            roles[index] = { ...role, id };
            saveToCache(CACHE_KEYS.ROLES, roles);
        }

        if (!isOnline()) {
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'roles',
                    action: 'update',
                    payload: { ...role, id }
                });
            }
            return { success: true, offline: true, queued: true };
        }

        try {
            const response = await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/roles/${id}`, {
                method: 'PUT',
                body: JSON.stringify(role)
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('[ApiClient] Failed to update role:', error);
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'roles',
                    action: 'update',
                    payload: { ...role, id }
                });
            }
            return { success: false, error: error.message, queued: true };
        }
    }

    /**
     * Delete a role
     */
    async function deleteRole(id) {
        const roles = getFromCache(CACHE_KEYS.ROLES) || [];
        const filtered = roles.filter(r => r.id !== id);
        saveToCache(CACHE_KEYS.ROLES, filtered);

        if (!isOnline()) {
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'roles',
                    action: 'delete',
                    payload: id
                });
            }
            return { success: true, offline: true, queued: true };
        }

        try {
            await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/roles/${id}`, {
                method: 'DELETE'
            });
            return { success: true };
        } catch (error) {
            console.error('[ApiClient] Failed to delete role:', error);
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'roles',
                    action: 'delete',
                    payload: id
                });
            }
            return { success: false, error: error.message, queued: true };
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
     * Save prompts to API (bulk update - for backward compatibility)
     */
    async function savePrompts(prompts) {
        saveToCache(CACHE_KEYS.PROMPTS, prompts);
        console.warn('[ApiClient] Bulk prompt save - use createPrompt/updatePrompt instead');
        return { success: true, cached: true };
    }

    /**
     * Create a new prompt
     */
    async function createPrompt(prompt) {
        const prompts = getFromCache(CACHE_KEYS.PROMPTS) || [];
        prompts.push(prompt);
        saveToCache(CACHE_KEYS.PROMPTS, prompts);

        if (!isOnline()) {
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'prompts',
                    action: 'create',
                    payload: prompt
                });
            }
            return { success: true, offline: true, queued: true };
        }

        try {
            const response = await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/prompts`, {
                method: 'POST',
                body: JSON.stringify(prompt)
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('[ApiClient] Failed to create prompt:', error);
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'prompts',
                    action: 'create',
                    payload: prompt
                });
            }
            return { success: false, error: error.message, queued: true };
        }
    }

    /**
     * Update an existing prompt
     */
    async function updatePrompt(id, prompt) {
        const prompts = getFromCache(CACHE_KEYS.PROMPTS) || [];
        const index = prompts.findIndex(p => p.id === id);
        if (index !== -1) {
            prompts[index] = { ...prompt, id };
            saveToCache(CACHE_KEYS.PROMPTS, prompts);
        }

        if (!isOnline()) {
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'prompts',
                    action: 'update',
                    payload: { ...prompt, id }
                });
            }
            return { success: true, offline: true, queued: true };
        }

        try {
            const response = await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/prompts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(prompt)
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('[ApiClient] Failed to update prompt:', error);
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'prompts',
                    action: 'update',
                    payload: { ...prompt, id }
                });
            }
            return { success: false, error: error.message, queued: true };
        }
    }

    /**
     * Delete a prompt
     */
    async function deletePrompt(id) {
        const prompts = getFromCache(CACHE_KEYS.PROMPTS) || [];
        const filtered = prompts.filter(p => p.id !== id);
        saveToCache(CACHE_KEYS.PROMPTS, filtered);

        if (!isOnline()) {
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'prompts',
                    action: 'delete',
                    payload: id
                });
            }
            return { success: true, offline: true, queued: true };
        }

        try {
            await requestWithRetry(`${API_BASE_URL}${API_PREFIX}/prompts/${id}`, {
                method: 'DELETE'
            });
            return { success: true };
        } catch (error) {
            console.error('[ApiClient] Failed to delete prompt:', error);
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'prompts',
                    action: 'delete',
                    payload: id
                });
            }
            return { success: false, error: error.message, queued: true };
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
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'settings',
                    action: 'update',
                    payload: settings
                });
            }
            return { success: true, offline: true, queued: true };
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
            if (window.syncQueue) {
                window.syncQueue.enqueue({
                    resource: 'settings',
                    action: 'update',
                    payload: settings
                });
            }
            return { success: false, error: error.message, queued: true };
        }
    }

    // Export API client
    const apiClient = {
        getWorkflows,
        saveWorkflows,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        getRoles,
        saveRoles,
        createRole,
        updateRole,
        deleteRole,
        getPrompts,
        savePrompts,
        createPrompt,
        updatePrompt,
        deletePrompt,
        getSettings,
        saveSettings,
        isOnline,
        request: requestWithRetry
    };

    // Expose to window
    window.apiClient = apiClient;

    console.log('✅ API Client loaded');

})(window);
