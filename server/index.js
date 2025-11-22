const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const JsonStore = require('./utils/jsonStore');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const createWorkflowsRouter = require('./routes/workflows');
const createRolesRouter = require('./routes/roles');
const createPromptsRouter = require('./routes/prompts');
const createSettingsRouter = require('./routes/settings');
const createPythonExecutionRouter = require('./routes/pythonExecution');

const DATA_TEMPLATE_DIR = path.join(__dirname, 'data');
const REQUIRED_DATA_FILES = [
  { name: 'workflows.json', fallback: JSON.stringify({}, null, 2) },
  { name: 'roles.json', fallback: JSON.stringify([], null, 2) },
  { name: 'prompts.json', fallback: JSON.stringify([], null, 2) },
  { name: 'settings.json', fallback: JSON.stringify({ globalVariables: {}, customApiConfigs: {} }, null, 2) }
];

function areSamePath(pathA, pathB) {
  return path.resolve(pathA) === path.resolve(pathB);
}

function analyzeDataFile(destinationPath) {
  if (!fs.existsSync(destinationPath)) {
    return { shouldInit: true, reason: 'missing' };
  }

  try {
    const content = fs.readFileSync(destinationPath, 'utf8');
    if (!content.trim()) {
      return { shouldInit: true, reason: 'empty' };
    }

    JSON.parse(content);
    return { shouldInit: false };
  } catch (error) {
    return { shouldInit: true, reason: 'invalid', error };
  }
}

function initializeDataDirectory(targetDir) {
  REQUIRED_DATA_FILES.forEach(({ name, fallback }) => {
    const destinationPath = path.join(targetDir, name);
    const templatePath = path.join(DATA_TEMPLATE_DIR, name);
    const { shouldInit, reason, error } = analyzeDataFile(destinationPath);

    if (!shouldInit) {
      return;
    }

    const action = reason === 'missing' ? 'Initialized' : 'Reinitialized';

    if (reason && reason !== 'missing') {
      const reasonDetails = error ? `${reason} (${error.message})` : reason;
      console.warn(`[Server] Data file ${name} is ${reasonDetails}, regenerating`);
    }

    const templateExists = fs.existsSync(templatePath);
    const pathsMatch = templateExists && areSamePath(templatePath, destinationPath);

    try {
      if (templateExists && !pathsMatch) {
        fs.copyFileSync(templatePath, destinationPath);
        console.log(`[Server] ${action} data file ${name} from template directory`);
      } else if (templateExists && pathsMatch) {
        fs.writeFileSync(destinationPath, fallback, 'utf8');
        console.log(`[Server] ${action} data file ${name} with default schema (template path matches destination)`);
      } else {
        fs.writeFileSync(destinationPath, fallback, 'utf8');
        console.log(`[Server] ${action} data file ${name} with default schema`);
      }
    } catch (initError) {
      console.error(`[Server] Failed to initialize data file ${name}:`, initError);
      throw initError;
    }
  });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: config.socketIO.cors,
  pingTimeout: config.socketIO.pingTimeout,
  pingInterval: config.socketIO.pingInterval
});

const dataDir = config.dataDir;

try {
  fs.mkdirSync(dataDir, { recursive: true });
  initializeDataDirectory(dataDir);
} catch (error) {
  console.error(`[Server] Failed to initialize data directory at ${dataDir}:`, error);
  process.exit(1);
}

const jsonStore = new JsonStore(dataDir, 30000);

app.set('io', io);

app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

app.use(express.static(config.publicDir));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.2.0',
    services: {
      api: 'operational',
      storage: 'operational',
      socketIO: io.engine.clientsCount > 0 ? 'active' : 'idle'
    }
  });
});

app.use('/api/workflows', createWorkflowsRouter(jsonStore));
app.use('/api/roles', createRolesRouter(jsonStore));
app.use('/api/prompts', createPromptsRouter(jsonStore));
app.use('/api/settings', createSettingsRouter(jsonStore));
app.use('/api/execute-python', createPythonExecutionRouter(jsonStore, dataDir));

app.use(errorHandler);

io.on('connection', (socket) => {
  const clientId = socket.id;
  const clientAddress = socket.handshake.address;
  
  console.log(`[Socket.IO] Client connected: ${clientId} from ${clientAddress}`);
  
  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${clientId}, reason: ${reason}`);
  });
  
  socket.on('error', (error) => {
    console.error(`[Socket.IO] Error on client ${clientId}:`, error);
  });
});

server.listen(config.port, config.host, () => {
  console.log('='.repeat(60));
  console.log('🚀 AI Workflow Studio Server');
  console.log('='.repeat(60));
  console.log(`Server running on: http://${config.host}:${config.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Public directory: ${config.publicDir}`);
  console.log(`Data directory: ${dataDir}`);
  console.log(`Socket.IO enabled on namespace: /`);
  console.log('\nAPI Endpoints:');
  console.log(`  GET  /api/health`);
  console.log(`  CRUD /api/workflows`);
  console.log(`  CRUD /api/roles`);
  console.log(`  CRUD /api/prompts`);
  console.log(`  CRUD /api/settings`);
  console.log(`  POST /api/execute-python/execute - Execute Python code`);
  console.log(`  GET  /api/execute-python/download/:fileId - Download generated file`);
  console.log(`  GET  /api/execute-python/stats - Get execution statistics`);
  console.log('='.repeat(60));
});

process.on('SIGTERM', () => {
  console.log('\n[Server] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n[Server] SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});
