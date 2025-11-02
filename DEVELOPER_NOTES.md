# Developer Notes

## Quick Start

```bash
# Install dependencies
npm install

# Development mode (with hot-reload)
npm run dev

# Production mode
npm start
```

## Server Architecture

### Configuration
The server configuration is centralized in `server/config.js`:
- **Port**: Default 3000, configurable via `PORT` environment variable
- **Host**: Default 0.0.0.0, configurable via `HOST` environment variable
- **CORS**: Enabled by default for all origins (configurable via `CORS_ORIGIN`)
- **Socket.IO**: Configured with 60s ping timeout and 25s ping interval

### Endpoints

#### Health Check
```bash
curl http://localhost:3000/health
```
Returns:
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T03:20:11.835Z",
  "uptime": 11.936272436
}
```

### Socket.IO

The server logs all connection and disconnection events:
- Connection: Shows client ID and IP address
- Disconnection: Shows client ID and reason
- Errors: Logs any socket errors

Example log output:
```
[Socket.IO] Client connected: cUG_2KZAH7Ju5owAAAAB from 127.0.0.1
[Socket.IO] Client disconnected: cUG_2KZAH7Ju5owAAAAB, reason: client namespace disconnect
```

### Graceful Shutdown

The server handles `SIGTERM` and `SIGINT` signals gracefully, closing all connections before exiting.

## Frontend Integration

The frontend is served from the `public` directory.

### Data Loading Strategy

The application now uses a hybrid data-loading approach:

1. **Primary Source**: REST API endpoints (`/api/workflows`, `/api/roles`, `/api/prompts`, `/api/settings`)
2. **Cache Layer**: localStorage serves as a fallback and offline cache
3. **Initialization Flow**:
   - On page load, the app attempts to fetch data from the REST API
   - If successful, data is cached in localStorage and merged into the app state
   - If the API is unreachable (network error or server down), the app falls back to cached localStorage data
   - If both fail, the app uses hardcoded defaults

### API Client Module

Located at `public/js/apiClient.js`, this module provides:

- **`apiClient.getWorkflows()`** - Fetch workflows from API or cache
- **`apiClient.saveWorkflows(workflows)`** - Save workflows to API (future)
- **`apiClient.getRoles()`** - Fetch roles from API or cache
- **`apiClient.saveRoles(roles)`** - Save roles to API (future)
- **`apiClient.getPrompts()`** - Fetch prompts from API or cache
- **`apiClient.savePrompts(prompts)`** - Save prompts to API (future)
- **`apiClient.getSettings()`** - Fetch settings (variables, API configs) from API or cache
- **`apiClient.saveSettings(settings)`** - Save settings to API
- **`apiClient.isOnline()`** - Check if browser is online
- **`apiClient.request(url, options)`** - Low-level HTTP request with retry

Features:
- Automatic retry (1 attempt) on network errors
- Request timeout (10 seconds default)
- Online/offline detection
- Consistent error handling
- localStorage caching for offline support

Usage example:
```javascript
// Data is loaded automatically on page initialization
// To manually save data:
window.apiClient.saveSettings({
  globalVariables: { myVar: 'value' },
  customApiConfigs: { myApi: {...} }
});
```

### Socket.IO Integration

To connect to Socket.IO from the frontend:

```javascript
const socket = io();

socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

## Development Tips

1. **Hot Reload**: Use `npm run dev` for automatic server restart on code changes
2. **Environment Variables**: Create a `.env` file for local configuration (already in .gitignore)
3. **Logs**: Server logs to stdout, redirect as needed for production deployment
4. **CORS**: Update `CORS_ORIGIN` in production to restrict allowed origins

## Testing

### Manual Testing
```bash
# Start the server
npm start

# In another terminal, test the health endpoint
curl http://localhost:3000/health

# Test the main page
curl http://localhost:3000/
```

### Socket.IO Testing
Use the browser console or a Socket.IO client library to test real-time communication.

## Next Steps

Future enhancements could include:
- Authentication/authorization middleware
- API routes for workflow management
- Database integration for persistence
- Redis adapter for Socket.IO horizontal scaling
- Rate limiting and security headers
- Logging middleware (Morgan, Winston, etc.)
- API documentation (Swagger/OpenAPI)
