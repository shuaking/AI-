const path = require('path');

const parseCorsOrigins = (envVar) => {
  if (!envVar || envVar === '*') return '*';
  return envVar.split(',').map(origin => origin.trim());
};

const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  publicDir: path.join(__dirname, '../public'),
  dataDir: process.env.DATA_DIR || path.join(__dirname, 'data'),
  cors: {
    origin: parseCorsOrigins(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  socketIO: {
    cors: {
      origin: parseCorsOrigins(process.env.SOCKET_ALLOWED_ORIGINS || process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '*'),
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  }
};

module.exports = config;
