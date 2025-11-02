/**
 * Data Persistence Module
 * Manages hybrid localStorage + API persistence with optimistic updates
 */

class DataPersistence {
  constructor(apiClient, syncManager) {
    this.apiClient = apiClient;
    this.syncManager = syncManager;
    this.localStoragePrefix = 'aiWorkflow_';
  }

  /**
   * Initialize data from server, fallback to localStorage
   */
  async initializeData(defaults = {}) {
    console.log('[DataPersistence] Initializing data...');
    
    try {
      // Try to fetch from server
      const [workflowsRes, rolesRes, promptsRes, settingsRes] = await Promise.all([
        this.apiClient.getWorkflows().catch(e => ({ success: false, error: e })),
        this.apiClient.getRoles().catch(e => ({ success: false, error: e })),
        this.apiClient.getPrompts().catch(e => ({ success: false, error: e })),
        this.apiClient.getSettings().catch(e => ({ success: false, error: e }))
      ]);

      const data = {
        workflows: workflowsRes.success ? workflowsRes.data : null,
        roles: rolesRes.success ? rolesRes.data : null,
        prompts: promptsRes.success ? promptsRes.data : null,
        settings: settingsRes.success ? settingsRes.data : null
      };

      // If server data is available, cache it
      if (data.workflows) this.cacheToLocalStorage('workflows', data.workflows);
      if (data.roles) this.cacheToLocalStorage('roles', data.roles);
      if (data.prompts) this.cacheToLocalStorage('prompts', data.prompts);
      if (data.settings) this.cacheToLocalStorage('settings', data.settings);

      // Merge with defaults
      const result = {
        workflows: data.workflows || this.getFromLocalStorage('workflows') || defaults.workflows || {},
        roles: data.roles || this.getFromLocalStorage('roles') || defaults.roles || [],
        prompts: data.prompts || this.getFromLocalStorage('prompts') || defaults.prompts || [],
        settings: data.settings || this.getFromLocalStorage('settings') || defaults.settings || { variables: {}, apiConfigs: {} }
      };

      console.log('[DataPersistence] Data initialized from server');
      return result;

    } catch (error) {
      console.warn('[DataPersistence] Failed to fetch from server, using localStorage cache:', error);
      
      // Fallback to localStorage
      return {
        workflows: this.getFromLocalStorage('workflows') || defaults.workflows || {},
        roles: this.getFromLocalStorage('roles') || defaults.roles || [],
        prompts: this.getFromLocalStorage('prompts') || defaults.prompts || [],
        settings: this.getFromLocalStorage('settings') || defaults.settings || { variables: {}, apiConfigs: {} }
      };
    }
  }

  /**
   * Save workflows with optimistic update
   */
  async saveWorkflows(workflows) {
    // Optimistic update - save to localStorage immediately
    this.cacheToLocalStorage('workflows', workflows);

    // Try to sync with server
    if (this.apiClient.isOnline()) {
      try {
        // Note: Since workflows is an object, we need to handle individual workflow updates
        // For now, we'll store the entire object in localStorage
        console.log('[DataPersistence] Workflows saved to cache');
        return { success: true, cached: true };
      } catch (error) {
        console.error('[DataPersistence] Failed to sync workflows:', error);
        return { success: false, cached: true, error };
      }
    } else {
      console.log('[DataPersistence] Offline - workflows saved to cache only');
      return { success: true, cached: true, offline: true };
    }
  }

  /**
   * Save a single workflow
   */
  async saveWorkflow(id, workflow, isNew = false) {
    // Optimistic update
    const workflows = this.getFromLocalStorage('workflows') || {};
    workflows[id] = workflow;
    this.cacheToLocalStorage('workflows', workflows);

    // Try to sync with server
    if (this.apiClient.isOnline()) {
      try {
        if (isNew) {
          await this.apiClient.createWorkflow(id, workflow);
        } else {
          await this.apiClient.updateWorkflow(id, workflow);
        }
        console.log(`[DataPersistence] Workflow ${id} synced to server`);
        return { success: true };
      } catch (error) {
        console.error(`[DataPersistence] Failed to sync workflow ${id}:`, error);
        // Queue for later
        this.syncManager.queueOperation({
          type: 'workflows',
          method: isNew ? 'create' : 'update',
          id,
          data: workflow
        });
        return { success: false, queued: true, error };
      }
    } else {
      // Queue for later
      this.syncManager.queueOperation({
        type: 'workflows',
        method: isNew ? 'create' : 'update',
        id,
        data: workflow
      });
      return { success: true, queued: true };
    }
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id) {
    // Optimistic update
    const workflows = this.getFromLocalStorage('workflows') || {};
    delete workflows[id];
    this.cacheToLocalStorage('workflows', workflows);

    // Try to sync with server
    if (this.apiClient.isOnline()) {
      try {
        await this.apiClient.deleteWorkflow(id);
        console.log(`[DataPersistence] Workflow ${id} deleted from server`);
        return { success: true };
      } catch (error) {
        console.error(`[DataPersistence] Failed to delete workflow ${id}:`, error);
        this.syncManager.queueOperation({
          type: 'workflows',
          method: 'delete',
          id
        });
        return { success: false, queued: true, error };
      }
    } else {
      this.syncManager.queueOperation({
        type: 'workflows',
        method: 'delete',
        id
      });
      return { success: true, queued: true };
    }
  }

  /**
   * Save roles
   */
  async saveRoles(roles) {
    this.cacheToLocalStorage('roles', roles);

    if (this.apiClient.isOnline()) {
      try {
        console.log('[DataPersistence] Roles saved to cache');
        return { success: true, cached: true };
      } catch (error) {
        console.error('[DataPersistence] Failed to sync roles:', error);
        return { success: false, cached: true, error };
      }
    } else {
      return { success: true, cached: true, offline: true };
    }
  }

  /**
   * Save a single role
   */
  async saveRole(role, isNew = false) {
    // Optimistic update
    const roles = this.getFromLocalStorage('roles') || [];
    const index = roles.findIndex(r => r.id === role.id);
    if (isNew || index === -1) {
      roles.push(role);
    } else {
      roles[index] = role;
    }
    this.cacheToLocalStorage('roles', roles);

    // Try to sync with server
    if (this.apiClient.isOnline()) {
      try {
        if (isNew) {
          await this.apiClient.createRole(role);
        } else {
          await this.apiClient.updateRole(role.id, role);
        }
        console.log(`[DataPersistence] Role ${role.id} synced to server`);
        return { success: true };
      } catch (error) {
        console.error(`[DataPersistence] Failed to sync role ${role.id}:`, error);
        this.syncManager.queueOperation({
          type: 'roles',
          method: isNew ? 'create' : 'update',
          id: role.id,
          data: role
        });
        return { success: false, queued: true, error };
      }
    } else {
      this.syncManager.queueOperation({
        type: 'roles',
        method: isNew ? 'create' : 'update',
        id: role.id,
        data: role
      });
      return { success: true, queued: true };
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(id) {
    // Optimistic update
    const roles = this.getFromLocalStorage('roles') || [];
    const index = roles.findIndex(r => r.id === id);
    if (index > -1) {
      roles.splice(index, 1);
      this.cacheToLocalStorage('roles', roles);
    }

    // Try to sync with server
    if (this.apiClient.isOnline()) {
      try {
        await this.apiClient.deleteRole(id);
        console.log(`[DataPersistence] Role ${id} deleted from server`);
        return { success: true };
      } catch (error) {
        console.error(`[DataPersistence] Failed to delete role ${id}:`, error);
        this.syncManager.queueOperation({
          type: 'roles',
          method: 'delete',
          id
        });
        return { success: false, queued: true, error };
      }
    } else {
      this.syncManager.queueOperation({
        type: 'roles',
        method: 'delete',
        id
      });
      return { success: true, queued: true };
    }
  }

  /**
   * Save prompts
   */
  async savePrompts(prompts) {
    this.cacheToLocalStorage('prompts', prompts);

    if (this.apiClient.isOnline()) {
      try {
        console.log('[DataPersistence] Prompts saved to cache');
        return { success: true, cached: true };
      } catch (error) {
        console.error('[DataPersistence] Failed to sync prompts:', error);
        return { success: false, cached: true, error };
      }
    } else {
      return { success: true, cached: true, offline: true };
    }
  }

  /**
   * Save a single prompt
   */
  async savePrompt(prompt, isNew = false) {
    // Optimistic update
    const prompts = this.getFromLocalStorage('prompts') || [];
    const index = prompts.findIndex(p => p.id === prompt.id);
    if (isNew || index === -1) {
      prompts.push(prompt);
    } else {
      prompts[index] = prompt;
    }
    this.cacheToLocalStorage('prompts', prompts);

    // Try to sync with server
    if (this.apiClient.isOnline()) {
      try {
        if (isNew) {
          await this.apiClient.createPrompt(prompt);
        } else {
          await this.apiClient.updatePrompt(prompt.id, prompt);
        }
        console.log(`[DataPersistence] Prompt ${prompt.id} synced to server`);
        return { success: true };
      } catch (error) {
        console.error(`[DataPersistence] Failed to sync prompt ${prompt.id}:`, error);
        this.syncManager.queueOperation({
          type: 'prompts',
          method: isNew ? 'create' : 'update',
          id: prompt.id,
          data: prompt
        });
        return { success: false, queued: true, error };
      }
    } else {
      this.syncManager.queueOperation({
        type: 'prompts',
        method: isNew ? 'create' : 'update',
        id: prompt.id,
        data: prompt
      });
      return { success: true, queued: true };
    }
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(id) {
    // Optimistic update
    const prompts = this.getFromLocalStorage('prompts') || [];
    const index = prompts.findIndex(p => p.id === id);
    if (index > -1) {
      prompts.splice(index, 1);
      this.cacheToLocalStorage('prompts', prompts);
    }

    // Try to sync with server
    if (this.apiClient.isOnline()) {
      try {
        await this.apiClient.deletePrompt(id);
        console.log(`[DataPersistence] Prompt ${id} deleted from server`);
        return { success: true };
      } catch (error) {
        console.error(`[DataPersistence] Failed to delete prompt ${id}:`, error);
        this.syncManager.queueOperation({
          type: 'prompts',
          method: 'delete',
          id
        });
        return { success: false, queued: true, error };
      }
    } else {
      this.syncManager.queueOperation({
        type: 'prompts',
        method: 'delete',
        id
      });
      return { success: true, queued: true };
    }
  }

  /**
   * Save settings (variables and API configs)
   */
  async saveSettings(settings) {
    this.cacheToLocalStorage('settings', settings);

    if (this.apiClient.isOnline()) {
      try {
        await this.apiClient.updateVariables(settings.variables || {});
        await this.apiClient.updateApiConfigs(settings.apiConfigs || {});
        console.log('[DataPersistence] Settings synced to server');
        return { success: true };
      } catch (error) {
        console.error('[DataPersistence] Failed to sync settings:', error);
        this.syncManager.queueOperation({
          type: 'settings',
          method: 'updateVariables',
          data: settings.variables
        });
        this.syncManager.queueOperation({
          type: 'settings',
          method: 'updateApiConfigs',
          data: settings.apiConfigs
        });
        return { success: false, queued: true, error };
      }
    } else {
      this.syncManager.queueOperation({
        type: 'settings',
        method: 'updateVariables',
        data: settings.variables
      });
      this.syncManager.queueOperation({
        type: 'settings',
        method: 'updateApiConfigs',
        data: settings.apiConfigs
      });
      return { success: true, queued: true };
    }
  }

  /**
   * Save a single variable
   */
  async saveVariable(key, value) {
    const settings = this.getFromLocalStorage('settings') || { variables: {}, apiConfigs: {} };
    settings.variables[key] = value;
    this.cacheToLocalStorage('settings', settings);

    if (this.apiClient.isOnline()) {
      try {
        await this.apiClient.updateVariable(key, value);
        console.log(`[DataPersistence] Variable ${key} synced to server`);
        return { success: true };
      } catch (error) {
        console.error(`[DataPersistence] Failed to sync variable ${key}:`, error);
        this.syncManager.queueOperation({
          type: 'settings',
          method: 'updateVariable',
          id: key,
          data: value
        });
        return { success: false, queued: true, error };
      }
    } else {
      this.syncManager.queueOperation({
        type: 'settings',
        method: 'updateVariable',
        id: key,
        data: value
      });
      return { success: true, queued: true };
    }
  }

  /**
   * Delete a variable
   */
  async deleteVariable(key) {
    const settings = this.getFromLocalStorage('settings') || { variables: {}, apiConfigs: {} };
    delete settings.variables[key];
    this.cacheToLocalStorage('settings', settings);

    if (this.apiClient.isOnline()) {
      try {
        await this.apiClient.deleteVariable(key);
        console.log(`[DataPersistence] Variable ${key} deleted from server`);
        return { success: true };
      } catch (error) {
        console.error(`[DataPersistence] Failed to delete variable ${key}:`, error);
        this.syncManager.queueOperation({
          type: 'settings',
          method: 'deleteVariable',
          id: key
        });
        return { success: false, queued: true, error };
      }
    } else {
      this.syncManager.queueOperation({
        type: 'settings',
        method: 'deleteVariable',
        id: key
      });
      return { success: true, queued: true };
    }
  }

  /**
   * Save an API config
   */
  async saveApiConfig(name, config) {
    const settings = this.getFromLocalStorage('settings') || { variables: {}, apiConfigs: {} };
    settings.apiConfigs[name] = config;
    this.cacheToLocalStorage('settings', settings);

    if (this.apiClient.isOnline()) {
      try {
        await this.apiClient.updateApiConfig(name, config);
        console.log(`[DataPersistence] API config ${name} synced to server`);
        return { success: true };
      } catch (error) {
        console.error(`[DataPersistence] Failed to sync API config ${name}:`, error);
        this.syncManager.queueOperation({
          type: 'settings',
          method: 'updateApiConfig',
          id: name,
          data: config
        });
        return { success: false, queued: true, error };
      }
    } else {
      this.syncManager.queueOperation({
        type: 'settings',
        method: 'updateApiConfig',
        id: name,
        data: config
      });
      return { success: true, queued: true };
    }
  }

  /**
   * Delete an API config
   */
  async deleteApiConfig(name) {
    const settings = this.getFromLocalStorage('settings') || { variables: {}, apiConfigs: {} };
    delete settings.apiConfigs[name];
    this.cacheToLocalStorage('settings', settings);

    if (this.apiClient.isOnline()) {
      try {
        await this.apiClient.deleteApiConfig(name);
        console.log(`[DataPersistence] API config ${name} deleted from server`);
        return { success: true };
      } catch (error) {
        console.error(`[DataPersistence] Failed to delete API config ${name}:`, error);
        this.syncManager.queueOperation({
          type: 'settings',
          method: 'deleteApiConfig',
          id: name
        });
        return { success: false, queued: true, error };
      }
    } else {
      this.syncManager.queueOperation({
        type: 'settings',
        method: 'deleteApiConfig',
        id: name
      });
      return { success: true, queued: true };
    }
  }

  /**
   * Cache data to localStorage
   */
  cacheToLocalStorage(key, data) {
    try {
      localStorage.setItem(this.localStoragePrefix + key, JSON.stringify(data));
    } catch (error) {
      console.error(`[DataPersistence] Failed to cache ${key} to localStorage:`, error);
    }
  }

  /**
   * Get data from localStorage
   */
  getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(this.localStoragePrefix + key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`[DataPersistence] Failed to get ${key} from localStorage:`, error);
      return null;
    }
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    const keys = ['workflows', 'roles', 'prompts', 'settings'];
    keys.forEach(key => {
      try {
        localStorage.removeItem(this.localStoragePrefix + key);
      } catch (error) {
        console.error(`[DataPersistence] Failed to clear ${key}:`, error);
      }
    });
  }
}

// Export for use in other modules
window.DataPersistence = DataPersistence;
