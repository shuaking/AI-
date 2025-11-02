const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: config.cors,
  pingTimeout: config.socketIO.pingTimeout,
  pingInterval: config.socketIO.pingInterval
});

app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static(config.publicDir));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

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
  console.log(`Socket.IO enabled on namespace: /`);
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
