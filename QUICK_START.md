# Quick Start Guide

## Local Development (Same-Origin)

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Open browser to http://localhost:3000
```

The app will automatically use same-origin mode for local development.

## Split Deployment

### Backend Deployment

```bash
# Set CORS origins for your frontend domains
export CORS_ORIGINS="https://your-app.vercel.app,https://your-app.netlify.app"

# Start the server
npm start
```

Environment variables for backend:
- `CORS_ORIGINS`: Comma-separated list of allowed frontend URLs
- `SOCKET_ALLOWED_ORIGINS`: (Optional) Separate Socket.IO origins
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (production/development)

### Frontend Build

```bash
# Set backend URLs
export PUBLIC_API_URL="https://your-backend.com"
export PUBLIC_SOCKET_URL="https://your-backend.com"

# Generate runtime configuration
npm run build:frontend

# Validate setup
npm run validate:deploy
```

### Deploy to Vercel

1. Set environment variables in Vercel dashboard:
   - `PUBLIC_API_URL`: Your backend API URL
   - `PUBLIC_SOCKET_URL`: Your backend Socket.IO URL

2. Configure build settings:
   - Build Command: `npm run build:frontend`
   - Output Directory: `public`

3. Deploy!

### Deploy to Netlify

1. Set environment variables in Netlify site settings:
   - `PUBLIC_API_URL`: Your backend API URL
   - `PUBLIC_SOCKET_URL`: Your backend Socket.IO URL

2. The build settings are already configured in `netlify.toml`

3. Deploy!

## Useful Commands

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Generate frontend configuration
npm run build:frontend

# Validate split deployment setup
npm run validate:deploy
```

## Testing CORS Configuration

```bash
# Test with multiple origins
CORS_ORIGINS="https://app1.com,https://app2.com" npm start

# Test with single origin
CORS_ORIGINS="https://myapp.com" npm start

# Allow all origins (development only - NOT for production!)
CORS_ORIGINS="*" npm start
```

## Verification Checklist

After deployment, verify:

1. ✓ Backend health endpoint responds: `curl https://your-backend.com/api/health`
2. ✓ Frontend loads: Open your frontend URL in browser
3. ✓ Console shows: `[Runtime Config] Configuration loaded`
4. ✓ Console shows: `[ApiClient] Initialized with API base URL`
5. ✓ Socket.IO status indicator shows "● Online"
6. ✓ Create a workflow/role to test API connectivity
7. ✓ Open in two tabs to test real-time sync

## Common Issues

### CORS Errors
- Add frontend URL to backend's `CORS_ORIGINS`
- Ensure exact match including protocol (`https://`)

### Socket.IO Won't Connect
- Check `SOCKET_ALLOWED_ORIGINS` includes frontend URL
- Verify WebSocket traffic is not blocked

### Runtime Config Not Loading
- Verify `npm run build:frontend` ran during deployment
- Check environment variables are set in hosting platform
- Check browser console for errors

## More Information

- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [.env.example](.env.example) - Environment variables template
