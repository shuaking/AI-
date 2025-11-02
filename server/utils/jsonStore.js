const fs = require('fs').promises;
const path = require('path');

class JsonStore {
  constructor(dataDir, cacheTTL = 30000) {
    this.dataDir = dataDir;
    this.cacheTTL = cacheTTL;
    this.cache = new Map();
    this.writeQueue = new Map();
    this.locks = new Map();
  }

  getCachePath(filename) {
    return path.join(this.dataDir, filename);
  }

  getCacheEntry(filename) {
    const entry = this.cache.get(filename);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > this.cacheTTL) {
      this.cache.delete(filename);
      return null;
    }
    
    return entry.data;
  }

  setCacheEntry(filename, data) {
    this.cache.set(filename, {
      data,
      timestamp: Date.now()
    });
  }

  async acquireLock(filename) {
    while (this.locks.get(filename)) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    this.locks.set(filename, true);
  }

  releaseLock(filename) {
    this.locks.delete(filename);
  }

  async read(filename) {
    try {
      const cached = this.getCacheEntry(filename);
      if (cached !== null) {
        return cached;
      }

      const filePath = this.getCachePath(filename);
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      
      this.setCacheEntry(filename, data);
      return data;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filename}`);
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in file: ${filename}`);
      }
      throw new Error(`Failed to read ${filename}: ${error.message}`);
    }
  }

  async write(filename, data) {
    await this.acquireLock(filename);
    
    try {
      const filePath = this.getCachePath(filename);
      const tempPath = `${filePath}.tmp`;
      const backupPath = `${filePath}.bak`;
      
      const jsonContent = JSON.stringify(data, null, 2);
      
      await fs.writeFile(tempPath, jsonContent, 'utf8');
      
      try {
        await fs.access(filePath);
        await fs.copyFile(filePath, backupPath);
      } catch (err) {
        // File doesn't exist yet, skip backup
      }
      
      await fs.rename(tempPath, filePath);
      
      try {
        await fs.unlink(backupPath);
      } catch (err) {
        // Backup doesn't exist, ignore
      }
      
      this.setCacheEntry(filename, data);
      
      return true;
    } catch (error) {
      throw new Error(`Failed to write ${filename}: ${error.message}`);
    } finally {
      this.releaseLock(filename);
    }
  }

  async exists(filename) {
    try {
      const filePath = this.getCachePath(filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  clearCache(filename = null) {
    if (filename) {
      this.cache.delete(filename);
    } else {
      this.cache.clear();
    }
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create data directory: ${error.message}`);
    }
  }
}

module.exports = JsonStore;
