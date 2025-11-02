# Socket Client Testing Guide

This document describes how to test the Socket.IO client integration.

## What Was Implemented

1. **Socket.IO Client Library Integration**
   - Added `<script src="/socket.io/socket.io.js"></script>` to `index.html`
   - Socket.IO server automatically serves this file

2. **Socket Client Module** (`public/js/socketClient.js`)
   - Connects to root namespace (`/`) on page load
   - Exposes `window.socketClient` API
   - Handles connection lifecycle events (connect, disconnect, reconnect, connect_error)
   - Registers listeners for resource update events (workflows:updated, roles:updated, prompts:updated, settings:updated)
   - All events are logged to the browser console with timestamps

3. **UI Status Indicator**
   - Visual indicator in top-right corner of the page
   - Shows connection status with color-coded states:
     - **Green (● Online)**: Connected to server
     - **Yellow (◐ Connecting)**: Attempting initial connection
     - **Orange (◷ Reconnecting)**: Attempting to reconnect
     - **Red (● Offline)**: Disconnected or connection error

4. **Graceful Degradation**
   - If Socket.IO library is unavailable, the module logs an error and shows offline status
   - No uncaught errors or broken functionality
   - Existing app functionality remains intact

## Manual Testing Steps

### Test 1: Normal Connection

1. Start the server:
   ```bash
   npm start
   ```

2. Open browser to `http://localhost:3000`

3. Open browser DevTools console (F12)

4. Expected console output:
   ```
   [SocketClient] [timestamp] INIT: Socket.IO client initialized { namespace: '/', ... }
   [SocketClient] [timestamp] CONNECT: Connected with socket ID: abc123...
   ```

5. Expected UI: Status indicator in top-right shows **● Online** in green

### Test 2: Server Disconnect/Reconnect

1. With the browser still open, stop the server:
   ```bash
   # Press Ctrl+C in the terminal where server is running
   ```

2. Expected console output:
   ```
   [SocketClient] [timestamp] DISCONNECT: Disconnected. Reason: transport close
   ```

3. Expected UI: Status indicator shows **● Offline** in red

4. Restart the server:
   ```bash
   npm start
   ```

5. Expected: Client automatically reconnects within a few seconds

6. Expected console output:
   ```
   [SocketClient] [timestamp] RECONNECT: Reconnected after N attempts
   [SocketClient] [timestamp] CONNECT: Connected with socket ID: xyz456...
   ```

7. Expected UI: Status indicator shows **● Online** in green again

### Test 3: Connection Error Handling

1. Start browser without server running

2. Open `http://localhost:3000` (will fail to load)

3. Start the server, then refresh the page

4. Expected: Client connects successfully and shows online status

### Test 4: Event Listeners (Resource Updates)

Currently, the backend routes don't emit socket events yet. To test event listeners:

1. Open browser console

2. Manually emit test events from another browser console tab or using server-side code:
   ```javascript
   // In browser console (if you have access to socket internals)
   socketClient.getSocket().emit('test')
   ```

3. Or test by adding temporary emit statements in the server routes

**Expected Future Behavior:**
When backend routes are updated to emit events (e.g., `io.emit('workflows:updated', data)`), the client will log:
```
[SocketClient] [timestamp] EVENT: workflows:updated received { ... data ... }
```

### Test 5: Graceful Degradation

1. Comment out the Socket.IO script tag in index.html temporarily:
   ```html
   <!-- <script src="/socket.io/socket.io.js"></script> -->
   ```

2. Reload the page

3. Expected console output:
   ```
   [SocketClient] [timestamp] ERROR: Socket.IO client library not loaded
   ```

4. Expected UI: Status indicator shows **● Offline**

5. Expected: No uncaught errors, app continues to function normally

### Test 6: Existing Functionality

1. Verify all existing features work correctly:
   - Workflow tab functionality
   - Role management
   - Prompt library
   - API configuration
   - Chat interface
   - All buttons and interactions

2. Expected: No regressions, everything works as before

## API Reference

### `window.socketClient`

The global API exposed by the socket client module:

```javascript
// Get current connection status
socketClient.getStatus()  // Returns: 'connected', 'connecting', 'reconnecting', 'disconnected', 'error'

// Check if connected
socketClient.isConnected()  // Returns: boolean

// Get raw socket instance
socketClient.getSocket()  // Returns: socket.io client instance or null

// Register custom event listener
socketClient.on('custom:event', (data) => {
    console.log('Custom event:', data);
});

// Emit custom event (only when connected)
socketClient.emit('custom:event', { some: 'data' });

// Manually disconnect
socketClient.disconnect();

// Manually connect
socketClient.connect();
```

## Console Log Examples

### Successful Connection Flow
```
[SocketClient] [2025-11-02T13:00:00.123Z] INIT: Socket.IO client initialized { namespace: '/', reconnectionAttempts: 5, reconnectionDelay: 1000 }
[SocketClient] [2025-11-02T13:00:00.234Z] CONNECT: Connected with socket ID: abc123def456
```

### Reconnection Flow
```
[SocketClient] [2025-11-02T13:05:00.123Z] DISCONNECT: Disconnected. Reason: transport close
[SocketClient] [2025-11-02T13:05:01.234Z] RECONNECT_ATTEMPT: Reconnection attempt 1
[SocketClient] [2025-11-02T13:05:02.345Z] RECONNECT_ATTEMPT: Reconnection attempt 2
[SocketClient] [2025-11-02T13:05:03.456Z] RECONNECT: Reconnected after 2 attempts
[SocketClient] [2025-11-02T13:05:03.567Z] CONNECT: Connected with socket ID: xyz789ghi012
```

### Resource Update Events
```
[SocketClient] [2025-11-02T13:10:00.123Z] EVENT: workflows:updated received { id: 'workflow-1', action: 'update', ... }
[SocketClient] [2025-11-02T13:10:05.234Z] EVENT: roles:updated received { id: 'role-1', action: 'create', ... }
[SocketClient] [2025-11-02T13:10:10.345Z] EVENT: prompts:updated received { id: 'prompt-1', action: 'delete', ... }
[SocketClient] [2025-11-02T13:10:15.456Z] EVENT: settings:updated received { type: 'variables', ... }
```

## Server Logs

When clients connect, the server logs:
```
[Socket.IO] Client connected: abc123def456 from ::ffff:127.0.0.1
[Socket.IO] Client disconnected: abc123def456, reason: client namespace disconnect
```

## Architecture Notes

- **No State Mutations**: The client only logs events; it doesn't modify app state
- **Defensive Design**: Gracefully handles missing Socket.IO library
- **Automatic Cleanup**: Disconnects on page unload
- **Reconnection Strategy**: 5 attempts with 1-second delay between attempts
- **Transport Fallback**: WebSocket preferred, polling as fallback

## Next Steps

For future tickets, the backend routes can be enhanced to emit socket events:

```javascript
// Example: In routes/workflows.js
const io = req.app.get('io');  // Get io instance
io.emit('workflows:updated', { 
  id, 
  action: 'update', 
  data: workflow 
});
```

Then the frontend client will automatically log these events and can later be enhanced to update the UI in real-time.
