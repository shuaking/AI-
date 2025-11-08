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
- **Python Code Execution**: Secure sandbox for executing Python code with file generation and download capabilities

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
│   │   ├── settings.json     # User settings and variables
│   │   └── python-output/    # Generated files from Python execution
│   ├── routes/               # REST API routes
│   │   ├── workflows.js      # Workflow CRUD endpoints
│   │   ├── roles.js          # Role CRUD endpoints
│   │   ├── prompts.js        # Prompt CRUD endpoints
│   │   ├── settings.js       # Settings CRUD endpoints
│   │   └── pythonExecution.js # Python code execution API
│   ├── utils/                # Utility modules
│   │   ├── jsonStore.js      # JSON file storage with caching
│   │   ├── validators.js     # Data validation
│   │   ├── pythonExecutor.js # Python code execution engine
│   │   └── fileManager.js    # File management system
│   └── middleware/           # Express middleware
│       ├── errorHandler.js   # Error handling
│       └── requestLogger.js  # Request logging
├── public/
│   ├── index.html            # Single-page application UI
│   ├── test-python-execution.html # Python execution test page
│   └── js/
│       ├── apiClient.js      # API client with offline support
│       └── socketClient.js   # Socket.IO client
├── package.json              # Node.js dependencies and scripts
├── .gitignore                # Git ignore rules
├── README.md                 # This file
├── DEVELOPER_NOTES.md        # Technical documentation
├── JSON_STORAGE_API_SUMMARY.md  # API documentation
├── PYTHON_EXECUTION_SANDBOX.md  # Python sandbox feature documentation
└── PYTHON_SANDBOX_IMPLEMENTATION.md  # Python sandbox implementation details
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

## Python Code Execution Sandbox

The application includes a secure Python code execution sandbox that allows AI roles (especially editors) to generate and execute Python code, create files, and provide downloadable outputs.

### Overview

The Python execution sandbox provides:
- **Secure Code Execution**: Safe execution environment with timeout and output limits
- **File Generation**: Create and download files (Markdown, CSV, JSON, etc.)
- **Automatic Detection**: Code blocks are automatically detected in role messages
- **User-Friendly Interface**: Execute code with a single click in the UI
- **Real-time Feedback**: View execution results, errors, and execution time

### Use Cases

- **Document Generation**: Editors can generate Markdown execution plans and project documents
- **Data Export**: Create CSV, JSON, or other data format files
- **Report Creation**: Generate formatted reports with data analysis
- **Script Execution**: Run data processing or transformation scripts
- **File Conversion**: Convert between different file formats

### How to Use

#### 1. Role Generates Python Code

AI roles can include Python code in their messages using standard Markdown code blocks:

````markdown
```python
# Example: Generate a project plan document
content = """# Project Execution Plan

## Phase 1: Analysis
- Define objectives
- List requirements

## Phase 2: Implementation
- Design solution
- Allocate resources
"""

with open('project_plan.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Project plan generated: project_plan.md")
```
````

#### 2. Execute Code in the UI

When a role message contains Python code:
1. An execution panel appears automatically below the message
2. The code is displayed with syntax highlighting
3. Click the **"Execute"** button to run the code
4. Click the **"Copy"** button to copy code to clipboard

#### 3. View Results

After execution, the panel displays:
- **Standard Output**: Console output from the code
- **Error Messages**: Any errors that occurred
- **Execution Time**: How long the code took to run
- **Generated Files**: List of files created with download links

#### 4. Download Files

Click the download link next to any generated file to save it to your computer. Files are automatically named and assigned the correct MIME type.

### Code Format Requirements

#### Standard Code Block
````markdown
```python
print("Hello, World!")
```
````

#### With File Generation
````python
```python
# Generate a CSV file
import csv

data = [
    ['Name', 'Department', 'Salary'],
    ['Alice', 'Engineering', '15000'],
    ['Bob', 'Marketing', '12000']
]

with open('employees.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(data)

print("✅ CSV file generated: employees.csv")
```
````

### Example: Editor Generating Markdown Document

Here's a complete example of an editor role generating an execution plan:

````python
```python
# Editor generates a comprehensive project execution plan

plan_content = """# Software Development Project Plan

## 1. Project Overview
**Project Name**: AI Workflow Studio Enhancement  
**Duration**: 8 weeks  
**Team Size**: 5 developers

## 2. Phase 1: Requirements Analysis (Week 1-2)
### Objectives
- Gather stakeholder requirements
- Define functional specifications
- Create user stories

### Deliverables
- Requirements document
- User story backlog
- Initial wireframes

## 3. Phase 2: Design (Week 3-4)
### Objectives
- System architecture design
- Database schema design
- UI/UX design

### Deliverables
- Architecture diagram
- Database schema
- High-fidelity mockups

## 4. Phase 3: Implementation (Week 5-6)
### Objectives
- Core feature development
- Integration with existing systems
- Unit testing

### Deliverables
- Working prototype
- Unit test coverage report
- API documentation

## 5. Phase 4: Testing & Deployment (Week 7-8)
### Objectives
- Integration testing
- User acceptance testing
- Production deployment

### Deliverables
- Test reports
- Deployment guide
- User documentation

## 6. Risk Management
- **Technical Risks**: Complexity of AI integration
- **Schedule Risks**: Tight timeline
- **Resource Risks**: Limited team size

## 7. Success Metrics
- All features implemented and tested
- 90% test coverage
- Zero critical bugs in production
- Positive user feedback

---
*Document generated on {date}*
"""

import datetime
current_date = datetime.datetime.now().strftime("%Y-%m-%d")
final_content = plan_content.format(date=current_date)

# Save to file
with open('execution_plan.md', 'w', encoding='utf-8') as f:
    f.write(final_content)

print("✅ Execution plan generated successfully!")
print(f"📄 File: execution_plan.md ({len(final_content)} bytes)")
```
````

### API Reference

#### Execute Python Code

**Endpoint**: `POST /api/execute-python/execute`

**Request Body**:
```json
{
  "code": "print('Hello, World!')"
}
```

**Response**:
```json
{
  "success": true,
  "exitCode": 0,
  "stdout": "Hello, World!\n",
  "stderr": "",
  "executionTime": 123,
  "files": [
    {
      "fileId": "1234567890-abc-def-file.txt",
      "filename": "file.txt",
      "size": 1024,
      "mimeType": "text/plain",
      "downloadUrl": "/api/execute-python/download/1234567890-abc-def-file.txt"
    }
  ]
}
```

#### Download Generated File

**Endpoint**: `GET /api/execute-python/download/:fileId`

**Response**: File content with appropriate `Content-Type` and `Content-Disposition` headers

#### Get File Information

**Endpoint**: `GET /api/execute-python/file/:fileId`

**Response**:
```json
{
  "success": true,
  "data": {
    "fileId": "1234567890-abc-def-file.txt",
    "filename": "file.txt",
    "size": 1024,
    "mimeType": "text/plain",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Extract Code from Message

**Endpoint**: `POST /api/execute-python/extract-code`

**Request Body**:
```json
{
  "message": "Here is some code:\n```python\nprint('test')\n```"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "hasCode": true,
    "codeBlocks": [
      {
        "type": "python",
        "code": "print('test')"
      }
    ]
  }
}
```

#### Get Execution Statistics

**Endpoint**: `GET /api/execute-python/stats`

**Response**:
```json
{
  "success": true,
  "data": {
    "totalFiles": 42,
    "totalSize": 1048576,
    "oldestFile": "2024-01-01T00:00:00.000Z",
    "newestFile": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Delete File

**Endpoint**: `DELETE /api/execute-python/file/:fileId`

**Response**:
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Security Features

The Python execution sandbox implements multiple security measures:

#### 1. Timeout Protection (30 seconds)
- Prevents infinite loops and long-running processes
- Automatically terminates processes that exceed the time limit
- Configurable via environment variables

#### 2. Output Limitation (1MB)
- Prevents memory overflow from excessive output
- Automatically truncates output that exceeds the limit
- Protects server resources

#### 3. Process Isolation
- Each execution runs in a separate Python process
- Uses Node.js `child_process` for isolation
- Processes are cleaned up after completion

#### 4. File System Isolation
- Generated files are stored in a dedicated directory
- Files use unique IDs to prevent conflicts
- Cannot access or modify system files

#### 5. Automatic Cleanup
- Files older than 24 hours are automatically deleted
- Runs every hour to free up disk space
- Prevents disk space exhaustion

#### 6. Error Containment
- All errors are caught and returned safely
- Failed executions don't crash the server
- Detailed error messages for debugging

### Supported File Formats

The sandbox can generate and serve files in various formats:

| Format | Extension | MIME Type | Use Case |
|--------|-----------|-----------|----------|
| Markdown | `.md` | `text/markdown` | Documentation, plans |
| Plain Text | `.txt` | `text/plain` | Logs, notes |
| CSV | `.csv` | `text/csv` | Data exports |
| JSON | `.json` | `application/json` | Structured data |
| HTML | `.html` | `text/html` | Reports, pages |
| Python | `.py` | `text/x-python` | Scripts |
| JavaScript | `.js` | `application/javascript` | Code files |
| XML | `.xml` | `application/xml` | Data interchange |

### Troubleshooting

#### Code Doesn't Execute

**Symptoms**: No execution panel appears or execution button doesn't work

**Solutions**:
1. Check that Python is installed: `python3 --version`
2. Verify code block format uses proper Markdown syntax
3. Check browser console for JavaScript errors
4. Ensure server is running: visit `/api/health`

#### Files Can't Be Downloaded

**Symptoms**: Download link doesn't work or returns 404

**Solutions**:
1. Verify file was actually generated (check stdout for confirmation)
2. Check that the file ID is correct
3. Verify server has write permissions to the output directory
4. Check server logs for file system errors

#### Execution Timeout

**Symptoms**: Code execution stops after 30 seconds

**Solutions**:
1. Optimize your code to run faster
2. Break large operations into smaller chunks
3. Avoid infinite loops or blocking operations
4. Consider increasing timeout (requires server configuration)

#### Permission Errors

**Symptoms**: "Permission denied" errors when creating files

**Solutions**:
1. Check server process has write permissions
2. Verify output directory exists and is writable
3. Check file system disk space
4. Review server user permissions

#### Import Errors

**Symptoms**: "ModuleNotFoundError" when executing code

**Solutions**:
1. Install required Python packages on the server
2. Use only standard library modules
3. Check Python version compatibility
4. Verify virtual environment is activated (if used)

### Configuration

You can configure the Python sandbox using environment variables:

```bash
# Python executable path (default: python3)
PYTHON_PATH=python3

# Execution timeout in milliseconds (default: 30000)
PYTHON_TIMEOUT=30000

# Maximum output size in bytes (default: 1048576)
PYTHON_MAX_OUTPUT=1048576

# Output directory for generated files (default: {dataDir}/python-output)
PYTHON_OUTPUT_DIR=/path/to/output
```

### Testing

A comprehensive test page is available at:
```
http://localhost:3000/public/test-python-execution.html
```

The test page includes:
- **Basic Execution**: Test simple Python code
- **File Generation**: Test file creation and download
- **Error Handling**: Test error capture and display
- **Code Extraction**: Test code block detection
- **Performance**: Test execution speed
- **Timeout Protection**: Test timeout handling

### Best Practices

#### For AI Roles

1. **Clear Output**: Always print confirmation messages when files are generated
2. **Error Handling**: Use try-except blocks for robust code
3. **File Naming**: Use descriptive file names
4. **Documentation**: Add comments to explain complex logic
5. **Validation**: Validate inputs before processing

#### For Users

1. **Review Code**: Always review code before executing
2. **Check Results**: Verify stdout/stderr for any issues
3. **Download Files**: Download important files immediately
4. **Clean Up**: Delete unnecessary files to save space
5. **Report Issues**: Check logs if something goes wrong

### Limitations

- **Python Version**: Uses system default Python 3.x
- **Libraries**: Only system-installed packages available
- **File System**: Cannot modify files outside output directory
- **Network**: Internet access depends on system configuration
- **Execution Time**: Maximum 30 seconds per execution
- **Output Size**: Maximum 1MB combined stdout/stderr

### Advanced Usage

#### Multi-File Generation

```python
# Generate multiple related files
import json
import csv

# Generate JSON data file
data = {"project": "AI Studio", "version": "2.2"}
with open('config.json', 'w') as f:
    json.dump(data, f, indent=2)

# Generate CSV report
with open('report.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Metric', 'Value'])
    writer.writerow(['Users', '1000'])

# Generate Markdown summary
with open('summary.md', 'w') as f:
    f.write('# Project Summary\n\nGenerated multiple files.')

print("✅ Generated 3 files: config.json, report.csv, summary.md")
```

#### Data Processing Pipeline

```python
# Process data and generate visualization report
import json
import datetime

# Sample data processing
data = [10, 20, 30, 40, 50]
total = sum(data)
average = total / len(data)
max_val = max(data)
min_val = min(data)

# Generate detailed report
report = f"""# Data Analysis Report

**Generated**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary Statistics

- **Total**: {total}
- **Average**: {average}
- **Maximum**: {max_val}
- **Minimum**: {min_val}
- **Count**: {len(data)}

## Data Points

{chr(10).join(f'- Point {i+1}: {v}' for i, v in enumerate(data))}

## Conclusion

Data analysis completed successfully.
"""

with open('analysis_report.md', 'w') as f:
    f.write(report)

print(f"✅ Analysis complete: {len(data)} points processed")
```

For detailed implementation information, see [PYTHON_EXECUTION_SANDBOX.md](./PYTHON_EXECUTION_SANDBOX.md) and [PYTHON_SANDBOX_IMPLEMENTATION.md](./PYTHON_SANDBOX_IMPLEMENTATION.md).

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

### Python Code Execution Issues

#### Python Not Found

If you get "Python not found" errors:
1. Install Python 3: `sudo apt-get install python3` (Ubuntu/Debian) or `brew install python3` (macOS)
2. Verify installation: `python3 --version`
3. Set custom Python path if needed: `PYTHON_PATH=/usr/local/bin/python3 npm start`

#### Code Execution Panel Not Appearing

If the execution panel doesn't appear for Python code:
1. Ensure code blocks use proper Markdown format with ```python tag
2. Check browser console for JavaScript errors (F12)
3. Verify the message is from a role (not user)
4. Clear browser cache and reload the page

#### File Download Issues

If you cannot download generated files:
1. Check that files were actually created (look for success message in stdout)
2. Verify server has write permissions: `ls -la server/data/python-output/`
3. Check disk space: `df -h`
4. Review server logs for file system errors

#### Slow Execution

If code execution is slow:
1. Profile your Python code to find bottlenecks
2. Optimize algorithms and reduce complexity
3. Avoid I/O-heavy operations when possible
4. Consider breaking large operations into smaller chunks

#### Memory or Timeout Issues

If code hits timeout or memory limits:
1. Reduce data size being processed
2. Optimize memory usage (avoid storing large data in memory)
3. Break operations into smaller chunks
4. Remove infinite loops or long-running operations
5. Consider increasing limits via environment variables (PYTHON_TIMEOUT, PYTHON_MAX_OUTPUT)

## License

ISC
