const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileManager {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.files = new Map(); // 内存中追踪文件映射
  }

  /**
   * 初始化文件管理器
   */
  async initialize() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (err) {
      console.error('[FileManager] Failed to initialize:', err);
    }
  }

  /**
   * 生成唯一的文件ID
   * @param {string} filename - 文件名
   * @returns {string} - 文件ID
   */
  generateFileId(filename = '') {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const hash = crypto.createHash('md5').update(filename + timestamp).digest('hex').substring(0, 8);
    return `${timestamp}-${random}-${hash}`;
  }

  /**
   * 保存生成的文件
   * @param {string} content - 文件内容
   * @param {string} filename - 文件名
   * @returns {Promise<Object>} - 文件信息
   */
  async saveGeneratedFile(content, filename) {
    try {
      const fileId = this.generateFileId(filename);
      const filePath = path.join(this.baseDir, `${fileId}-${filename}`);

      await fs.writeFile(filePath, content, 'utf-8');

      const fileInfo = {
        fileId,
        filename,
        path: filePath,
        size: Buffer.byteLength(content, 'utf-8'),
        createdAt: Date.now(),
        mimeType: this.getMimeType(filename)
      };

      // 记录在内存中
      this.files.set(fileId, fileInfo);

      console.log('[FileManager] File saved:', fileInfo);
      return fileInfo;
    } catch (err) {
      console.error('[FileManager] Failed to save file:', err);
      throw err;
    }
  }

  /**
   * 获取文件信息
   * @param {string} fileId - 文件ID
   * @returns {Object|null} - 文件信息
   */
  getFileInfo(fileId) {
    return this.files.get(fileId) || null;
  }

  /**
   * 获取文件内容
   * @param {string} fileId - 文件ID
   * @returns {Promise<Buffer|null>} - 文件内容
   */
  async getFileContent(fileId) {
    try {
      const fileInfo = this.files.get(fileId);
      if (!fileInfo) {
        return null;
      }

      const content = await fs.readFile(fileInfo.path);
      return content;
    } catch (err) {
      console.error('[FileManager] Failed to read file:', err);
      return null;
    }
  }

  /**
   * 删除文件
   * @param {string} fileId - 文件ID
   * @returns {Promise<boolean>} - 是否删除成功
   */
  async deleteFile(fileId) {
    try {
      const fileInfo = this.files.get(fileId);
      if (!fileInfo) {
        return false;
      }

      await fs.unlink(fileInfo.path);
      this.files.delete(fileId);

      console.log('[FileManager] File deleted:', fileId);
      return true;
    } catch (err) {
      console.error('[FileManager] Failed to delete file:', err);
      return false;
    }
  }

  /**
   * 清理过期文件（> 24小时）
   */
  async cleanupExpiredFiles() {
    try {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24小时

      const expiredFileIds = Array.from(this.files.entries())
        .filter(([_, info]) => now - info.createdAt > maxAge)
        .map(([fileId]) => fileId);

      for (const fileId of expiredFileIds) {
        await this.deleteFile(fileId);
      }

      if (expiredFileIds.length > 0) {
        console.log('[FileManager] Cleaned up', expiredFileIds.length, 'expired files');
      }
    } catch (err) {
      console.error('[FileManager] Cleanup error:', err);
    }
  }

  /**
   * 从文件系统路径注册文件
   * @param {string} filePath - 文件系统路径
   * @param {string} filename - 文件名
   * @returns {Promise<Object>} - 文件信息
   */
  async registerFile(filePath, filename) {
    try {
      const fileId = this.generateFileId(filename);
      
      // 检查文件是否存在
      const stats = await fs.stat(filePath);
      
      const fileInfo = {
        fileId,
        filename,
        path: filePath,
        size: stats.size,
        createdAt: Date.now(),
        mimeType: this.getMimeType(filename)
      };

      this.files.set(fileId, fileInfo);
      console.log('[FileManager] File registered:', fileInfo);
      return fileInfo;
    } catch (err) {
      console.error('[FileManager] Failed to register file:', err);
      throw err;
    }
  }

  /**
   * 获取MIME类型
   * @param {string} filename - 文件名
   * @returns {string} - MIME类型
   */
  getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.md': 'text/markdown',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.csv': 'text/csv',
      '.html': 'text/html',
      '.pdf': 'application/pdf',
      '.py': 'text/x-python',
      '.js': 'application/javascript'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * 列出所有文件
   * @returns {Array<Object>} - 文件列表
   */
  listFiles() {
    return Array.from(this.files.values());
  }

  /**
   * 获取文件统计信息
   * @returns {Object} - 统计信息
   */
  getStats() {
    let totalSize = 0;
    for (const info of this.files.values()) {
      totalSize += info.size;
    }

    return {
      totalFiles: this.files.size,
      totalSize,
      files: this.listFiles()
    };
  }
}

module.exports = FileManager;
