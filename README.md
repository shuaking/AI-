# AI工作流工作室 (AI Workflow Studio)

Single-page AI workflow studio (v2.2) with Express + Socket.IO backend. The application provides a comprehensive workflow management interface with template management, role management, prompt library, LLM interface configuration, and collaborative chat-style workspace.

## Features

- **🔄 Workflow Templates**: Pre-built and custom workflow templates with stage-based execution
- **👥 Role Management**: Define and manage AI agent roles with specialized capabilities
- **📝 Prompt Library**: Store and manage reusable prompts and variables
- **🤖 LLM Interface Configuration**: Configure standard and custom LLM APIs with streaming support
- **💬 Collaborative Workspace**: Chat-style interface with stage progress, message flow, and role mentions
- **⚡ Real-time Communication**: Socket.IO powered real-time updates across multiple clients
- **💾 Data Persistence**: REST API backend with JSON storage for workflows, roles, prompts, and settings
- **🌐 Offline Support**: Automatic fallback to localStorage cache when offline or server unavailable
- **🐍 Python Code Execution Sandbox**: Secure environment for executing Python code with file generation and download capabilities
  - **📁 File Generation**: Create Markdown, CSV, JSON, HTML documents and more
  - **🔒 Security**: 30s timeout, 1MB output limits, process isolation
  - **🤖 Auto-Detection**: Automatically identifies Python code blocks in role messages
  - **📥 Download Management**: Direct file downloads with proper MIME types
  - **🧹 Auto-Cleanup**: 24-hour file expiration with automatic cleanup

## 本地开发环境设置指南

### 1. 系统要求
- **操作系统**：Windows、macOS、Linux
- **Node.js**：v16+ (推荐 v18+)
- **npm** 或 **yarn**：包管理器
- **Python**：3.8+ (推荐 3.10+) - **必需用于Python代码执行**
- **Git**：版本控制

### 2. 环境变量配置
创建 `.env` 文件（复制自 `.env.example`）：
```
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
SOCKET_ALLOWED_ORIGINS=http://localhost:3000
DATA_DIR=./server/data
PUBLIC_API_URL=http://localhost:3000
PUBLIC_SOCKET_URL=http://localhost:3000
```

### 3. 逐步安装指南

#### 3.1 检查系统依赖
提供检查脚本或命令：
```bash
# 检查Node.js
node --version
npm --version

# 检查Python
python --version
# 或
python3 --version

# 检查Git
git --version
```

#### 3.2 安装依赖

**Windows:**
- Node.js: 下载 https://nodejs.org/ (LTS版本)
- Python: 下载 https://www.python.org/downloads/
  - ⚠️ 勾选"Add Python to PATH"
- Git: 下载 https://git-scm.com/

**macOS:**
```bash
# 使用Homebrew
brew install node python3 git

# 或使用官方安装程序下载
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install nodejs npm python3 python3-pip git
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install nodejs python3 python3-pip git
```

#### 3.3 验证安装
```bash
node --version    # 应该显示 v16 或更高
npm --version     # 应该显示 8 或更高
python3 --version # 应该显示 3.8 或更高
git --version     # 应该显示 git version ...
```

### 4. 项目设置

#### 4.1 克隆仓库
```bash
git clone https://github.com/your-username/AI-.git
cd AI-
```

#### 4.2 安装项目依赖
```bash
# 安装所有依赖（包括后端和前端）
npm install

# 或分开安装：
# 后端依赖（如果需要）
npm install --prefix server

# 前端依赖已包含在主目录
```

#### 4.3 创建环境配置
```bash
# 复制示例环境变量文件
cp .env.example .env

# 编辑 .env 文件（通常默认配置可用于本地开发）
# 如果使用自定义端口或路径，修改相应配置
```

### 5. 启动开发服务器

#### 5.1 全栈启动

**支持跨平台（Windows、macOS、Linux）：**

```bash
# 生产环境启动
npm start

# 开发环境启动（自动热重载）
npm run dev

# 服务器将在 http://localhost:3000 运行
```

所有npm脚本都通过`cross-env`实现了跨平台支持，无需在Windows、macOS或Linux之间修改命令，环境变量会自动按照对应系统的方式设置。

#### 5.2 分开启动（可选）
```bash
# 终端1：启动后端
node server/index.js

# 终端2：访问前端
# 在浏览器中打开 http://localhost:3000
```

### 6. 验证开发环境

#### 6.1 检查后端
```bash
# 验证API健康检查
curl http://localhost:3000/api/health

# 应该返回：
# { "status": "ok" }
```

#### 6.2 检查前端
- 打开浏览器访问 http://localhost:3000
- 应该看到AI工作流工作室界面

#### 6.3 检查Python执行能力
- 在工作流中让某个角色生成Python代码
- 点击执行按钮
- 应该成功执行并显示结果（不是HTML错误页）

#### 6.4 检查Socket.IO连接
- 打开浏览器开发者工具（F12）
- 查看Console标签
- 应该看到Socket.IO连接日志
- 示例：`[Socket.IO] Connected to server`

### 7. 常见问题排查

#### Q: 启动时出现 "port already in use" 错误
A:
- 检查3000端口是否被占用
- 修改 `.env` 中的 PORT 为其他值（如3001）
- 或关闭占用该端口的其他应用

#### Q: Python代码执行失败，显示 "python: command not found"
A:
- Python没有正确安装或PATH配置有问题
- 重新安装Python
- Windows: 确保勾选"Add Python to PATH"
- Linux/Mac: 可能需要用 `python3` 代替 `python`

#### Q: Node模块依赖缺失
A:
```bash
# 清空node_modules并重新安装
rm -rf node_modules package-lock.json
npm install
```

#### Q: Socket.IO连接失败
A:
- 检查后端是否正常运行
- 检查 `.env` 中的Socket URLs是否正确
- 检查浏览器控制台是否有错误信息
- 尝试清空浏览器缓存并刷新

#### Q: 前端无法访问后端API
A:
- 检查 `.env` 中的 CORS_ORIGINS 配置
- 确保CORS配置包含你的前端地址
- 重启后端服务器

### 8. 开发工具建议

**推荐的IDE/编辑器：**
- Visual Studio Code (推荐)
- WebStorm
- Sublime Text
- Vim/Neovim

**推荐的VS Code扩展：**
- ESLint
- Prettier
- Python (by Microsoft)
- Thunder Client 或 REST Client (API测试)
- Socket.IO Client Debug (查看Socket事件)

### 9. 调试技巧

#### 9.1 后端调试
```bash
# 启用详细日志
DEBUG=* npm start

# 或使用Node.js调试器
node --inspect server/index.js
```

#### 9.2 前端调试
- 打开浏览器开发者工具 (F12)
- 查看Console标签的日志
- 查看Network标签的API请求
- 使用Source标签设置断点

#### 9.3 Python执行调试
- 在浏览器Console中查看Python执行错误
- 检查 `/api/execute-python` 端点的响应
- 查看Python错误输出信息

### 10. 快速参考

**常用命令：**
```bash
# 启动开发服务器
npm start

# 安装依赖
npm install

# 清空缓存
npm cache clean --force

# 检查Python
python3 --version

# 检查端口占用 (Linux/Mac)
lsof -i :3000

# 检查端口占用 (Windows)
netstat -ano | findstr :3000
```

### 11. 首次开发检查清单

- ☑ Node.js 已安装 (v16+)
- ☑ Python 已安装 (3.8+)
- ☑ npm 依赖已安装 (`npm install`)
- ☑ `.env` 文件已创建
- ☑ 后端启动成功 (`npm start`)
- ☑ 前端可访问 (http://localhost:3000)
- ☑ API健康检查通过
- ☑ Socket.IO 已连接
- ☑ Python执行功能可用

### 12. 后续步骤

- 查看 `DEVELOPER_NOTES.md` 了解项目架构
- 查看 `README.md` 了解功能概述
- 查看 `server/README.md` 了解后端结构
- 查看各功能的文档说明

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Python >= 3.8.0 (required for code execution)

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

This command executes the `start:prod` script, which uses `cross-env` to ensure cross-platform compatibility with environment variables (Windows, macOS, and Linux).

## Accessing the Application

Once the server is running, open your browser and navigate to:

```
http://localhost:3000
```

The application will serve the single-page UI from the `public` directory.

### Cross-Platform Environment Variables

This project uses `cross-env` to ensure npm scripts work correctly on Windows, macOS, and Linux. All scripts that set environment variables are automatically handled:

```bash
# Development (Windows, macOS, Linux)
npm run dev       # Starts with NODE_ENV=development

# Production (Windows, macOS, Linux)
npm start         # Starts with NODE_ENV=production
```

No manual configuration needed! The `cross-env` package automatically detects your operating system and sets environment variables using the correct syntax for each platform.

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
│   │   └── python-output/    # 🐍 Generated files from Python execution
│   ├── routes/               # REST API routes
│   │   ├── workflows.js      # Workflow CRUD endpoints
│   │   ├── roles.js          # Role CRUD endpoints
│   │   ├── prompts.js        # Prompt CRUD endpoints
│   │   ├── settings.js       # Settings CRUD endpoints
│   │   └── pythonExecution.js # 🐍 Python code execution API
│   ├── utils/                # Utility modules
│   │   ├── jsonStore.js      # JSON file storage with caching
│   │   ├── validators.js     # Data validation
│   │   ├── pythonExecutor.js # 🐍 Python code execution engine
│   │   └── fileManager.js    # 🐍 File management system
│   └── middleware/           # Express middleware
│       ├── errorHandler.js   # Error handling
│       └── requestLogger.js  # Request logging
├── public/
│   ├── index.html            # Single-page application UI with Python execution integration
│   ├── test-python-execution.html # 🐍 Python execution test page
│   └── js/
│       ├── apiClient.js      # API client with offline support
│       └── socketClient.js   # Socket.IO client
├── package.json              # Node.js dependencies and scripts
├── .gitignore                # Git ignore rules
├── README.md                 # This file
├── DEVELOPER_NOTES.md        # Technical documentation
├── JSON_STORAGE_API_SUMMARY.md  # API documentation
├── PYTHON_EXECUTION_SANDBOX.md  # 🐍 Python sandbox feature documentation
└── PYTHON_SANDBOX_IMPLEMENTATION.md  # 🐍 Python sandbox implementation details
```

**🐍 Python Execution Components**:
- `pythonExecutor.js`: Core execution engine with timeout and security
- `fileManager.js`: File lifecycle management with auto-cleanup
- `pythonExecution.js`: REST API endpoints for code execution and file downloads
- `test-python-execution.html`: Comprehensive testing interface
- Integration points in `index.html` for automatic code detection and UI panels

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

### 🐍 Python Execution Endpoints

#### Execute Python Code
```
POST /api/execute-python/execute
```
Execute Python code with security constraints and file generation support.

#### Download Generated File
```
GET /api/execute-python/download/:fileId
```
Download a file generated by Python code execution.

#### Get File Information
```
GET /api/execute-python/file/:fileId
```
Retrieve metadata about a generated file.

#### Extract Code from Message
```
POST /api/execute-python/extract-code
```
Extract and identify Python code blocks from text messages.

#### Get Execution Statistics
```
GET /api/execute-python/stats
```
Get statistics about generated files and system usage.

#### Delete File
```
DELETE /api/execute-python/file/:fileId
```
Manually delete a generated file before auto-cleanup.

See `server/README.md` for detailed API documentation.

## Python Code Execution Sandbox 🐍

The application includes a secure Python code execution sandbox that allows AI roles (especially editors) to generate and execute Python code, create files, and provide downloadable outputs.

### 🌟 Core Features

- **🔒 Secure Code Execution**: Safe execution environment with timeout (30s) and output limits (1MB)
- **📁 File Generation**: Create and download files (Markdown, CSV, JSON, HTML, etc.)
- **🤖 Automatic Detection**: Code blocks are automatically detected in role messages
- **🎯 User-Friendly Interface**: Execute code with a single click in the UI
- **⚡ Real-time Feedback**: View execution results, errors, and execution time
- **🔄 Process Isolation**: Each execution runs in a separate Python process
- **🧹 Auto Cleanup**: Generated files automatically expire after 24 hours

### 🎯 Application Scenarios

#### Scenario 1: Editor Generates Project Documents
**Perfect for**: Project planning, requirement documents, meeting records, execution plans

When editors complete content writing, they can execute Python scripts to automatically generate formatted MD documents that users can directly download.

**Example Workflow**:
1. Editor role writes content about project phases
2. Python script formats and structures the content
3. Professional Markdown document is generated
4. User downloads the ready-to-use document

#### Scenario 2: Data Analysis & Export
**Perfect for**: Data statistics, report generation, data export, team analytics

Team-collected data can be analyzed and formatted through Python scripts, supporting exports to CSV, JSON, and other formats.

**Example Workflow**:
1. Collect task completion data from team members
2. Python script analyzes and processes the data
3. Generate comprehensive CSV reports and JSON summaries
4. Download formatted reports for stakeholder review

#### Scenario 3: Code Examples and Script Generation
**Perfect for**: Code validation, tool scripts, development examples, automation scripts

Developer roles can generate executable code examples that users can test and download as functional scripts.

**Example Workflow**:
1. Developer role creates utility scripts
2. User can execute to verify functionality
3. Download working scripts for local use
4. Modify and adapt for specific needs

### 📚 Usage Tutorial (Layered Structure)

#### 🚀 Quick Start (3 Steps)

```
📝 Write Code → ▶️ Execute → 📥 Download
```

1. **Role generates Python code** in standard code blocks
2. **Click Execute button** that appears below the message
3. **Download generated files** from the results panel

#### 📖 Detailed Workflow

**Step 1: Role Generates Python Code** 

AI roles can include Python code in their messages using standard Markdown code blocks:

```python
# Code format requirement: ```python ... ```
content = """# Project Plan

## Phase 1
- Requirements analysis
- Solution design

## Phase 2  
- Development implementation
- Testing and validation
"""

with open('project_plan.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Document generated: project_plan.md")
```

**Step 2: Frontend Recognition and Execution**

When a role message contains Python code:
1. **Automatic Detection**: System automatically identifies ```python code blocks
2. **Execution Panel**: Appears below the message containing:
   - 🟢 **Execute Button**: Triggers code execution
   - 📋 **Copy Button**: Copies code to clipboard
   - ⭐ **Favorite Button**: Saves code snippet for later use
3. **Visual Layout**: 
   ```
   ┌─────────────────────────────────────┐
   │        Python Code Block            │
   │    [syntax-highlighted code]        │
   └─────────────────────────────────────┘
   ┌─────────────────────────────────────┐
   │ [▶️ Execute] [📋 Copy] [⭐ Favorite] │
   └─────────────────────────────────────┘
   ```

**Step 3: View Execution Results**

After execution, the results panel displays:

```
┌─────────────────────────────────────────────────────┐
│ 🟢 Execution Status: Success                         │
│ ⏱️  Execution Time: 0.234s                          │
│                                                     │
│ 📤 Standard Output:                                 │
│ ✅ Document generated: project_plan.md               │
│                                                     │
│ 📁 Generated Files:                                  │
│ 📄 project_plan.md [📥 Download] (1.2KB)            │
└─────────────────────────────────────────────────────┘
```

**Components**:
- **🟢 Execution Status**: ✅ Success or ❌ Failed
- **📤 Output Log**: Standard output (stdout)
- **⚠️ Error Information**: Any errors and warnings
- **⏱️ Execution Time**: Code running duration
- **📁 File List**: All generated files with download links

**Step 4: Download Files**

In the generated files list:
1. **Locate target file** in the file list
2. **Click filename or download button** to download
3. **Supported formats**: MD, TXT, CSV, JSON, PDF, HTML, etc.
4. **Visual Layout**:
   ```
   📁 Generated Files (3 files)
   ┌─────────────────────────────────────┐
   │ 📄 plan.md        [📥 Download] 2.1KB │
   │ 📊 data.csv       [📥 Download] 856B  │
   │ 📋 config.json    [📥 Download] 1.3KB │
   └─────────────────────────────────────┘
   ```

#### 💡 Common Code Examples

**Example 1: Generate Markdown Document**
```python
# Generate project planning document
content = """# AI Workflow Studio - Project Planning

## Project Overview
- Version: 2.2
- Team: 5 developers
- Duration: 8 weeks

## Feature List
- ✅ Workflow templates
- ✅ Role management
- ✅ Python execution sandbox
- 🔄 Real-time collaboration
"""

with open('planning.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Planning document generated")
```

**Example 2: Export to CSV**
```python
import csv

data = [
    ['Task', 'Status', 'Priority', 'Assignee'],
    ['Feature 1', 'In Progress', 'High', 'Alice'],
    ['Feature 2', 'To Start', 'Medium', 'Bob'],
    ['Bug Fix', 'Completed', 'High', 'Charlie'],
]

with open('tasks.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerows(data)

print("✅ CSV file generated with", len(data)-1, "tasks")
```

**Example 3: Generate JSON Data**
```python
import json
import datetime

project_data = {
    'project': 'AI Workflow Studio',
    'version': '2.2',
    'last_updated': datetime.datetime.now().isoformat(),
    'features': [
        {'name': 'Workflow Templates', 'status': 'complete'},
        {'name': 'Role Management', 'status': 'complete'},
        {'name': 'Python Sandbox', 'status': 'complete'},
        {'name': 'Real-time Sync', 'status': 'in_progress'}
    ],
    'team': {
        'size': 5,
        'lead': 'Project Manager',
        'developers': 4
    }
}

with open('project.json', 'w', encoding='utf-8') as f:
    json.dump(project_data, f, ensure_ascii=False, indent=2)

print("✅ Project data exported to JSON")
```

### 🎨 Visual Workflow & UI Layout

#### Complete Execution Workflow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Role       │    │   Frontend      │    │   Backend       │
│                 │    │                 │    │                 │
│ 📝 Generates    │───▶│ 🤖 Auto-Detect │───▶│ 🔒 Execute      │
│ Python Code     │    │ Code Blocks     │    │ in Sandbox      │
│ in ```python``` │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │ 📋 Show UI      │    │ 📁 Generate     │
│ ✅ Print Output │    │ Execution Panel │    │ Files           │
│ & Success Msg   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ 📥 Provide      │
                                              │ Download Links  │
                                              │ & Results       │
                                              └─────────────────┘
```

#### UI Component Layout

**Message with Python Code**:
```
┌─────────────────────────────────────────────────────────┐
│ 🤖 Editor Role                                           │
│                                                         │
│ I'll generate a project plan document for you:         │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ```python                                           │ │
│ │ # Generate project plan                              │ │
│ │ content = """# Project Plan..."""                   │ │
│ │ with open('plan.md', 'w') as f:                     │ │
│ │     f.write(content)                                │ │
│ │ print("✅ Plan generated")                          │ │
│ │ ```                                                 │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🐍 Python Execution Panel                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [▶️ Execute] [📋 Copy] [⭐ Favorite] [🔄 Reset]     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**After Execution - Results Panel**:
```
┌─────────────────────────────────────────────────────────┐
│ 🟢 Execution Status: Success (0.234s)                    │
│                                                         │
│ 📤 Standard Output:                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✅ Plan generated                                    │ │
│ │ 📄 File: plan.md (1,247 bytes)                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 📁 Generated Files (1 file):                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📄 plan.md        [📥 Download] 1.2KB  2024-01-15  │ │
│ │ [🗑️ Delete] [👁️ Preview] [📋 Copy Path]           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ⚡ Performance: CPU 12% | Memory 8MB                    │
└─────────────────────────────────────────────────────────┘
```

#### 4-Step User Journey

```
Step 1: 📝 Code Generation           Step 2: ▶️ Execution
┌─────────────────────┐            ┌─────────────────────┐
│ Role writes Python  │            │ User clicks         │
│ code in message     │───────────▶│ Execute button      │
│ ```python...```    │            │                     │
└─────────────────────┘            └─────────────────────┘

           ↓                                   ↓
Step 3: 📊 View Results               Step 4: 📥 Download
┌─────────────────────┐            ┌─────────────────────┐
│ System shows        │            │ User downloads      │
│ execution results   │───────────▶│ generated files     │
│ and file list       │            │                     │
└─────────────────────┘            └─────────────────────┘
```

#### Icon Legend

| Icon | Meaning | Context |
|------|---------|---------|
| 🐍 | Python/Code Block | Code identification |
| ▶️ | Execute | Run code button |
| 📋 | Copy | Copy to clipboard |
| ⭐ | Favorite | Save code snippet |
| 🟢 | Success | Successful execution |
| ❌ | Error | Failed execution |
| ⏱️ | Time | Execution duration |
| 📤 | Output | Standard output |
| 📁 | Files | File list/management |
| 📥 | Download | Download file |
| 🗑️ | Delete | Remove file |
| 🔒 | Security | Sandbox protection |
| ⚡ | Performance | Speed/resources |

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

### 🔒 Security Features & Limitations

#### Security Measures

**🛡️ Execution Protection**
- **⏱️ Timeout Protection (30 seconds)**: Prevents infinite loops and long-running processes
- **📊 Output Limitation (1MB)**: Prevents memory overflow from excessive output
- **🔄 Process Isolation**: Each execution runs in a separate Python process
- **📁 File System Isolation**: Generated files stored in dedicated directory with unique IDs
- **🧹 Automatic Cleanup**: Files older than 24 hours are automatically deleted
- **⚠️ Error Containment**: All errors caught and returned safely

#### Configuration Limits

```bash
# Default security limits (configurable via environment variables)
PYTHON_TIMEOUT=30000          # 30 seconds execution timeout
PYTHON_MAX_OUTPUT=1048576     # 1MB output limit
PYTHON_OUTPUT_DIR=./data/python-output  # Isolated output directory
```

#### Supported File Formats

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

### 🆘 Troubleshooting & FAQ

#### **Q: Code doesn't have an execute button?**
**A: Check these items:**
1. ✅ Verify code format is exactly ````python ... ````
2. 🔍 Check browser console for JavaScript errors (F12)
3. 🎯 Ensure message is from a role (not user message)
4. 🔄 Clear browser cache and reload the page

#### **Q: Execution failed?**
**A: Follow these steps:**
1. 📋 Review error information in the results panel
2. 🔍 Check code syntax for typos or missing imports
3. 📁 Verify file write paths are valid
4. ⚡ Ensure code completes within 30-second timeout

#### **Q: Can't download generated files?**
**A: Try these solutions:**
1. 👀 Check if files appear in the file list
2. 📊 Verify success message in stdout output
3. 🔧 Check server has write permissions: `ls -la server/data/python-output/`
4. 💾 Check browser download history

#### **Q: Python execution is slow?**
**A: Optimize your code:**
1. 🚀 Profile code to find bottlenecks
2. 📊 Reduce data processing size
3. ⚡ Avoid heavy I/O operations
4. 🔄 Break large operations into smaller chunks

#### **Q: Getting timeout errors?**
**A: Time management tips:**
1. ⏱️ Optimize algorithms for speed
2. 🔄 Process data in smaller batches
3. 🚫 Avoid infinite loops or blocking operations
4. ⚙️ Consider increasing timeout (requires server config)

#### **Q: Permission denied errors?**
**A: Check system permissions:**
1. 🔐 Verify server process has write permissions
2. 📁 Ensure output directory exists and is writable
3. 💾 Check available disk space: `df -h`
4. 👤 Review server user permissions

#### **Q: Module import errors?**
**A: Python environment checks:**
1. 🐍 Verify Python 3 is installed: `python3 --version`
2. 📦 Install required packages on server
3. 🔧 Use only standard library modules for compatibility
4. 🌐 Check Python version compatibility

### 🧪 Testing

A comprehensive test page is available at:
```
http://localhost:3000/test-python-execution.html
```

**Test Features**:
- **🚀 Basic Execution**: Test simple Python code
- **📁 File Generation**: Test file creation and download
- **⚠️ Error Handling**: Test error capture and display
- **🔍 Code Extraction**: Test code block detection
- **⚡ Performance**: Test execution speed
- **⏱️ Timeout Protection**: Test timeout handling

### 📋 Best Practices

#### For AI Roles
1. **📤 Clear Output**: Always print confirmation messages when files are generated
2. **⚠️ Error Handling**: Use try-except blocks for robust code
3. **📝 File Naming**: Use descriptive file names
4. **📖 Documentation**: Add comments to explain complex logic
5. **✅ Validation**: Validate inputs before processing

#### For Users
1. **👀 Review Code**: Always review code before executing
2. **📊 Check Results**: Verify stdout/stderr for any issues
3. **📥 Download Files**: Download important files immediately
4. **🧹 Clean Up**: Delete unnecessary files to save space
5. **🐛 Report Issues**: Check logs if something goes wrong

### ⚙️ Configuration

Configure the Python sandbox using environment variables:

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

### 🚧 Limitations

- **🐍 Python Version**: Uses system default Python 3.x
- **📦 Libraries**: Only system-installed packages available
- **📁 File System**: Cannot modify files outside output directory
- **🌐 Network**: Internet access depends on system configuration
- **⏱️ Execution Time**: Maximum 30 seconds per execution
- **📊 Output Size**: Maximum 1MB combined stdout/stderr

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

## 平台部署

本项目内置了 Railway 与 Render 的全栈部署配置文件（`railway.json` 与 `render.yaml`），可将 Express + Socket.IO 服务器与静态资源一键发布到托管平台。

### Railway 部署步骤

1. 在 Railway 中导入 GitHub 仓库，选择使用仓库根目录的 `railway.json` 自动生成服务。
2. 在 **Variables** 中根据 `.env.example` 配置以下变量：`PORT`、`HOST`、`NODE_ENV`、`CORS_ORIGINS`、`SOCKET_ALLOWED_ORIGINS`、`DATA_DIR`、`PUBLIC_API_URL`、`PUBLIC_SOCKET_URL`。
3. 在 **Volumes** 中创建名为 `workflow-data` 的持久化卷，并挂载到 `/app/server/data`，用于保存 JSON 数据文件。
4. 确认构建命令为 `npm install`、启动命令为 `npm start`，并保留健康检查路径 `/health`。
5. 部署完成后访问 `https://your-railway-app.up.railway.app/health` 验证状态码为 200，并在浏览器中确认 Socket.IO 指示灯为"Online"。

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

## License

ISC
