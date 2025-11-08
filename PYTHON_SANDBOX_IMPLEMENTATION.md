# Python代码执行沙箱实现详解

## 实现概述

本实现为AI工作流工作室添加了完整的Python代码执行沙箱功能。用户可以：
1. 在角色消息中包含Python代码
2. 通过前端界面执行代码
3. 查看执行结果和错误信息
4. 下载生成的文件

## 核心架构

### 后端架构

```
server/
├── utils/
│   ├── pythonExecutor.js      # Python代码执行引擎
│   └── fileManager.js         # 文件管理系统
├── routes/
│   └── pythonExecution.js     # Python执行API路由
└── index.js                   # 集成点
```

### 前端架构

```
public/
├── index.html                 # 主要前端代码
│   ├── processPythonCodeInMessage()      # 消息处理
│   ├── executePythonCode()               # 代码执行
│   ├── copyPythonCode()                  # 代码复制
│   └── executePythonDirective()          # 指令执行
└── test-python-execution.html # 测试页面
```

## 实现细节

### 1. Python执行器 (pythonExecutor.js)

**核心功能:**
- 使用 `child_process.spawn()` 启动Python进程
- 捕获stdout/stderr输出
- 实现超时控制（30秒）
- 检测生成的文件

**关键特性:**
```javascript
// 执行代码的主要接口
async executeCode(code, options = {}) {
    // 验证代码
    // 创建输出目录
    // 启动Python进程
    // 监听输出
    // 处理超时
    // 检测生成的文件
    // 返回结果
}
```

**代码提取:**
```javascript
// 从消息中提取Python代码块（```python ... ```）
extractPythonCodeBlocks(message)

// 从消息中提取JSON执行指令
extractExecutionDirective(message)
```

### 2. 文件管理器 (fileManager.js)

**核心功能:**
- 生成唯一的文件ID
- 保存生成的文件
- 追踪文件元数据
- 清理过期文件
- 提供文件下载

**关键接口:**
```javascript
// 保存文件并返回文件信息
async saveGeneratedFile(content, filename)

// 获取文件内容
async getFileContent(fileId)

// 清理24小时前的过期文件
async cleanupExpiredFiles()
```

### 3. API路由 (pythonExecution.js)

**端点:**

| 方法 | 路由 | 功能 |
|------|------|------|
| POST | `/api/execute-python/execute` | 执行Python代码 |
| GET | `/api/execute-python/download/:fileId` | 下载生成的文件 |
| GET | `/api/execute-python/file/:fileId` | 获取文件信息 |
| POST | `/api/execute-python/extract-code` | 从消息中提取代码 |
| GET | `/api/execute-python/stats` | 获取执行统计 |
| DELETE | `/api/execute-python/file/:fileId` | 删除文件 |

### 4. 前端集成 (index.html)

**主要流程:**

```
角色发言完成
    ↓
finalizeStreamingMessage() / addMessage()
    ↓
processPythonCodeInMessage()
    ↓
API: /api/execute-python/extract-code
    ↓
addPythonExecutionPanel()
    ↓
渲染执行面板（代码块 + 执行按钮）
    ↓
用户点击执行
    ↓
executePythonCode() / executePythonDirective()
    ↓
API: /api/execute-python/execute
    ↓
显示结果和文件下载链接
```

**关键函数:**

```javascript
// 1. 处理消息中的Python代码
async processPythonCodeInMessage(messageEl, content)

// 2. 添加执行面板到消息
function addPythonExecutionPanel(messageEl, codeBlocks, directive)

// 3. 执行单个代码块
async function executePythonCode(codeId)

// 4. 执行指令
async function executePythonDirective(directive, messageEl)

// 5. 复制代码
function copyPythonCode(codeId)
```

## 数据流

### 执行流程

```
消息 → 提取代码块 → 显示在UI中 → 用户点击执行 → 后端执行 → 返回结果 → 显示结果和文件
```

### 请求/响应格式

**执行请求:**
```json
{
  "code": "print('Hello')"
}
```

**执行响应:**
```json
{
  "success": true,
  "exitCode": 0,
  "stdout": "Hello\n",
  "stderr": "",
  "executionTime": 123,
  "files": [
    {
      "fileId": "123-abc-def-file.txt",
      "filename": "file.txt",
      "size": 1024,
      "mimeType": "text/plain",
      "downloadUrl": "/api/execute-python/download/123-abc-def-file.txt"
    }
  ]
}
```

## 使用示例

### 示例1: 编辑员生成Markdown执行方案

```python
# 编辑员的角色提示可以包含类似代码

content = """# 项目执行方案

## 阶段1: 需求分析
- 明确项目目标
- 列举核心需求

## 阶段2: 实现
- 技术方案设计
- 资源配置

## 结论
执行方案制定完成
"""

# 保存为Markdown文件
with open('project_plan.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 项目执行方案已生成: project_plan.md")
```

当编辑员角色发言时，系统会：
1. 识别代码块
2. 显示"执行"和"复制"按钮
3. 用户可点击"执行"生成文件
4. 显示文件下载链接

### 示例2: 数据分析和导出

```python
import csv
import json

# 生成CSV数据
data = [
    ['名称', '数值'],
    ['项目A', '100'],
    ['项目B', '200'],
]

with open('report.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerows(data)

# 同时生成JSON
json_data = {
    'projects': [
        {'name': '项目A', 'value': 100},
        {'name': '项目B', 'value': 200},
    ]
}

with open('report.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=2)

print("✅ 报告已生成: report.csv, report.json")
```

## 集成点

### 1. 服务器启动 (server/index.js)

```javascript
// 导入路由
const createPythonExecutionRouter = require('./routes/pythonExecution');

// 集成路由
app.use('/api/execute-python', createPythonExecutionRouter(jsonStore, dataDir));
```

### 2. 消息完成处理 (index.html)

**流式模式:**
```javascript
// 在 finalizeStreamingMessage() 中
processPythonCodeInMessage(messageEl, content);
```

**批量模式:**
```javascript
// 在 addMessage() 中
if (type === 'role' && state.outputMode === 'batch') {
    setTimeout(() => {
        processPythonCodeInMessage(messageEl, data.content);
    }, 100);
}
```

## 安全考虑

### 已实现的安全措施

1. **进程隔离** - 每次执行都在独立的Python进程中
2. **超时保护** - 30秒超时限制
3. **输出限制** - 1MB输出限制
4. **文件隔离** - 文件生成在隔离目录中
5. **错误处理** - 不会因错误代码导致系统崩溃
6. **文件清理** - 自动清理过期文件

### 生产环境建议

```bash
# 1. 使用专用用户运行应用
# 2. 使用Docker或VM隔离环境
# 3. 配置resource limits
# 4. 启用审计日志
# 5. 限制可执行的代码操作
# 6. 定期更新Python版本
# 7. 监控磁盘空间
```

## 性能优化

### 已实现的优化

1. **异步处理** - 所有I/O操作都是异步的
2. **资源限制** - 输出限制防止内存溢出
3. **事件节流** - UI更新进行了优化
4. **文件清理** - 定期清理过期文件

### 进一步的优化建议

```javascript
// 1. 代码执行缓存
// 2. 执行结果缓存
// 3. 批量执行支持
// 4. 进程池管理
// 5. 执行历史记录
```

## 测试

### 自动化测试文件

访问 `/public/test-python-execution.html` 进行以下测试：

1. **简单代码执行** - 验证基础执行功能
2. **文件生成** - 验证文件创建和下载
3. **错误处理** - 验证错误捕获
4. **代码提取** - 验证代码块识别
5. **性能测试** - 验证执行性能
6. **超时测试** - 验证超时保护

### 手动测试流程

```
1. 启动服务器: npm start
2. 打开浏览器: http://localhost:3000
3. 访问测试页面: http://localhost:3000/public/test-python-execution.html
4. 执行各个测试用例
5. 检查开发者工具日志
6. 查看服务器日志
```

## 调试

### 启用详细日志

所有日志都以 `[组件名]` 前缀开头：

```javascript
// 前端日志
[processPythonCodeInMessage] Processing message for Python code
[executePythonCode] Executing code: ...
[executePythonDirective] Result: ...

// 后端日志
[Python Execution] Executing code: ...
[FileManager] File saved: ...
[Python Executor] Process ended with exit code: ...
```

### 常见问题排查

| 问题 | 症状 | 解决方案 |
|------|------|---------|
| Python不存在 | 404错误 | 检查Python路径：`which python3` |
| 权限错误 | 500错误 | 检查文件系统权限 |
| 磁盘满 | 文件保存失败 | 检查磁盘空间 |
| 代码未显示 | 看不到执行按钮 | 检查代码块格式 |
| 文件无法下载 | 下载失败 | 检查文件是否存在 |

## 扩展性

### 添加新的代码语言支持

```javascript
// 创建类似pythonExecutor的执行器
class JavaScriptExecutor {
    async executeCode(code) { ... }
}

// 在API中添加支持
router.post('/execute', async (req, res) => {
    const { code, language } = req.body;
    let executor;
    
    if (language === 'javascript') {
        executor = new JavaScriptExecutor();
    } else {
        executor = new PythonExecutor();
    }
    
    const result = await executor.executeCode(code);
    res.json(result);
});
```

### 添加代码版本控制

```javascript
// 保存代码执行历史
const executionHistory = [];

function recordExecution(code, result) {
    executionHistory.push({
        timestamp: Date.now(),
        code,
        result,
        userId: getCurrentUser()
    });
}
```

## 相关文件

- `server/utils/pythonExecutor.js` - Python执行引擎
- `server/utils/fileManager.js` - 文件管理系统
- `server/routes/pythonExecution.js` - API路由
- `public/index.html` - 前端集成
- `public/test-python-execution.html` - 测试页面
- `PYTHON_EXECUTION_SANDBOX.md` - 功能文档

## 版本信息

- **实现日期**: 2024
- **Python版本**: 3.x+
- **Node.js版本**: 16.0.0+
- **依赖**: 仅使用Node.js内置模块（child_process、fs等）

## 许可证

与主项目保持一致
