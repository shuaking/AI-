# Split Deploy Implementation Summary

This document describes the implementation of front/back separation support for the AI Workflow Studio.

## Overview

The split deploy feature allows the static frontend to be deployed separately from the backend API server. This enables hosting the frontend on platforms like Vercel or Netlify while running the backend on any Node.js hosting platform.

## Architecture

```
Frontend (Static)           Backend (Node.js + Express)
├── HTML/CSS/JS       ────▶ ├── REST API
├── runtime-config.js       ├── Socket.IO
└── Assets                  └── JSON Storage
```

## Implementation Details

### 1. Configuration Generation Script

**File**: `scripts/generate-config.js`

A Node.js script that generates runtime configuration for the frontend:

- Reads `PUBLIC_API_URL` and `PUBLIC_SOCKET_URL` from environment variables
- Creates `public/runtime-config.js` with `window.APP_CONFIG` object
- Provides sensible defaults (same-origin) when env vars are not set
- Executable via `npm run build:frontend`

**Key Features**:
- Auto-generates configuration based on environment
- Provides clear console output for debugging
- Handles missing environment gracefully

### 2. Frontend Configuration Loading

**File**: `public/index.html`

Modified to load runtime configuration before application scripts:

1. **Inline Fallback**: Sets default `window.APP_CONFIG` for development
2. **Runtime Config Load**: Loads generated `runtime-config.js` with error handling
3. **Script Order**: Ensures config loads before apiClient.js and socketClient.js

```html
<script>
    // Inline fallback for development
    if (typeof window.APP_CONFIG === 'undefined') {
        window.APP_CONFIG = {
            apiBaseUrl: window.location.origin,
            socketUrl: window.location.origin
        };
    }
</script>
<script src="/runtime-config.js" onerror="..."></script>
```

### 3. API Client Refactoring

**File**: `public/js/apiClient.js`

Refactored to read API base URL from runtime configuration:

```javascript
const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.apiBaseUrl !== 'window.location.origin') 
    ? window.APP_CONFIG.apiBaseUrl 
    : window.location.origin;
```

**Features**:
- Backward-compatible with same-origin mode
- Console logging for debugging
- Maintains all existing functionality

### 4. Socket.IO Client Refactoring

**File**: `public/js/socketClient.js`

Updated to use Socket.IO URL from runtime configuration:

```javascript
const SOCKET_URL = (window.APP_CONFIG && window.APP_CONFIG.socketUrl !== 'window.location.origin') 
    ? window.APP_CONFIG.socketUrl 
    : undefined;
```

**Features**:
- Connects to separate Socket.IO server when configured
- Falls back to same-origin for local development
- Logs connection URL for debugging

### 5. Backend CORS Configuration

**File**: `server/config.js`

Enhanced with comprehensive CORS support:

- **`parseCorsOrigins()`**: Parses comma-separated origins into arrays
- **`CORS_ORIGINS`**: Main CORS configuration for REST API
- **`SOCKET_ALLOWED_ORIGINS`**: Separate Socket.IO CORS config
- **Methods**: Includes GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Supports Content-Type and Authorization

**Environment Variables**:
- `CORS_ORIGINS`: Comma-separated list of allowed frontend domains
- `SOCKET_ALLOWED_ORIGINS`: Optional, defaults to CORS_ORIGINS
- Backward compatible with `CORS_ORIGIN` (single origin)

**Example**:
```javascript
CORS_ORIGINS="https://app.vercel.app,https://app.netlify.app"
```

### 6. Socket.IO Server Configuration

**File**: `server/index.js`

Updated to use Socket.IO-specific CORS configuration:

```javascript
const io = new Server(server, {
  cors: config.socketIO.cors,
  // ... other options
});
```

### 7. Deployment Configuration Files

#### Vercel Configuration

**File**: `vercel.json`

- Build command: `npm run build:frontend`
- Output directory: `public`
- Environment variables: `PUBLIC_API_URL`, `PUBLIC_SOCKET_URL`
- SPA routing: Rewrites all routes to `/index.html`
- Security headers included

#### Netlify Configuration

**File**: `netlify.toml`

- Build command: `npm run build:frontend`
- Publish directory: `public`
- SPA redirects configured
- CORS headers for WebSocket support
- Cache control for static assets
- Security headers

### 8. Git Configuration

**File**: `.gitignore`

Added `public/runtime-config.js` to exclude generated configuration from version control.

### 9. Environment Configuration Template

**File**: `.env.example`

Provides template for all environment variables:
- Backend server configuration
- CORS origins
- Frontend build configuration

### 10. Validation Script

**File**: `scripts/validate-split-deploy.js`

Comprehensive validation of split deployment setup:

- Checks all required files exist
- Verifies configuration in each file
- Tests runtime config generation
- Provides clear pass/fail output

**Usage**: `npm run validate:deploy`

### 11. Documentation

#### README.md Updates

Added comprehensive "Front/Back Separation" section covering:
- Architecture overview
- Step-by-step deployment guide
- Configuration examples
- Troubleshooting common issues
- Security best practices

#### DEPLOYMENT.md

New comprehensive deployment guide with:
- Backend deployment instructions
- Frontend deployment for Vercel and Netlify
- Testing procedures
- Security best practices
- Cost estimation
- Monitoring recommendations

#### QUICK_START.md

Quick reference guide for:
- Local development
- Split deployment commands
- Verification checklist
- Common issues

## npm Scripts

Added to `package.json`:

```json
{
  "scripts": {
    "build:frontend": "node scripts/generate-config.js",
    "validate:deploy": "node scripts/validate-split-deploy.js"
  }
}
```

## Configuration Flow

### Development (Same-Origin)

1. No environment variables needed
2. No `runtime-config.js` generation needed
3. Inline fallback provides same-origin defaults
4. Frontend and backend run on same domain

### Production (Split Deploy)

1. **Backend**: Set `CORS_ORIGINS` with frontend domain(s)
2. **Frontend Build**: Set `PUBLIC_API_URL` and `PUBLIC_SOCKET_URL`
3. **Generate Config**: Run `npm run build:frontend`
4. **Deploy**: Frontend to Vercel/Netlify, backend to any Node.js host
5. **Verify**: Check console logs and Socket.IO connection

## Security Considerations

1. **CORS**: Strict origin validation prevents unauthorized access
2. **No Wildcard in Production**: `CORS_ORIGINS="*"` should only be used in development
3. **HTTPS Required**: Production deployments should use HTTPS
4. **Environment Variables**: Sensitive config never hardcoded
5. **Generated Files**: `runtime-config.js` not committed to version control

## Backward Compatibility

All changes are backward compatible:

- Existing same-origin deployments work without changes
- No breaking changes to existing APIs
- Fallback behavior ensures graceful degradation
- Development workflow unchanged

## Testing

Validation script tests:
1. ✓ Package.json scripts configured
2. ✓ Generation script exists and works
3. ✓ HTML loads runtime config with fallback
4. ✓ API client reads from APP_CONFIG
5. ✓ Socket client reads from APP_CONFIG
6. ✓ Server config handles CORS correctly
7. ✓ Deployment configs exist
8. ✓ Gitignore configured correctly
9. ✓ Config generation with env vars

## Benefits

1. **Scalability**: Frontend and backend can scale independently
2. **Cost Efficiency**: Use free tiers for static hosting
3. **Performance**: CDN distribution for static assets
4. **Flexibility**: Deploy frontend and backend to different platforms
5. **Development**: Same codebase works for both modes

## Future Enhancements

Potential improvements:
- [ ] Add support for multiple API endpoints (e.g., auth, data)
- [ ] Implement API key management
- [ ] Add deployment health checks
- [ ] Support for different environments (staging, production)
- [ ] Automated deployment scripts
- [ ] Docker container support
- [ ] Kubernetes deployment configs

## Support

For issues or questions:
1. Check validation: `npm run validate:deploy`
2. Review logs: Backend server logs and browser console
3. Verify CORS: Check CORS headers with curl
4. Test connectivity: Use browser DevTools Network tab
5. Consult documentation: README.md and DEPLOYMENT.md
