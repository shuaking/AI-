(function() {
    'use strict';

    const DEFAULT_NAMESPACE = '/';
    const RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 1000;

    let socket = null;
    let connectionStatus = 'disconnected';
    let statusIndicator = null;
    let reconnectAttempts = 0;

    function log(type, message, data) {
        const prefix = '[SocketClient]';
        const timestamp = new Date().toISOString();
        
        if (data) {
            console.log(`${prefix} [${timestamp}] ${type}: ${message}`, data);
        } else {
            console.log(`${prefix} [${timestamp}] ${type}: ${message}`);
        }
    }

    function updateStatus(status) {
        connectionStatus = status;
        updateIndicator();
    }

    function updateIndicator() {
        if (!statusIndicator) {
            statusIndicator = document.getElementById('socketStatusIndicator');
        }

        if (!statusIndicator) return;

        statusIndicator.className = 'socket-status-indicator';
        
        switch (connectionStatus) {
            case 'connected':
                statusIndicator.classList.add('connected');
                statusIndicator.textContent = '● Online';
                statusIndicator.title = 'Connected to server';
                break;
            case 'connecting':
                statusIndicator.classList.add('connecting');
                statusIndicator.textContent = '◐ Connecting';
                statusIndicator.title = 'Connecting to server...';
                break;
            case 'reconnecting':
                statusIndicator.classList.add('reconnecting');
                statusIndicator.textContent = `◷ Reconnecting (${reconnectAttempts}/${RECONNECT_ATTEMPTS})`;
                statusIndicator.title = `Reconnection attempt ${reconnectAttempts} of ${RECONNECT_ATTEMPTS}`;
                break;
            case 'disconnected':
            case 'error':
            default:
                statusIndicator.classList.add('disconnected');
                statusIndicator.textContent = '● Offline';
                statusIndicator.title = 'Disconnected from server';
                break;
        }
    }

    function setupEventListeners() {
        if (!socket) return;

        socket.on('connect', () => {
            log('CONNECT', `Connected with socket ID: ${socket.id}`);
            reconnectAttempts = 0;
            updateStatus('connected');
        });

        socket.on('disconnect', (reason) => {
            log('DISCONNECT', `Disconnected. Reason: ${reason}`);
            updateStatus('disconnected');
        });

        socket.on('reconnect', (attemptNumber) => {
            log('RECONNECT', `Reconnected after ${attemptNumber} attempts`);
            reconnectAttempts = 0;
            updateStatus('connected');
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
            reconnectAttempts = attemptNumber;
            log('RECONNECT_ATTEMPT', `Reconnection attempt ${attemptNumber}`);
            updateStatus('reconnecting');
        });

        socket.on('reconnect_error', (error) => {
            log('RECONNECT_ERROR', 'Reconnection error', error.message || error);
        });

        socket.on('reconnect_failed', () => {
            log('RECONNECT_FAILED', 'Reconnection failed after maximum attempts');
            updateStatus('error');
        });

        socket.on('connect_error', (error) => {
            log('CONNECT_ERROR', 'Connection error', error.message || error);
            updateStatus('error');
        });

        socket.on('workflows:updated', (data) => {
            log('EVENT', 'workflows:updated received', data);
        });

        socket.on('roles:updated', (data) => {
            log('EVENT', 'roles:updated received', data);
        });

        socket.on('prompts:updated', (data) => {
            log('EVENT', 'prompts:updated received', data);
        });

        socket.on('settings:updated', (data) => {
            log('EVENT', 'settings:updated received', data);
        });
    }

    function connect() {
        if (typeof io === 'undefined') {
            log('ERROR', 'Socket.IO client library not loaded');
            updateStatus('error');
            return false;
        }

        try {
            updateStatus('connecting');
            
            socket = io(DEFAULT_NAMESPACE, {
                reconnection: true,
                reconnectionAttempts: RECONNECT_ATTEMPTS,
                reconnectionDelay: RECONNECT_DELAY,
                timeout: 10000,
                transports: ['websocket', 'polling']
            });

            setupEventListeners();
            
            log('INIT', 'Socket.IO client initialized', {
                namespace: DEFAULT_NAMESPACE,
                reconnectionAttempts: RECONNECT_ATTEMPTS,
                reconnectionDelay: RECONNECT_DELAY
            });

            return true;
        } catch (error) {
            log('ERROR', 'Failed to initialize socket connection', error.message || error);
            updateStatus('error');
            return false;
        }
    }

    function disconnect() {
        if (socket) {
            log('INFO', 'Manually disconnecting socket');
            socket.disconnect();
            socket = null;
        }
    }

    function cleanup() {
        log('INFO', 'Cleaning up socket client');
        disconnect();
    }

    const socketClient = {
        connect,
        disconnect,
        getStatus: () => connectionStatus,
        isConnected: () => connectionStatus === 'connected',
        getSocket: () => socket,
        
        on: (event, callback) => {
            if (!socket) {
                log('WARN', `Cannot register listener for "${event}": socket not initialized`);
                return;
            }
            socket.on(event, callback);
        },
        
        emit: (event, data) => {
            if (!socket || !socketClient.isConnected()) {
                log('WARN', `Cannot emit "${event}": socket not connected`);
                return false;
            }
            socket.emit(event, data);
            return true;
        }
    };

    if (typeof window !== 'undefined') {
        window.socketClient = socketClient;
        
        window.addEventListener('beforeunload', cleanup);
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    connect();
                }, 100);
            });
        } else {
            setTimeout(() => {
                connect();
            }, 100);
        }
    }
})();
