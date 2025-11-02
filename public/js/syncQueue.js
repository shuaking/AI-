/**
 * Sync Queue Manager for AI Workflow Studio
 * 
 * Manages offline operation queue with persistence, retries, and conflict detection.
 */

(function(window) {
    'use strict';

    const QUEUE_STORAGE_KEY = 'syncQueue';
    const MAX_QUEUE_SIZE = 100;
    const MAX_RETRIES = 3;

    /**
     * Get queue from localStorage
     */
    function getQueue() {
        try {
            const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('[SyncQueue] Failed to read queue:', error);
            return [];
        }
    }

    /**
     * Save queue to localStorage
     */
    function saveQueue(queue) {
        try {
            localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
            return true;
        } catch (error) {
            console.error('[SyncQueue] Failed to save queue:', error);
            return false;
        }
    }

    /**
     * Add operation to queue
     * @param {Object} operation - { resource, action, payload, id }
     * @returns {Object} - { success, queuedOperation }
     */
    function enqueue(operation) {
        const queue = getQueue();

        if (queue.length >= MAX_QUEUE_SIZE) {
            console.warn('[SyncQueue] Queue is full, removing oldest operation');
            queue.shift();
        }

        const queuedOp = {
            id: operation.id || generateId(),
            resource: operation.resource,
            action: operation.action,
            payload: operation.payload,
            timestamp: new Date().toISOString(),
            retries: 0
        };

        queue.push(queuedOp);
        
        if (saveQueue(queue)) {
            console.log('[SyncQueue] Enqueued operation:', queuedOp);
            return { success: true, queuedOperation: queuedOp };
        }

        return { success: false, error: 'Failed to save queue' };
    }

    /**
     * Remove operation from queue
     */
    function dequeue(operationId) {
        const queue = getQueue();
        const index = queue.findIndex(op => op.id === operationId);
        
        if (index === -1) {
            return { success: false, error: 'Operation not found' };
        }

        queue.splice(index, 1);
        saveQueue(queue);
        
        console.log('[SyncQueue] Dequeued operation:', operationId);
        return { success: true };
    }

    /**
     * Get all pending operations
     */
    function getPending() {
        return getQueue();
    }

    /**
     * Clear entire queue
     */
    function clear() {
        localStorage.removeItem(QUEUE_STORAGE_KEY);
        console.log('[SyncQueue] Queue cleared');
        return { success: true };
    }

    /**
     * Get operations count
     */
    function size() {
        return getQueue().length;
    }

    /**
     * Check if operation matches resource/id
     */
    function findConflicts(resource, resourceId) {
        const queue = getQueue();
        return queue.filter(op => {
            if (op.resource !== resource) return false;
            
            if (resourceId && op.payload) {
                if (op.payload.id === resourceId) return true;
                if (op.action === 'delete' && op.payload === resourceId) return true;
            }
            
            return false;
        });
    }

    /**
     * Increment retry count for an operation
     */
    function incrementRetry(operationId) {
        const queue = getQueue();
        const op = queue.find(op => op.id === operationId);
        
        if (!op) {
            return { success: false, error: 'Operation not found' };
        }

        op.retries++;
        op.lastRetry = new Date().toISOString();

        if (op.retries > MAX_RETRIES) {
            console.error('[SyncQueue] Operation exceeded max retries:', op);
            return { success: false, maxRetriesExceeded: true, operation: op };
        }

        saveQueue(queue);
        return { success: true, retries: op.retries };
    }

    /**
     * Get operations that exceeded max retries
     */
    function getFailedOperations() {
        const queue = getQueue();
        return queue.filter(op => op.retries > MAX_RETRIES);
    }

    /**
     * Remove failed operations (exceeded max retries)
     */
    function removeFailedOperations() {
        const queue = getQueue();
        const failed = queue.filter(op => op.retries > MAX_RETRIES);
        const cleaned = queue.filter(op => op.retries <= MAX_RETRIES);
        
        saveQueue(cleaned);
        
        console.log(`[SyncQueue] Removed ${failed.length} failed operations`);
        return { success: true, removed: failed };
    }

    /**
     * Generate unique ID for operations
     */
    function generateId() {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Export sync queue API
    const syncQueue = {
        enqueue,
        dequeue,
        getPending,
        clear,
        size,
        findConflicts,
        incrementRetry,
        getFailedOperations,
        removeFailedOperations,
        MAX_QUEUE_SIZE,
        MAX_RETRIES
    };

    // Expose to window
    window.syncQueue = syncQueue;

    console.log('✅ Sync Queue loaded');

})(window);
