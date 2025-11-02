const io = require('socket.io-client');

console.log('Connecting to Socket.IO server...');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✓ Connected to Socket.IO server');
  console.log('Socket ID:', socket.id);
  
  // Listen for events
  socket.on('workflows:updated', (data) => {
    console.log('✓ Received workflows:updated event:', JSON.stringify(data, null, 2));
  });
  
  socket.on('roles:updated', (data) => {
    console.log('✓ Received roles:updated event:', JSON.stringify(data, null, 2));
  });
  
  socket.on('prompts:updated', (data) => {
    console.log('✓ Received prompts:updated event:', JSON.stringify(data, null, 2));
  });
  
  socket.on('settings:updated', (data) => {
    console.log('✓ Received settings:updated event:', JSON.stringify(data, null, 2));
  });
  
  console.log('\nListening for events... (will automatically disconnect after 30s)');
  
  // Auto-disconnect after 30 seconds
  setTimeout(() => {
    console.log('\nTest completed. Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 30000);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('error', (error) => {
  console.error('Socket.IO error:', error);
});
