# Python代码执行沙箱功能文档

## 概述

AI工作流工作室现已集成Python代码执行沙箱功能，允许角色（特别是编辑员）生成和执行Python代码，生成文件，并提供下载功能。

## 核心功能

### 1. 后端Python执行引擎

#### 位置
- `server/utils/pythonExecutor.js` - Python代码执行器
- `server/utils/fileManager.js` - 文件管理系统
- `server/routes/pythonExecution.js` - API路由

#### 特性
- ✅ 安全的沙箱执行（超时控制、资源限制）
- ✅ 完整的stdin/stdout/stderr捕获
- ✅ 自动文件检测和管理
- ✅ 执行时间统计
- ✅ 过期文件自动清理

#### 配置参数
```javascript
{
  timeout: 30000,        // 执行超时时间（毫秒）
  maxOutput: 1048576,    // 最大输出限制（字节）
  pythonPath: 'python3'  // Python可执行文件路径
}
```

### 2. API端点

#### `/api/execute-python/execute` (POST)
执行Python代码

**请求体:**
```json
{
  "code": "print('Hello, World!')",
  "outputDir": "/path/to/output" // 可选
}
```

**响应:**
```json
{
  "success": true,
  "exitCode": 0,
  "stdout": "执行的标准输出",
  "stderr": "执行的错误输出",
  "executionTime": 123,
  "files": [
    {
      "fileId": "unique-file-id",
      "filename": "result.md",
      "size": 1024,
      "mimeType": "text/markdown",
      "downloadUrl": "/api/execute-python/download/unique-file-id"
    }
  ]
}
```

#### `/api/execute-python/download/:fileId` (GET)
下载生成的文件

**响应:** 文件内容（带正确的Content-Type和Content-Disposition）

#### `/api/execute-python/extract-code` (POST)
从消息中提取Python代码块

**请求体:**
```json
{
  "message": "消息内容"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "hasCode": true,
    "codeBlocks": [
      {
        "type": "python",
        "code": "代码内容"
      }
    ],
    "directive": null
  }
}
```

#### `/api/execute-python/file/:fileId` (GET)
获取文件信息

#### `/api/execute-python/stats` (GET)
获取文件统计信息

#### `/api/execute-python/file/:fileId` (DELETE)
删除生成的文件

### 3. 角色代码格式

#### 标准代码块格式
角色可以在消息中包含标准Markdown代码块：

```python
# 这是Python代码
def hello():
    print("Hello, World!")

hello()
```

系统会自动识别并提供执行按钮。

#### JSON执行指令格式
角色也可以生成JSON格式的执行指令：

```json
{
  "action": "execute_python",
  "code": "print('自动执行')",
  "output_file": "result.md"
}
```

### 4. 前端集成

#### 自动代码检测
消息完成后（流式或批量模式），系统自动：
1. 检测消息中的Python代码块
2. 创建执行面板
3. 提供执行和复制按钮

#### 代码执行面板
- **代码显示** - 语法高亮显示
- **执行按钮** - 点击执行代码
- **复制按钮** - 复制代码到剪贴板
- **结果显示** - 显示执行结果和错误信息
- **文件下载** - 下载生成的文件

#### JavaScript API

**执行代码:**
```javascript
executePythonCode(codeId)
```

**复制代码:**
```javascript
copyPythonCode(codeId)
```

**执行指令:**
```javascript
executePythonDirective(directive, messageEl)
```

### 5. 编辑员特定实现

编辑员可以生成执行方案并将其导出为Markdown文件：

```python
# 编辑员可以生成如下代码
content = """# 项目执行方案

## 阶段1: 需求分析
- 明确项目目标
- 列举核心需求

## 阶段2: 实现
- 技术方案设计
- 资源配置
"""

# 保存为文件
with open('execution_plan.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 执行方案已生成")
```

## 安全性

### 保护机制

1. **超时控制** (30秒)
   - 防止无限循环
   - 自动终止超时的进程

2. **输出限制** (1MB)
   - 防止大量输出导致内存溢出
   - 自动截断过长输出

3. **资源隔离**
   - 使用 `child_process` 创建独立进程
   - 每个代码执行都在独立的Python进程中

4. **文件隔离**
   - 文件生成在隔离目录中
   - 文件使用唯一ID标识
   - 过期文件自动清理

5. **错误处理**
   - 捕获所有错误信息
   - 不会因错误代码导致系统崩溃

### 注意事项

- 系统不执行包含危险操作的代码验证
- 依赖操作系统级别的进程隔离
- 生产环境建议额外的安全配置

## 使用示例

### 示例1: 基础代码执行

```python
# 简单的计算
result = sum([1, 2, 3, 4, 5])
print(f"总和: {result}")

# 生成报告
import datetime
print(f"生成时间: {datetime.datetime.now()}")
```

### 示例2: 文件生成

```python
# 生成Markdown文档
content = """# 数据分析报告

## 数据统计
- 总数: 1000
- 平均值: 500
- 标准差: 100

## 结论
数据分析完成
"""

# 保存文件
with open('report.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 报告已生成: report.md")
```

### 示例3: CSV数据导出

```python
import csv

# 生成示例数据
data = [
    ['姓名', '部门', '工资'],
    ['张三', '技术', '15000'],
    ['李四', '市场', '12000'],
    ['王五', '运营', '13000']
]

# 保存为CSV
with open('employees.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(data)

print("✅ CSV文件已生成: employees.csv")
```

## 调试和监控

### 控制台日志

系统会输出详细的调试日志：

```
[processPythonCodeInMessage] Processing message for Python code
[addPythonExecutionPanel] Adding code blocks: 1
[executePythonCode] Executing code: print("test")...
[executePythonCode] Execution result: {...}
```

### 浏览器开发者工具

在浏览器F12开发者工具的Console中可以看到：
- 代码提取过程
- API调用情况
- 执行结果详情

### 服务器日志

```
[Python Execution] Executing code: print("test")...
[Python Executor] Executing code: ...
[FileManager] File saved: {...}
```

## 测试

访问 `/public/test-python-execution.html` 进行功能测试：

- 执行简单Python代码
- 测试文件生成
- 错误处理测试
- 代码提取测试
- 性能测试
- 超时保护测试

## 文件管理

### 文件位置

生成的文件默认存储在：
```
{dataDir}/python-output/
```

### 文件命名

文件使用唯一ID命名：
```
{timestamp}-{random}-{hash}-{filename}
```

### 文件清理

- 系统每小时自动清理24小时前的文件
- 手动删除: `DELETE /api/execute-python/file/:fileId`

## 性能指标

### 典型执行时间

- 简单脚本: 50-200ms
- 文件生成: 100-300ms
- 复杂计算: 500-2000ms
- 受超时保护: 最多30秒

### 输出容量

- 标准输出限制: 1MB
- 超出限制自动截断
- 文件大小无限制

## 故障排除

### 问题: Python代码不执行

**检查**:
1. Python是否已安装: `which python3`
2. API是否启动: 访问 `/api/health`
3. 浏览器控制台错误信息
4. 服务器日志

### 问题: 文件无法下载

**检查**:
1. 文件是否确实生成
2. 文件ID是否正确
3. 检查服务器文件系统权限

### 问题: 代码执行超时

**优化**:
1. 减少计算量
2. 使用更高效的算法
3. 避免无限循环

## 环境变量配置

```bash
# Python可执行路径（可选）
PYTHON_PATH=python3

# 输出目录（可选）
PYTHON_OUTPUT_DIR=/tmp/python-output

# 执行超时（毫秒）
PYTHON_TIMEOUT=30000

# 最大输出（字节）
PYTHON_MAX_OUTPUT=1048576
```

## API集成示例

### 使用Fetch API执行代码

```javascript
const response = await fetch('/api/execute-python/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        code: 'print("Hello, World!")'
    })
});

const result = await response.json();
console.log('输出:', result.stdout);
console.log('错误:', result.stderr);
console.log('成功:', result.success);
```

### 提取代码块

```javascript
const response = await fetch('/api/execute-python/extract-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: '消息内容包含代码块'
    })
});

const result = await response.json();
console.log('发现代码:', result.data.hasCode);
console.log('代码块:', result.data.codeBlocks);
```

## 限制和注意事项

1. **Python版本** - 系统使用系统默认的Python版本
2. **第三方库** - 只能使用系统已安装的库
3. **文件系统** - 只能生成文件，不能修改系统文件
4. **网络访问** - 代码可以进行网络请求
5. **执行权限** - 限制在用户权限范围内

## 后续改进

- [ ] 支持选择Python版本（2/3）
- [ ] 支持安装第三方库
- [ ] 代码版本控制
- [ ] 执行历史记录
- [ ] 代码模板库
- [ ] 实时代码编辑器
- [ ] 多语言支持（JavaScript、Ruby等）

## 相关文档

- [API文档](./server/README.md)
- [前端测试页面](/public/test-python-execution.html)
- [配置文档](./DEPLOYMENT.md)
