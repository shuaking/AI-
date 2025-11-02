const path = require('path');

const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  publicDir: path.join(__dirname, '../public'),
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  socketIO: {
    pingTimeout: 60000,
    pingInterval: 25000
  }
};

module.exports = config;
