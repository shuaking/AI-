const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class PythonExecutor {
  constructor(options = {}) {
    this.timeout = options.timeout || 30000; // 30秒超时
    this.maxOutput = options.maxOutput || 1024 * 1024; // 1MB输出限制
    this.pythonPath = options.pythonPath || 'python3';
  }

  /**
   * 执行Python代码
   * @param {string} code - Python代码
   * @param {Object} options - 执行选项
   * @returns {Promise<Object>} - 执行结果
   */
  async executeCode(code, options = {}) {
    const startTime = Date.now();
    let process;
    let timeoutHandle;

    return new Promise((resolve) => {
      try {
        // 验证代码
        if (!code || typeof code !== 'string') {
          return resolve({
            success: false,
            error: 'Invalid code provided',
            stdout: '',
            stderr: '提供的代码无效',
            exitCode: -1,
            executionTime: 0,
            generatedFiles: []
          });
        }

        // 生成输出文件目录
        const outputDir = options.outputDir || path.join(os.tmpdir(), 'python-exec');
        
        // 创建输出目录
        fs.mkdir(outputDir, { recursive: true }).catch(err => {
          console.warn('[PythonExecutor] Failed to create output directory:', err);
        });

        // 添加输出目录到代码环境
        const enhancedCode = `import sys\nimport os\nos.makedirs('${outputDir}', exist_ok=True)\nsys.path.insert(0, '${outputDir}')\n${code}`;

        // 启动Python进程
        process = spawn(this.pythonPath, [], {
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: false,
          timeout: this.timeout
        });

        let stdout = '';
        let stderr = '';
        let generatedFiles = [];
        let processEnded = false;

        // 设置超时
        timeoutHandle = setTimeout(() => {
          if (!processEnded && process) {
            process.kill('SIGTERM');
            stderr += '\n[执行超时] Python代码执行超过 ' + (this.timeout / 1000) + ' 秒，已终止执行。';
          }
        }, this.timeout);

        // 监听stdout
        process.stdout.on('data', (data) => {
          const chunk = data.toString();
          if (stdout.length < this.maxOutput) {
            stdout += chunk;
          }
        });

        // 监听stderr
        process.stderr.on('data', (data) => {
          const chunk = data.toString();
          if (stderr.length < this.maxOutput) {
            stderr += chunk;
          }
        });

        // 进程结束事件
        process.on('close', async (exitCode) => {
          clearTimeout(timeoutHandle);
          processEnded = true;

          // 检查生成的文件
          try {
            const files = await fs.readdir(outputDir);
            generatedFiles = files.map(file => ({
              filename: file,
              path: path.join(outputDir, file)
            }));
          } catch (err) {
            console.warn('[PythonExecutor] Failed to read output directory:', err);
          }

          const executionTime = Date.now() - startTime;

          resolve({
            success: exitCode === 0,
            exitCode,
            stdout: stdout.length > this.maxOutput ? stdout.substring(0, this.maxOutput) + '\n[输出已截断]' : stdout,
            stderr: stderr.length > this.maxOutput ? stderr.substring(0, this.maxOutput) + '\n[错误已截断]' : stderr,
            executionTime,
            generatedFiles,
            outputDir
          });
        });

        // 进程错误事件
        process.on('error', (err) => {
          clearTimeout(timeoutHandle);
          processEnded = true;

          const executionTime = Date.now() - startTime;

          resolve({
            success: false,
            error: err.message,
            stdout,
            stderr: stderr + '\n' + err.message,
            exitCode: -1,
            executionTime,
            generatedFiles: [],
            outputDir: options.outputDir
          });
        });

        // 发送代码到stdin
        process.stdin.write(enhancedCode);
        process.stdin.end();

      } catch (err) {
        const executionTime = Date.now() - startTime;
        clearTimeout(timeoutHandle);
        
        resolve({
          success: false,
          error: err.message,
          stdout: '',
          stderr: err.message,
          exitCode: -1,
          executionTime,
          generatedFiles: [],
          outputDir: options.outputDir
        });
      }
    });
  }

  /**
   * 从消息中提取Python代码块
   * @param {string} message - 包含代码块的消息
   * @returns {Array<Object>} - 代码块数组
   */
  extractPythonCodeBlocks(message) {
    if (!message || typeof message !== 'string') {
      return [];
    }

    const blocks = [];
    
    // 匹配 ```python 代码块
    const pythonBlockRegex = /```python\n([\s\S]*?)```/g;
    let match;

    while ((match = pythonBlockRegex.exec(message)) !== null) {
      blocks.push({
        type: 'python',
        code: match[1].trim(),
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }

    // 如果没有找到python代码块，尝试匹配通用代码块
    if (blocks.length === 0) {
      const generalBlockRegex = /```\n([\s\S]*?)```/g;
      while ((match = generalBlockRegex.exec(message)) !== null) {
        const code = match[1].trim();
        // 检查是否看起来像Python代码
        if (this.looksLikePython(code)) {
          blocks.push({
            type: 'python',
            code,
            startIndex: match.index,
            endIndex: match.index + match[0].length
          });
        }
      }
    }

    return blocks;
  }

  /**
   * 检查代码是否看起来像Python代码
   * @param {string} code - 代码
   * @returns {boolean}
   */
  looksLikePython(code) {
    const pythonIndicators = [
      /^import\s+/m,
      /^from\s+\w+\s+import/m,
      /^def\s+\w+/m,
      /^class\s+\w+/m,
      /^if\s+__name__\s*==\s*['"]__main__['"]/m,
      /^for\s+\w+\s+in\s+/m,
      /^\s*print\(/m,
      /\.py\s*$/
    ];

    return pythonIndicators.some(indicator => indicator.test(code));
  }

  /**
   * 从JSON格式的执行指令中提取代码
   * @param {string} message - 消息
   * @returns {Object|null} - 执行指令或null
   */
  extractExecutionDirective(message) {
    if (!message || typeof message !== 'string') {
      return null;
    }

    try {
      // 查找JSON对象
      const jsonMatch = message.match(/\{[\s\S]*?"action"\s*:\s*"execute_python"[\s\S]*?\}/);
      if (!jsonMatch) {
        return null;
      }

      const directive = JSON.parse(jsonMatch[0]);
      if (directive.action === 'execute_python' && directive.code) {
        return directive;
      }
    } catch (err) {
      // 无效的JSON，忽略
    }

    return null;
  }
}

module.exports = PythonExecutor;
