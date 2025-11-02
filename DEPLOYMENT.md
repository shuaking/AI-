# Deployment Guide

This guide explains how to deploy the AI Workflow Studio with front/back separation.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Netlify Deployment](#netlify-deployment)
- [Testing Deployment](#testing-deployment)
- [Troubleshooting](#troubleshooting)

## Overview

The AI Workflow Studio supports two deployment modes:

1. **Unified Deployment**: Frontend and backend deployed together on the same server
2. **Split Deployment**: Frontend on static hosting (Vercel/Netlify), backend on separate server

This guide focuses on split deployment.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Static)                      │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Vercel / Netlify / Cloudflare Pages             │  │
│  │                                                    │  │
│  │  • HTML, CSS, JavaScript                         │  │
│  │  • Runtime Config (window.APP_CONFIG)            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS + WebSocket
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                 │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  DigitalOcean / AWS / Heroku / Railway           │  │
│  │                                                    │  │
│  │  • REST API (/api/*)                             │  │
│  │  • Socket.IO Server                              │  │
│  │  • JSON Storage                                  │  │
│  │  • CORS Configuration                            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Backend Deployment

### 1. Choose a Backend Hosting Platform

Popular options:
- **DigitalOcean App Platform**: Easy Node.js deployment
- **AWS Elastic Beanstalk**: Scalable and managed
- **Heroku**: Simple deployment with git push
- **Railway**: Modern platform with great DX
- **Render**: Free tier available

### 2. Configure Environment Variables

Set these environment variables on your backend hosting platform:

```bash
# Server configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# CORS configuration - IMPORTANT!
# Replace with your actual frontend URLs
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.netlify.app

# Optional: Separate Socket.IO origins
SOCKET_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### 3. Deploy Backend

Example for Heroku:

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-backend

# Set environment variables
heroku config:set CORS_ORIGINS="https://your-frontend.vercel.app" -a your-app-backend
heroku config:set NODE_ENV=production -a your-app-backend

# Deploy
git push heroku main
```

### 4. Verify Backend

Test the backend health endpoint:

```bash
curl https://your-backend-api.com/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "version": "2.2.0",
  "services": {
    "api": "operational",
    "storage": "operational",
    "socketIO": "idle"
  }
}
```

## Frontend Deployment

### Step 1: Configure Build

The frontend needs to know where the backend is located. This is done through environment variables:

```bash
PUBLIC_API_URL=https://your-backend-api.com
PUBLIC_SOCKET_URL=https://your-backend-api.com
```

### Step 2: Generate Configuration (Local Testing)

For local testing before deployment:

```bash
# Set environment variables
export PUBLIC_API_URL="https://your-backend-api.com"
export PUBLIC_SOCKET_URL="https://your-backend-api.com"

# Generate runtime config
npm run build:frontend

# Check the generated file
cat public/runtime-config.js
```

## Vercel Deployment

### Step 1: Prepare Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure `vercel.json` is in the root directory (already included)

### Step 2: Import Project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:frontend`
   - **Output Directory**: `public`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables

In Vercel project settings → Environment Variables, add:

| Name | Value | Environment |
|------|-------|-------------|
| PUBLIC_API_URL | https://your-backend-api.com | Production |
| PUBLIC_SOCKET_URL | https://your-backend-api.com | Production |

### Step 4: Deploy

Click "Deploy" and wait for the deployment to complete.

### Step 5: Update Backend CORS

Update your backend's `CORS_ORIGINS` to include your Vercel URL:

```bash
CORS_ORIGINS=https://your-project.vercel.app
```

## Netlify Deployment

### Step 1: Prepare Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure `netlify.toml` is in the root directory (already included)

### Step 2: Import Project in Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider and select your repository
4. Build settings are automatically read from `netlify.toml`

### Step 3: Configure Environment Variables

In Netlify site settings → Build & deploy → Environment, add:

| Key | Value |
|-----|-------|
| PUBLIC_API_URL | https://your-backend-api.com |
| PUBLIC_SOCKET_URL | https://your-backend-api.com |

### Step 4: Deploy

Click "Deploy site" and wait for the deployment to complete.

### Step 5: Update Backend CORS

Update your backend's `CORS_ORIGINS` to include your Netlify URL:

```bash
CORS_ORIGINS=https://your-site.netlify.app
```

## Testing Deployment

### 1. Check Frontend

1. Open your frontend URL in a browser
2. Open DevTools (F12) → Console
3. Look for these messages:
   ```
   [Runtime Config] Configuration loaded: { apiBaseUrl: "...", socketUrl: "..." }
   [ApiClient] Initialized with API base URL: https://your-backend-api.com
   [SocketClient] INIT: Socket.IO client initialized
   ```

### 2. Test API Connection

1. Try creating a workflow or role
2. Check the Network tab in DevTools
3. Verify requests are going to your backend URL
4. Check for CORS errors (should be none if configured correctly)

### 3. Test WebSocket Connection

1. Check the Socket.IO status indicator (should show "● Online")
2. Open the app in two browser tabs
3. Make a change in one tab
4. Verify the change appears in the other tab (real-time sync)

### 4. Common Issues

#### CORS Errors
- Error: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
- Solution: Add frontend URL to backend's `CORS_ORIGINS`

#### WebSocket Connection Failed
- Error: `WebSocket connection failed`
- Solution: Check `SOCKET_ALLOWED_ORIGINS` and ensure WebSocket traffic is allowed

#### 404 on Refresh
- Error: Page not found when refreshing
- Solution: Ensure SPA redirect rules are configured (already in netlify.toml/vercel.json)

## Troubleshooting

### Backend Not Responding

1. Check if backend server is running:
   ```bash
   curl https://your-backend-api.com/health
   ```

2. Check server logs for errors

3. Verify firewall rules allow traffic on the backend port

### Frontend Can't Connect

1. Check browser console for errors
2. Verify `runtime-config.js` was generated:
   ```bash
   curl https://your-frontend.com/runtime-config.js
   ```

3. Check that environment variables are set in hosting platform

4. Verify `npm run build:frontend` is running during deployment

### Socket.IO Not Connecting

1. Check that backend WebSocket port is open
2. Verify `SOCKET_ALLOWED_ORIGINS` includes frontend URL
3. Some hosting platforms require special WebSocket configuration
4. Check if using HTTPS (required for production)

### Data Not Persisting

1. Check backend logs for storage errors
2. Verify `server/data` directory is writable
3. Check disk space on backend server

## Security Best Practices

1. **Never use `CORS_ORIGINS="*"` in production**
2. **Always use HTTPS in production**
3. **Keep allowed origins list minimal**
4. **Regularly update dependencies**
5. **Use environment variables for sensitive config**
6. **Enable rate limiting on backend**
7. **Implement authentication for production use**

## Monitoring

Consider setting up monitoring for:
- Backend API response times
- WebSocket connection status
- Error rates
- Storage usage
- Uptime monitoring

Popular tools:
- UptimeRobot (uptime monitoring)
- Sentry (error tracking)
- LogRocket (session replay)
- DataDog (full observability)

## Cost Estimation

### Free Tier Options

- **Frontend**: Vercel/Netlify free tier
- **Backend**: Railway/Render free tier (limited resources)

### Paid Options

- **Frontend**: ~$0-20/month (usually included in free tier)
- **Backend**: ~$5-50/month depending on traffic and resources

## Support

If you encounter issues:
1. Check the [README.md](README.md) for general documentation
2. Review server logs for errors
3. Check browser DevTools console
4. Verify environment variables are set correctly
5. Test backend health endpoint
6. Review CORS configuration
