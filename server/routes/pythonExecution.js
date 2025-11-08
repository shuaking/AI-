const express = require('express');
const router = express.Router();
const path = require('path');
const PythonExecutor = require('../utils/pythonExecutor');
const FileManager = require('../utils/fileManager');

function createPythonExecutionRouter(jsonStore, dataDir) {
  // 初始化Python执行器和文件管理器
  const pythonExecutor = new PythonExecutor({
    timeout: 30000,
    maxOutput: 1024 * 1024 // 1MB
  });

  const pythonOutputDir = path.join(dataDir, 'python-output');
  const fileManager = new FileManager(pythonOutputDir);
  
  // 初始化文件管理器
  fileManager.initialize().catch(err => {
    console.error('[Python Execution Router] Failed to initialize file manager:', err);
  });

  // 定期清理过期文件（每小时）
  setInterval(() => {
    fileManager.cleanupExpiredFiles().catch(err => {
      console.error('[Python Execution Router] Cleanup error:', err);
    });
  }, 60 * 60 * 1000);

  /**
   * POST /api/execute-python
   * 执行Python代码
   */
  router.post('/execute', async (req, res, next) => {
    try {
      const { code, outputDir: customOutputDir } = req.body;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Code must be a non-empty string'
        });
      }

      console.log('[Python Execution] Executing code:', code.substring(0, 100) + '...');

      // 执行代码
      const result = await pythonExecutor.executeCode(code, {
        outputDir: customOutputDir || pythonOutputDir
      });

      // 处理生成的文件
      const files = [];
      for (const fileInfo of result.generatedFiles) {
        try {
          const registeredFile = await fileManager.registerFile(
            fileInfo.path,
            fileInfo.filename
          );
          files.push({
            fileId: registeredFile.fileId,
            filename: registeredFile.filename,
            size: registeredFile.size,
            mimeType: registeredFile.mimeType,
            downloadUrl: `/api/execute-python/download/${registeredFile.fileId}`
          });
        } catch (err) {
          console.error('[Python Execution] Failed to register file:', err);
        }
      }

      res.json({
        success: result.success,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        executionTime: result.executionTime,
        files,
        error: result.error || null
      });

    } catch (error) {
      console.error('[Python Execution] Error:', error);
      next(error);
    }
  });

  /**
   * GET /api/execute-python/download/:fileId
   * 下载生成的文件
   */
  router.get('/download/:fileId', async (req, res, next) => {
    try {
      const { fileId } = req.params;

      const fileInfo = fileManager.getFileInfo(fileId);
      if (!fileInfo) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'File not found'
        });
      }

      console.log('[Python Execution] Downloading file:', fileId, fileInfo.filename);

      // 读取文件
      const content = await fileManager.getFileContent(fileId);
      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'File content not found'
        });
      }

      // 设置响应头
      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`);
      res.setHeader('Content-Length', fileInfo.size);

      res.send(content);
    } catch (error) {
      console.error('[Python Execution] Download error:', error);
      next(error);
    }
  });

  /**
   * GET /api/execute-python/file/:fileId
   * 获取文件信息
   */
  router.get('/file/:fileId', (req, res, next) => {
    try {
      const { fileId } = req.params;

      const fileInfo = fileManager.getFileInfo(fileId);
      if (!fileInfo) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        data: {
          fileId: fileInfo.fileId,
          filename: fileInfo.filename,
          size: fileInfo.size,
          mimeType: fileInfo.mimeType,
          createdAt: fileInfo.createdAt,
          downloadUrl: `/api/execute-python/download/${fileInfo.fileId}`
        }
      });
    } catch (error) {
      console.error('[Python Execution] File info error:', error);
      next(error);
    }
  });

  /**
   * GET /api/execute-python/stats
   * 获取执行统计信息
   */
  router.get('/stats', (req, res, next) => {
    try {
      const stats = fileManager.getStats();
      res.json({
        success: true,
        data: {
          totalFiles: stats.totalFiles,
          totalSize: stats.totalSize,
          totalSizeMB: (stats.totalSize / (1024 * 1024)).toFixed(2)
        }
      });
    } catch (error) {
      console.error('[Python Execution] Stats error:', error);
      next(error);
    }
  });

  /**
   * DELETE /api/execute-python/file/:fileId
   * 删除文件
   */
  router.delete('/file/:fileId', async (req, res, next) => {
    try {
      const { fileId } = req.params;

      const deleted = await fileManager.deleteFile(fileId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('[Python Execution] Delete error:', error);
      next(error);
    }
  });

  /**
   * POST /api/execute-python/extract-code
   * 从消息中提取Python代码块
   */
  router.post('/extract-code', (req, res, next) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Message must be a non-empty string'
        });
      }

      // 提取代码块
      const codeBlocks = pythonExecutor.extractPythonCodeBlocks(message);
      
      // 提取执行指令
      const directive = pythonExecutor.extractExecutionDirective(message);

      res.json({
        success: true,
        data: {
          codeBlocks,
          directive,
          hasCode: codeBlocks.length > 0 || directive !== null
        }
      });
    } catch (error) {
      console.error('[Python Execution] Extract code error:', error);
      next(error);
    }
  });

  return router;
}

module.exports = createPythonExecutionRouter;
