const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const config = require('./config');

const JsonStore = require('./utils/jsonStore');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const createWorkflowsRouter = require('./routes/workflows');
const createRolesRouter = require('./routes/roles');
const createPromptsRouter = require('./routes/prompts');
const createSettingsRouter = require('./routes/settings');
const createPythonExecutionRouter = require('./routes/pythonExecution');

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

// 404 handler for API routes - return JSON instead of HTML
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/workflows',
      'POST /api/workflows',
      'PUT /api/workflows/:id',
      'DELETE /api/workflows/:id',
      'GET /api/roles',
      'POST /api/roles',
      'PUT /api/roles/:id',
      'DELETE /api/roles/:id',
      'GET /api/prompts',
      'POST /api/prompts',
      'PUT /api/prompts/:id',
      'DELETE /api/prompts/:id',
      'GET /api/settings',
      'PUT /api/settings',
      'POST /api/execute-python/execute',
      'GET /api/execute-python/download/:fileId',
      'GET /api/execute-python/file/:fileId',
      'GET /api/execute-python/stats',
      'DELETE /api/execute-python/file/:fileId',
      'POST /api/execute-python/extract-code'
    ]
  });
});

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
