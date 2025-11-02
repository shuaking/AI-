/**
 * Sync Manager for AI Workflow Studio
 * 
 * Manages queue flushing, conflict resolution, and socket event consumption.
 */

(function(window) {
    'use strict';

    let isFlushingQueue = false;
    let syncStatusCallback = null;
    let onlineStatusCallback = null;

    /**
     * Register sync status callback
     */
    function onSyncStatusChange(callback) {
        syncStatusCallback = callback;
    }

    /**
     * Register online status callback
     */
    function onOnlineStatusChange(callback) {
        onlineStatusCallback = callback;
    }

    /**
     * Update sync status
     */
    function updateSyncStatus(status, details = {}) {
        console.log('[SyncManager] Status:', status, details);
        if (syncStatusCallback) {
            syncStatusCallback(status, details);
        }
    }

    /**
     * Flush queue - replay all pending operations
     */
    async function flushQueue() {
        if (!window.apiClient || !window.syncQueue) {
            console.warn('[SyncManager] Dependencies not loaded');
            return { success: false, error: 'Dependencies missing' };
        }

        if (isFlushingQueue) {
            console.log('[SyncManager] Queue flush already in progress');
            return { success: false, error: 'Flush in progress' };
        }

        if (!window.apiClient.isOnline()) {
            console.log('[SyncManager] Cannot flush queue while offline');
            return { success: false, error: 'Offline' };
        }

        const pending = window.syncQueue.getPending();
        
        if (pending.length === 0) {
            console.log('[SyncManager] No pending operations to flush');
            return { success: true, processed: 0 };
        }

        isFlushingQueue = true;
        updateSyncStatus('syncing', { queueSize: pending.length });

        let processed = 0;
        let failed = 0;
        const errors = [];

        for (const operation of pending) {
            try {
                const result = await executeOperation(operation);
                
                if (result.success) {
                    window.syncQueue.dequeue(operation.id);
                    processed++;
                    console.log('[SyncManager] Operation completed:', operation.id);
                } else {
                    const retryResult = window.syncQueue.incrementRetry(operation.id);
                    
                    if (retryResult.maxRetriesExceeded) {
                        console.error('[SyncManager] Operation failed after max retries:', operation);
                        errors.push({
                            operation,
                            error: result.error || 'Max retries exceeded'
                        });
                        failed++;
                    }
                }
            } catch (error) {
                console.error('[SyncManager] Error executing operation:', operation, error);
                window.syncQueue.incrementRetry(operation.id);
                errors.push({ operation, error: error.message });
                failed++;
            }
        }

        window.syncQueue.removeFailedOperations();

        isFlushingQueue = false;
        
        const remainingSize = window.syncQueue.size();
        if (remainingSize === 0) {
            updateSyncStatus('synced');
        } else {
            updateSyncStatus('offline', { queueSize: remainingSize });
        }

        const result = {
            success: true,
            processed,
            failed,
            errors,
            remainingQueueSize: remainingSize
        };

        console.log('[SyncManager] Queue flush completed:', result);
        return result;
    }

    /**
     * Execute a single queued operation
     */
    async function executeOperation(operation) {
        const { resource, action, payload } = operation;

        try {
            switch (resource) {
                case 'workflows':
                    return await executeWorkflowOperation(action, payload);
                case 'roles':
                    return await executeRoleOperation(action, payload);
                case 'prompts':
                    return await executePromptOperation(action, payload);
                case 'settings':
                    return await executeSettingsOperation(action, payload);
                default:
                    throw new Error(`Unknown resource: ${resource}`);
            }
        } catch (error) {
            console.error('[SyncManager] Operation execution failed:', error);
            return { success: false, error: error.message };
        }
    }

    async function executeWorkflowOperation(action, payload) {
        switch (action) {
            case 'create':
                return await window.apiClient.createWorkflow(payload);
            case 'update':
                return await window.apiClient.updateWorkflow(payload.id, payload);
            case 'delete':
                return await window.apiClient.deleteWorkflow(payload);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    async function executeRoleOperation(action, payload) {
        switch (action) {
            case 'create':
                return await window.apiClient.createRole(payload);
            case 'update':
                return await window.apiClient.updateRole(payload.id, payload);
            case 'delete':
                return await window.apiClient.deleteRole(payload);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    async function executePromptOperation(action, payload) {
        switch (action) {
            case 'create':
                return await window.apiClient.createPrompt(payload);
            case 'update':
                return await window.apiClient.updatePrompt(payload.id, payload);
            case 'delete':
                return await window.apiClient.deletePrompt(payload);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    async function executeSettingsOperation(action, payload) {
        if (action === 'update') {
            return await window.apiClient.saveSettings(payload);
        }
        throw new Error(`Unknown action: ${action}`);
    }

    /**
     * Handle socket event - apply remote changes
     */
    function handleSocketEvent(resource, eventData) {
        if (!eventData || !eventData.data) {
            console.warn('[SyncManager] Invalid event data for', resource);
            return;
        }

        const { data, timestamp } = eventData;
        console.log('[SyncManager] Handling socket event:', resource, timestamp);

        const conflicts = checkForConflicts(resource, data);
        
        if (conflicts.length > 0) {
            console.warn('[SyncManager] Conflicts detected:', conflicts);
            updateSyncStatus('conflict', { conflicts, resource });
            
            handleConflicts(resource, data, conflicts, timestamp);
        } else {
            applyRemoteUpdate(resource, data);
        }
    }

    /**
     * Check for conflicts with queued operations
     */
    function checkForConflicts(resource, data) {
        if (!window.syncQueue) return [];

        const conflicts = [];
        const pending = window.syncQueue.getPending();

        for (const op of pending) {
            if (op.resource !== resource) continue;

            if (Array.isArray(data)) {
                for (const item of data) {
                    if (matchesOperation(op, item)) {
                        conflicts.push({ operation: op, item });
                    }
                }
            } else {
                if (matchesOperation(op, data)) {
                    conflicts.push({ operation: op, item: data });
                }
            }
        }

        return conflicts;
    }

    /**
     * Check if operation matches data item
     */
    function matchesOperation(operation, item) {
        if (!operation.payload) return false;

        if (operation.action === 'delete') {
            return operation.payload === item.id;
        }

        return operation.payload.id === item.id;
    }

    /**
     * Handle conflicts between local and remote changes
     */
    function handleConflicts(resource, remoteData, conflicts, remoteTimestamp) {
        for (const conflict of conflicts) {
            const localTimestamp = new Date(conflict.operation.timestamp).getTime();
            const remoteTime = new Date(remoteTimestamp).getTime();

            if (localTimestamp > remoteTime) {
                console.log('[SyncManager] Local change is newer, keeping in queue:', conflict.operation.id);
                
                if (window.showNotification) {
                    window.showNotification(
                        `同步冲突: ${resource} - 保留本地更改`,
                        'warning'
                    );
                }
            } else {
                console.log('[SyncManager] Remote change is newer, removing from queue:', conflict.operation.id);
                window.syncQueue.dequeue(conflict.operation.id);
                
                if (window.showNotification) {
                    window.showNotification(
                        `同步冲突: ${resource} - 应用远程更改`,
                        'info'
                    );
                }
            }
        }

        applyRemoteUpdate(resource, remoteData);
    }

    /**
     * Apply remote update to state and cache
     */
    function applyRemoteUpdate(resource, data) {
        console.log('[SyncManager] Applying remote update:', resource);

        const cacheKeys = {
            workflows: 'workflowsCache',
            roles: 'rolesCache',
            prompts: 'promptsCache',
            settings: 'settingsCache'
        };

        const cacheKey = cacheKeys[resource];
        if (!cacheKey) {
            console.warn('[SyncManager] Unknown resource:', resource);
            return;
        }

        try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            console.log('[SyncManager] Updated cache:', cacheKey);

            if (window.state) {
                updateStateFromRemote(resource, data);
            }

            if (window.renderControlPanel) {
                window.renderControlPanel();
            }

            updateSyncStatus('synced');
        } catch (error) {
            console.error('[SyncManager] Failed to apply remote update:', error);
        }
    }

    /**
     * Update app state from remote data
     */
    function updateStateFromRemote(resource, data) {
        switch (resource) {
            case 'workflows':
                if (window.state) window.state.workflows = data;
                break;
            case 'roles':
                if (window.state) window.state.customRoles = data;
                break;
            case 'prompts':
                if (window.state) window.state.customPrompts = data;
                break;
            case 'settings':
                if (window.state && data.globalVariables) {
                    window.state.globalVariables = data.globalVariables;
                }
                if (window.state && data.customApiConfigs) {
                    window.state.customApiConfigs = data.customApiConfigs;
                }
                break;
        }
    }

    /**
     * Setup socket event listeners
     */
    function setupSocketListeners() {
        if (!window.socketClient) {
            console.warn('[SyncManager] Socket client not available');
            return false;
        }

        window.socketClient.on('workflows:updated', (data) => {
            handleSocketEvent('workflows', data);
        });

        window.socketClient.on('roles:updated', (data) => {
            handleSocketEvent('roles', data);
        });

        window.socketClient.on('prompts:updated', (data) => {
            handleSocketEvent('prompts', data);
        });

        window.socketClient.on('settings:updated', (data) => {
            handleSocketEvent('settings', data);
        });

        console.log('[SyncManager] Socket listeners registered');
        return true;
    }

    /**
     * Setup online/offline event listeners
     */
    function setupNetworkListeners() {
        window.addEventListener('online', () => {
            console.log('[SyncManager] Network online - flushing queue');
            if (onlineStatusCallback) {
                onlineStatusCallback(true);
            }
            
            setTimeout(() => {
                flushQueue();
            }, 1000);
        });

        window.addEventListener('offline', () => {
            console.log('[SyncManager] Network offline');
            if (onlineStatusCallback) {
                onlineStatusCallback(false);
            }
            
            const queueSize = window.syncQueue ? window.syncQueue.size() : 0;
            updateSyncStatus('offline', { queueSize });
        });

        console.log('[SyncManager] Network listeners registered');
    }

    /**
     * Initialize sync manager
     */
    function initialize() {
        setupSocketListeners();
        setupNetworkListeners();
        
        const queueSize = window.syncQueue ? window.syncQueue.size() : 0;
        if (queueSize > 0) {
            updateSyncStatus('offline', { queueSize });
            
            if (window.apiClient && window.apiClient.isOnline()) {
                setTimeout(() => {
                    flushQueue();
                }, 2000);
            }
        } else {
            updateSyncStatus('synced');
        }

        console.log('[SyncManager] Initialized');
    }

    // Export sync manager
    const syncManager = {
        initialize,
        flushQueue,
        onSyncStatusChange,
        onOnlineStatusChange,
        handleSocketEvent
    };

    // Expose to window
    window.syncManager = syncManager;

    console.log('✅ Sync Manager loaded');

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initialize, 500);
        });
    } else {
        setTimeout(initialize, 500);
    }

})(window);
