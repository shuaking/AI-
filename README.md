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

This command executes the `start:prod` script (`NODE_ENV=production node server/index.js`).

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
- `CORS_ORIGINS`: Comma-separated list of allowed origins for CORS (default: *)
- `SOCKET_ALLOWED_ORIGINS`: Comma-separated list of allowed origins for Socket.IO (default: uses CORS_ORIGINS)
- `NODE_ENV`: Environment mode (development/production)

### Example with custom port:

```bash
PORT=8080 npm start
```

### Example with CORS configuration:

```bash
CORS_ORIGINS="https://example.com,https://app.example.com" npm start
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

## Front/Back Separation

The application supports deploying the frontend (static assets) and backend (API + Socket.IO) separately. This is useful when you want to host the frontend on Vercel, Netlify, or other static hosting platforms while running the backend on a separate server.

### Architecture

- **Frontend**: Static HTML, CSS, and JavaScript served from platforms like Vercel/Netlify
- **Backend**: Node.js Express + Socket.IO server running on a separate server (e.g., DigitalOcean, AWS, Heroku)
- **Communication**: Frontend connects to backend via REST API and WebSocket (Socket.IO)

### Step 1: Configure Backend Server

Deploy the backend server to your hosting platform and configure CORS to allow requests from your frontend domain(s):

```bash
# Allow single frontend domain
CORS_ORIGINS="https://your-frontend.vercel.app" npm start

# Allow multiple frontend domains
CORS_ORIGINS="https://your-frontend.vercel.app,https://your-frontend.netlify.app" npm start

# For development, allow all origins (NOT recommended for production)
CORS_ORIGINS="*" npm start
```

**Important Security Notes:**
- Never use `CORS_ORIGINS="*"` in production
- Always specify exact domains you want to allow
- Use HTTPS for production deployments
- Keep your allowed origins list as restrictive as possible

### Step 2: Generate Frontend Configuration

Before deploying the frontend, generate the runtime configuration that tells the frontend where to find the backend:

```bash
# Set environment variables for your backend URLs
export PUBLIC_API_URL="https://your-backend-api.com"
export PUBLIC_SOCKET_URL="https://your-backend-api.com"

# Generate the configuration file
npm run build:frontend

# (Optional) Validate the setup
npm run validate:deploy
```

This creates `public/runtime-config.js` which the frontend will use to connect to your backend.

### Step 3: Deploy Frontend to Vercel

1. Push your code to GitHub, GitLab, or Bitbucket
2. Import the project in Vercel
3. Configure environment variables in Vercel project settings:
   - `PUBLIC_API_URL`: Your backend API URL (e.g., `https://api.example.com`)
   - `PUBLIC_SOCKET_URL`: Your backend Socket.IO URL (usually the same as API URL)
4. Deploy settings:
   - **Build Command**: `npm run build:frontend`
   - **Output Directory**: `public`
   - **Install Command**: `npm install`

The `vercel.json` file is already configured for you.

### Step 4: Deploy Frontend to Netlify

1. Push your code to GitHub, GitLab, or Bitbucket
2. Import the project in Netlify
3. Configure environment variables in Netlify site settings:
   - `PUBLIC_API_URL`: Your backend API URL (e.g., `https://api.example.com`)
   - `PUBLIC_SOCKET_URL`: Your backend Socket.IO URL (usually the same as API URL)
4. Deploy settings (already configured in `netlify.toml`):
   - **Build Command**: `npm run build:frontend`
   - **Publish Directory**: `public`

### Step 5: Verify Deployment

After deploying both frontend and backend, verify the connection:

1. Open the frontend URL in your browser
2. Open browser DevTools (F12) and check the Console
3. Look for messages like:
   ```
   [Runtime Config] Configuration loaded: { apiBaseUrl: "...", socketUrl: "..." }
   [ApiClient] Using API base URL: https://your-backend-api.com
   [SocketClient] Connected with socket ID: ...
   ```
4. Test API connectivity:
   - Create a workflow or role
   - Verify data is saved to the backend
5. Test WebSocket connectivity:
   - Check the Socket.IO status indicator shows "● Online"
   - Open the app in multiple browser tabs and verify real-time updates work

### Local Development with Separated Deployment

For local development, you don't need to generate the runtime config. The app automatically falls back to same-origin mode when `runtime-config.js` is not present:

```bash
# Just run the backend server
npm run dev

# Frontend will automatically connect to localhost:3000
```

### Updating Backend URLs

If you need to change the backend URLs after deployment:

1. **For Vercel**: Update environment variables in Vercel dashboard, then redeploy
2. **For Netlify**: Update environment variables in Netlify site settings, then trigger a new build
3. **For local testing**: Update `.env` file or export environment variables, then run `npm run build:frontend`

### Troubleshooting Split Deployment

#### CORS Errors

If you see CORS errors in the browser console:

1. Verify `CORS_ORIGINS` on backend includes your frontend domain
2. Ensure the domain matches exactly (including protocol: `https://`)
3. Check that the backend server is running and accessible
4. Verify firewall rules allow traffic on the backend port

#### WebSocket Connection Fails

If Socket.IO fails to connect:

1. Verify `SOCKET_ALLOWED_ORIGINS` on backend includes your frontend domain
2. Check that WebSocket traffic is not blocked by firewall
3. Ensure the backend URL uses `https://` (not `http://`) in production
4. Some hosting platforms require special WebSocket configuration

#### API Requests Fail

If REST API requests fail:

1. Check `PUBLIC_API_URL` is set correctly in frontend environment variables
2. Verify backend server is running and accessible
3. Check browser DevTools Network tab for request details
4. Ensure backend CORS configuration allows the HTTP methods: GET, POST, PUT, DELETE

#### Runtime Config Not Loading

If the frontend doesn't connect to the backend:

1. Verify `npm run build:frontend` was executed during deployment
2. Check that `public/runtime-config.js` exists
3. Look for error messages in browser console
4. Verify environment variables are set in hosting platform

## 平台部署

本项目内置了 Railway 与 Render 的全栈部署配置文件（`railway.json` 与 `render.yaml`），可将 Express + Socket.IO 服务器与静态资源一键发布到托管平台。

### Railway 部署步骤

1. 在 Railway 中导入 GitHub 仓库，选择使用仓库根目录的 `railway.json` 自动生成服务。
2. 在 **Variables** 中根据 `.env.example` 配置以下变量：`PORT`、`HOST`、`NODE_ENV`、`CORS_ORIGINS`、`SOCKET_ALLOWED_ORIGINS`、`DATA_DIR`、`PUBLIC_API_URL`、`PUBLIC_SOCKET_URL`。
3. 在 **Volumes** 中创建名为 `workflow-data` 的持久化卷，并挂载到 `/app/server/data`，用于保存 JSON 数据文件。
4. 确认构建命令为 `npm install`、启动命令为 `npm start`，并保留健康检查路径 `/health`。
5. 部署完成后访问 `https://your-railway-app.up.railway.app/health` 验证状态码为 200，并在浏览器中确认 Socket.IO 指示灯为“Online”。

### Render 部署步骤

1. 在 Render 中创建新的 Web Service，导入仓库并选择使用根目录的 `render.yaml`。
2. Render 会自动读取构建命令 `npm install` 与启动命令 `npm start`，如需自定义请在服务设置中调整。
3. 在 **Disks** 中创建名为 `workflow-data` 的磁盘（至少 1GB），挂载路径设置为 `/app/server/data`。
4. 在 **Environment** 选项卡中添加 `.env.example` 中列出的全部变量，`NODE_ENV=production`、`DATA_DIR=/app/server/data`、`CORS_ORIGINS` 等必须与后端和前端域名保持一致。
5. 部署后访问 `https://your-render-app.onrender.com/health` 验证健康检查，通过浏览器 Console 或多个标签页操作确认 Socket.IO 可以完成 WebSocket 升级。

### 通用指南

- **数据持久化**：创建或编辑工作流后，重启服务并确认数据仍然存在，以验证 `/app/server/data` 的卷/磁盘挂载是否生效。
- **WebSocket 验证**：在两个浏览器标签页中打开应用，观察实时同步与 Console 中的 `[SocketClient]` 日志，确保 Socket.IO 连接成功。
- **环境变量对照**：部署前对照 `.env.example` 设置所有键值，`PUBLIC_API_URL` 与 `PUBLIC_SOCKET_URL` 应指向同一个后端域。
- **故障排查**：健康检查异常时查看平台日志；Socket.IO 连接失败通常与 CORS 或代理设置相关，必要时检查 `SOCKET_ALLOWED_ORIGINS` 和 HTTPS 配置。

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
