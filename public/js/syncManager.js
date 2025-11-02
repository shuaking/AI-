/**
 * Sync Manager Module
 * Manages real-time synchronization with Socket.IO and offline queue
 */

class SyncManager {
  constructor(apiClient, socketURL = '') {
    this.apiClient = apiClient;
    this.socketURL = socketURL;
    this.socket = null;
    this.isConnected = false;
    this.offlineQueue = [];
    this.listeners = new Map();
    this.syncStatus = 'disconnected'; // disconnected, connecting, connected, syncing, offline
    this.lastSyncTime = null;
    
    // Load offline queue from localStorage
    this.loadOfflineQueue();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /**
   * Initialize Socket.IO connection
   */
  connect() {
    if (this.socket) {
      console.warn('[SyncManager] Already connected');
      return;
    }

    try {
      this.updateSyncStatus('connecting');
      this.socket = io(this.socketURL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity
      });

      this.socket.on('connect', () => this.handleConnect());
      this.socket.on('disconnect', (reason) => this.handleDisconnect(reason));
      this.socket.on('error', (error) => this.handleError(error));
      
      // Listen for data update events
      this.socket.on('workflows:updated', (data) => this.handleServerUpdate('workflows', data));
      this.socket.on('roles:updated', (data) => this.handleServerUpdate('roles', data));
      this.socket.on('prompts:updated', (data) => this.handleServerUpdate('prompts', data));
      this.socket.on('settings:updated', (data) => this.handleServerUpdate('settings', data));
      
      console.log('[SyncManager] Socket.IO initialized');
    } catch (error) {
      console.error('[SyncManager] Failed to initialize Socket.IO:', error);
      this.updateSyncStatus('offline');
    }
  }

  /**
   * Disconnect Socket.IO
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.updateSyncStatus('disconnected');
      console.log('[SyncManager] Disconnected');
    }
  }

  /**
   * Handle Socket.IO connection
   */
  handleConnect() {
    console.log('[SyncManager] Connected to server');
    this.isConnected = true;
    this.updateSyncStatus('connected');
    
    // Flush offline queue
    this.flushOfflineQueue();
    
    // Notify listeners
    this.emit('connected');
  }

  /**
   * Handle Socket.IO disconnection
   */
  handleDisconnect(reason) {
    console.log('[SyncManager] Disconnected:', reason);
    this.isConnected = false;
    this.updateSyncStatus(navigator.onLine ? 'disconnected' : 'offline');
    this.emit('disconnected', reason);
  }

  /**
   * Handle Socket.IO error
   */
  handleError(error) {
    console.error('[SyncManager] Socket.IO error:', error);
    this.emit('error', error);
  }

  /**
   * Handle server data updates
   */
  handleServerUpdate(type, data) {
    console.log(`[SyncManager] Received ${type} update from server`, data);
    this.emit(`${type}:updated`, data);
    this.lastSyncTime = Date.now();
  }

  /**
   * Handle online event
   */
  handleOnline() {
    console.log('[SyncManager] Connection restored');
    this.updateSyncStatus('connected');
    
    // Reconnect Socket.IO if disconnected
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
    
    // Flush offline queue
    this.flushOfflineQueue();
    
    this.emit('online');
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    console.log('[SyncManager] Connection lost');
    this.updateSyncStatus('offline');
    this.emit('offline');
  }

  /**
   * Queue an operation for later execution
   */
  queueOperation(operation) {
    console.log('[SyncManager] Queueing operation:', operation);
    this.offlineQueue.push({
      ...operation,
      timestamp: Date.now()
    });
    this.saveOfflineQueue();
  }

  /**
   * Flush the offline queue
   */
  async flushOfflineQueue() {
    if (this.offlineQueue.length === 0) {
      return;
    }

    console.log(`[SyncManager] Flushing ${this.offlineQueue.length} queued operations`);
    this.updateSyncStatus('syncing');

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    this.saveOfflineQueue();

    for (const operation of queue) {
      try {
        await this.executeOperation(operation);
        console.log('[SyncManager] Queued operation executed:', operation);
      } catch (error) {
        console.error('[SyncManager] Failed to execute queued operation:', error);
        // Re-queue failed operations
        this.offlineQueue.push(operation);
      }
    }

    this.saveOfflineQueue();
    this.updateSyncStatus('connected');
    this.emit('sync:complete');
  }

  /**
   * Execute a queued operation
   */
  async executeOperation(operation) {
    const { type, method, id, data } = operation;

    switch (type) {
      case 'workflows':
        if (method === 'create') return this.apiClient.createWorkflow(id, data);
        if (method === 'update') return this.apiClient.updateWorkflow(id, data);
        if (method === 'delete') return this.apiClient.deleteWorkflow(id);
        break;
      case 'roles':
        if (method === 'create') return this.apiClient.createRole(data);
        if (method === 'update') return this.apiClient.updateRole(id, data);
        if (method === 'delete') return this.apiClient.deleteRole(id);
        break;
      case 'prompts':
        if (method === 'create') return this.apiClient.createPrompt(data);
        if (method === 'update') return this.apiClient.updatePrompt(id, data);
        if (method === 'delete') return this.apiClient.deletePrompt(id);
        break;
      case 'settings':
        if (method === 'updateVariables') return this.apiClient.updateVariables(data);
        if (method === 'updateVariable') return this.apiClient.updateVariable(id, data);
        if (method === 'deleteVariable') return this.apiClient.deleteVariable(id);
        if (method === 'updateApiConfigs') return this.apiClient.updateApiConfigs(data);
        if (method === 'updateApiConfig') return this.apiClient.updateApiConfig(id, data);
        if (method === 'deleteApiConfig') return this.apiClient.deleteApiConfig(id);
        break;
    }
  }

  /**
   * Save offline queue to localStorage
   */
  saveOfflineQueue() {
    try {
      localStorage.setItem('syncOfflineQueue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('[SyncManager] Failed to save offline queue:', error);
    }
  }

  /**
   * Load offline queue from localStorage
   */
  loadOfflineQueue() {
    try {
      const saved = localStorage.getItem('syncOfflineQueue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
        console.log(`[SyncManager] Loaded ${this.offlineQueue.length} queued operations from storage`);
      }
    } catch (error) {
      console.error('[SyncManager] Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  /**
   * Update sync status and notify listeners
   */
  updateSyncStatus(status) {
    if (this.syncStatus !== status) {
      this.syncStatus = status;
      console.log(`[SyncManager] Status changed: ${status}`);
      this.emit('status:changed', status);
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[SyncManager] Error in listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get current sync status
   */
  getStatus() {
    return {
      status: this.syncStatus,
      isConnected: this.isConnected,
      isOnline: navigator.onLine,
      queuedOperations: this.offlineQueue.length,
      lastSyncTime: this.lastSyncTime
    };
  }
}

// Export for use in other modules
window.SyncManager = SyncManager;
