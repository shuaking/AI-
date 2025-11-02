# AI工作流工作室 (AI Workflow Studio)

Single-page AI workflow studio (v2.2) with Express + Socket.IO backend. The application provides a comprehensive workflow management interface with template management, role management, prompt library, LLM interface configuration, and collaborative chat-style workspace.

## Features

- **Workflow Templates**: Pre-built and custom workflow templates
- **Role Management**: Define and manage AI agent roles
- **Prompt Library**: Store and manage reusable prompts and variables
- **LLM Interface Configuration**: Configure standard and custom LLM APIs with streaming support
- **Collaborative Workspace**: Chat-style interface with stage progress, message flow, and role mentions
- **Real-time Communication**: Socket.IO powered real-time updates
- **Data Persistence**: REST API backend with JSON storage for workflows, roles, prompts, and settings
- **Offline Support**: Automatic fallback to localStorage cache when offline or server unavailable

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn

## Installation

1. Clone the repository and navigate to the project directory:
```bash
cd /path/to/ai-workflow-studio
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

Run the server with hot-reload using nodemon:

```bash
npm run dev
```

The server will automatically restart when you make changes to the server code.

### Production Mode

Run the server in production mode:

```bash
npm start
```

## Accessing the Application

Once the server is running, open your browser and navigate to:

```
http://localhost:3000
```

The application will serve the single-page UI from the `public` directory.

## Configuration

The server can be configured using environment variables:

- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)
- `CORS_ORIGIN`: CORS origin (default: *)
- `NODE_ENV`: Environment mode (development/production)

### Example with custom port:

```bash
PORT=8080 npm start
```

## Project Structure

```
.
├── server/
│   ├── index.js              # Main server entry point
│   ├── config.js             # Configuration module
│   ├── data/                 # JSON data storage
│   │   ├── workflows.json    # Workflow templates
│   │   ├── roles.json        # Role definitions
│   │   ├── prompts.json      # Prompt templates
│   │   └── settings.json     # User settings and variables
│   ├── routes/               # REST API routes
│   │   ├── workflows.js      # Workflow CRUD endpoints
│   │   ├── roles.js          # Role CRUD endpoints
│   │   ├── prompts.js        # Prompt CRUD endpoints
│   │   └── settings.js       # Settings CRUD endpoints
│   ├── utils/                # Utility modules
│   │   ├── jsonStore.js      # JSON file storage with caching
│   │   └── validators.js     # Data validation
│   └── middleware/           # Express middleware
│       ├── errorHandler.js   # Error handling
│       └── requestLogger.js  # Request logging
├── public/
│   ├── index.html            # Single-page application UI
│   └── js/
│       ├── apiClient.js      # API client with offline support
│       └── socketClient.js   # Socket.IO client
├── package.json              # Node.js dependencies and scripts
├── .gitignore                # Git ignore rules
├── README.md                 # This file
├── DEVELOPER_NOTES.md        # Technical documentation
└── JSON_STORAGE_API_SUMMARY.md  # API documentation
```

## API Endpoints

### Health Check

```
GET /api/health
```

Returns server status and uptime information.

### Data Management

The application provides RESTful API endpoints for managing workflows, roles, prompts, and settings:

#### Workflows
- `GET /api/workflows` - List all workflows
- `GET /api/workflows/:id` - Get specific workflow
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

#### Roles
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get specific role
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

#### Prompts
- `GET /api/prompts` - List all prompts
- `GET /api/prompts/:id` - Get specific prompt
- `POST /api/prompts` - Create prompt
- `PUT /api/prompts/:id` - Update prompt
- `DELETE /api/prompts/:id` - Delete prompt

#### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings/variables` - Update global variables
- `PUT /api/settings/api-configs` - Update custom API configurations

See `server/README.md` for detailed API documentation.

## Socket.IO

The server includes a Socket.IO instance for real-time communication. Connection and disconnection events are logged to the console.

### Connection Example

The Socket.IO server is available at the same address as the HTTP server. The client can connect using:

```javascript
const socket = io();
```

## Development Notes

- The frontend is a self-contained single-page application with inline CSS and JavaScript
- All static assets are served from the `public` directory
- Socket.IO namespace is configured at the root level (`/`)
- CORS is enabled by default for development purposes

### Data Loading Strategy

The application uses a hybrid approach for data management:

1. **Primary Source**: On page load, the application fetches data from REST API endpoints
2. **Caching**: Successfully fetched data is cached in localStorage for offline use
3. **Offline Mode**: If the API is unavailable, the app automatically falls back to cached data
4. **Graceful Degradation**: If both API and cache fail, the app uses hardcoded defaults

This ensures the application works seamlessly both online and offline.

### Testing the API Client

A test page is available at `http://localhost:3000/test-api-client.html` to verify the API client integration and test various scenarios including:
- Fetching workflows, roles, prompts, and settings
- Saving and reading data
- Online/offline status detection

## Platform Deployment

The application can be deployed to cloud platforms like Railway and Render with minimal configuration. Both platforms support persistent storage for workflow data and automatic SSL/TLS.

### Prerequisites

Before deploying:
- Ensure you have a Railway or Render account
- Verify the `server/data` directory will be persisted via platform volumes/disks
- Plan your environment variables (see `.env.example` for reference)

### Railway Deployment

Railway offers automatic deployments from GitHub with built-in volume support.

#### Step-by-Step Guide

1. **Create a New Project**
   - Connect your GitHub repository to Railway
   - Railway will auto-detect the Node.js project and use `railway.json` config

2. **Create a Persistent Volume**
   - In your Railway project, navigate to your service settings
   - Go to "Volumes" and click "New Volume"
   - Set mount path to `/app/server/data`
   - This ensures workflow data persists across deployments

3. **Configure Environment Variables**
   
   Required variables:
   ```
   NODE_ENV=production
   PORT=3000
   HOST=0.0.0.0
   DATA_DIR=/app/server/data
   ```
   
   Optional (configure CORS if needed):
   ```
   CORS_ORIGINS=https://your-domain.com
   SOCKET_ALLOWED_ORIGINS=https://your-domain.com
   ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Monitor logs for successful startup
   - Check health endpoint: `https://your-app.railway.app/health`

5. **Verify WebSocket Connectivity**
   - Open the deployed application
   - Check browser console for Socket.IO connection messages
   - Look for: `[Socket.IO] Connected to server`

#### Railway Volume Warning

⚠️ **IMPORTANT**: Without a persistent volume mounted at `/app/server/data`, all workflow data will be lost on each deployment. Always configure the volume before saving important data.

### Render Deployment

Render provides declarative infrastructure via `render.yaml` with persistent disk support.

#### Step-by-Step Guide

1. **Create Web Service from Repo**
   - In Render dashboard, click "New" → "Web Service"
   - Connect your GitHub/GitLab repository
   - Render will detect `render.yaml` and pre-fill settings

2. **Review Service Configuration**
   
   The `render.yaml` configures:
   - **Runtime**: Node.js (18+)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check**: `/health` endpoint
   - **Persistent Disk**: 1GB mounted at `/app/server/data`

3. **Environment Variables Checklist**
   
   Review and customize in Render dashboard:
   - ✅ `NODE_ENV=production` (pre-configured)
   - ✅ `PORT=10000` (Render default)
   - ✅ `HOST=0.0.0.0` (required)
   - ✅ `DATA_DIR=/app/server/data` (matches disk mount)
   - ⚠️ `CORS_ORIGINS` - Update to your domain if not using wildcard
   - ⚠️ `SOCKET_ALLOWED_ORIGINS` - Should match CORS_ORIGINS

4. **Persistent Disk Setup**
   - Render automatically creates the disk defined in `render.yaml`
   - Mount path: `/app/server/data`
   - Size: 1GB (adjust in `render.yaml` if needed)
   - ⚠️ Do not remove or change mount path after creation

5. **Deploy and Verify**
   - Click "Create Web Service"
   - Wait for initial build and deployment
   - Test health endpoint: `https://your-app.onrender.com/health`
   - Expected response:
     ```json
     {
       "status": "ok",
       "timestamp": "2024-01-01T00:00:00.000Z",
       "uptime": 123.456
     }
     ```

6. **WebSocket Verification**
   - Access the deployed application
   - Open browser DevTools → Console
   - Verify Socket.IO connection: Look for connection success logs
   - Test real-time features to confirm bidirectional communication

#### Render Disk Warning

⚠️ **CRITICAL**: Render's persistent disks are the ONLY way to preserve data across deploys. Without the disk properly mounted at `/app/server/data`:
- All workflows, roles, prompts, and settings will reset on every deploy
- Data loss is permanent and unrecoverable
- Always verify disk status before storing production data

### Post-Deployment Checklist

After deploying to either platform:

- [ ] Health endpoint returns HTTP 200 with valid JSON
- [ ] Static assets (index.html) load correctly
- [ ] WebSocket connection establishes successfully
- [ ] REST API endpoints respond (test `/api/workflows`)
- [ ] Data persists after service restart/redeploy
- [ ] CORS headers allow your frontend domain
- [ ] Socket.IO CORS allows WebSocket connections
- [ ] Environment-specific URLs are configured

### Common Deployment Issues

**Issue**: `Cannot GET /`  
**Solution**: Verify `public` directory is included in deployment and `express.static` middleware is configured.

**Issue**: Socket.IO connection fails  
**Solution**: 
- Check `SOCKET_ALLOWED_ORIGINS` includes your domain
- Verify WebSocket traffic is not blocked by firewall/proxy
- Ensure HTTPS is used (wss://) if site uses HTTPS

**Issue**: Data not persisting  
**Solution**:
- Confirm volume/disk is mounted at correct path
- Verify `DATA_DIR` environment variable matches mount path
- Check service logs for file system permission errors

**Issue**: CORS errors in browser console  
**Solution**:
- Update `CORS_ORIGINS` to include your frontend domain
- Remove `*` wildcard in production for security
- Ensure `SOCKET_ALLOWED_ORIGINS` matches `CORS_ORIGINS`

## Troubleshooting

### Port Already in Use

If you see an error that the port is already in use, either:
1. Stop the process using that port
2. Use a different port: `PORT=3001 npm start`

### Cannot Connect to Socket.IO

Ensure that:
1. The server is running
2. There are no firewall rules blocking the connection
3. CORS is properly configured if accessing from a different origin

## License

ISC
