const path = require('path');

/**
 * Parse comma-separated origins into an array
 * @param {string} originsStr - Comma-separated string of origins
 * @returns {string|string[]} - Array of origins or '*' for all origins
 */
function parseCorsOrigins(originsStr) {
  if (!originsStr || originsStr === '*') {
    return '*';
  }
  
  // Split by comma and trim whitespace
  const origins = originsStr.split(',').map(origin => origin.trim()).filter(Boolean);
  
  // Return single origin as string, multiple origins as array
  return origins.length === 1 ? origins[0] : origins;
}

const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  publicDir: path.join(__dirname, '../public'),
  cors: {
    origin: parseCorsOrigins(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  socketIO: {
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: {
      origin: parseCorsOrigins(process.env.SOCKET_ALLOWED_ORIGINS || process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '*'),
      methods: ['GET', 'POST'],
      credentials: true
    }
  }
};

module.exports = config;
