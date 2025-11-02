const io = require('socket.io-client');
const fetch = require('node-fetch');

const SERVER_URL = 'http://localhost:3000';

const socket = io(SERVER_URL);

const eventsReceived = [];

socket.on('connect', () => {
  console.log('✓ Connected to Socket.IO server');
  console.log('  Socket ID:', socket.id);
  console.log();
  
  startTests();
});

socket.on('disconnect', (reason) => {
  console.log('\n✗ Disconnected:', reason);
});

socket.on('workflows:updated', (event) => {
  console.log('📨 Received workflows:updated event');
  console.log('   Action:', event.action);
  console.log('   ID:', event.id);
  console.log('   Timestamp:', event.timestamp);
  eventsReceived.push({ type: 'workflows:updated', event });
});

socket.on('roles:updated', (event) => {
  console.log('📨 Received roles:updated event');
  console.log('   Action:', event.action);
  console.log('   ID:', event.id);
  console.log('   Timestamp:', event.timestamp);
  eventsReceived.push({ type: 'roles:updated', event });
});

socket.on('prompts:updated', (event) => {
  console.log('📨 Received prompts:updated event');
  console.log('   Action:', event.action);
  console.log('   ID:', event.id);
  console.log('   Timestamp:', event.timestamp);
  eventsReceived.push({ type: 'prompts:updated', event });
});

socket.on('settings:updated', (event) => {
  console.log('📨 Received settings:updated event');
  console.log('   Action:', event.action);
  console.log('   Type:', event.type || 'N/A');
  console.log('   Timestamp:', event.timestamp);
  eventsReceived.push({ type: 'settings:updated', event });
});

socket.on('joined', (data) => {
  console.log('✓ Joined room:', data.room, 'at', data.timestamp);
});

socket.on('left', (data) => {
  console.log('✓ Left room:', data.room, 'at', data.timestamp);
});

async function apiCall(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${SERVER_URL}${path}`, options);
  return response.json();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startTests() {
  console.log('='.repeat(60));
  console.log('Socket.IO Event Broadcasting Test');
  console.log('='.repeat(60));
  console.log();
  
  try {
    console.log('--- Testing Room Join/Leave ---');
    socket.emit('join', 'workflows');
    await sleep(100);
    socket.emit('leave', 'workflows');
    await sleep(100);
    console.log();
    
    console.log('--- Testing Workflow Events ---');
    console.log('Creating test workflow...');
    const createRes = await apiCall('POST', '/api/workflows', {
      id: 'test-socketio-workflow',
      name: 'Test Socket.IO Workflow',
      description: 'Testing event broadcasting',
      stages: [
        {
          id: 'test-stage',
          name: 'Test Stage',
          duration: 60,
          roles: [],
          prompt: 'Test prompt'
        }
      ]
    });
    await sleep(300);
    
    console.log('Updating test workflow...');
    await apiCall('PUT', '/api/workflows/test-socketio-workflow', {
      name: 'Updated Test Workflow',
      description: 'Testing update event',
      stages: [
        {
          id: 'test-stage',
          name: 'Test Stage Updated',
          duration: 120,
          roles: [],
          prompt: 'Test prompt updated'
        }
      ]
    });
    await sleep(300);
    
    console.log('Deleting test workflow...');
    await apiCall('DELETE', '/api/workflows/test-socketio-workflow');
    await sleep(300);
    console.log();
    
    console.log('--- Testing Role Events ---');
    console.log('Creating test role...');
    await apiCall('POST', '/api/roles', {
      id: 'test-socketio-role',
      name: 'Test Role',
      title: 'Test Title',
      personality: 'Test personality',
      emoji: '🧪',
      color: '#FF0000'
    });
    await sleep(300);
    
    console.log('Updating test role...');
    await apiCall('PUT', '/api/roles/test-socketio-role', {
      id: 'test-socketio-role',
      name: 'Updated Test Role',
      title: 'Updated Title',
      personality: 'Updated personality',
      emoji: '🧪',
      color: '#00FF00'
    });
    await sleep(300);
    
    console.log('Deleting test role...');
    await apiCall('DELETE', '/api/roles/test-socketio-role');
    await sleep(300);
    console.log();
    
    console.log('--- Testing Prompt Events ---');
    console.log('Creating test prompt...');
    await apiCall('POST', '/api/prompts', {
      id: 'test-socketio-prompt',
      name: 'Test Prompt',
      description: 'Test prompt description',
      type: 'stage',
      content: 'Test template {variable}',
      variables: ['variable']
    });
    await sleep(300);
    
    console.log('Updating test prompt...');
    await apiCall('PUT', '/api/prompts/test-socketio-prompt', {
      id: 'test-socketio-prompt',
      name: 'Updated Test Prompt',
      description: 'Updated prompt description',
      type: 'stage',
      content: 'Updated template {variable}',
      variables: ['variable']
    });
    await sleep(300);
    
    console.log('Deleting test prompt...');
    await apiCall('DELETE', '/api/prompts/test-socketio-prompt');
    await sleep(300);
    console.log();
    
    console.log('--- Testing Settings Events ---');
    console.log('Setting a variable...');
    await apiCall('PUT', '/api/settings/variables/test-var', {
      value: 'test-value'
    });
    await sleep(300);
    
    console.log('Deleting the variable...');
    await apiCall('DELETE', '/api/settings/variables/test-var');
    await sleep(300);
    console.log();
    
    console.log('='.repeat(60));
    console.log('Test Results Summary');
    console.log('='.repeat(60));
    console.log(`Total events received: ${eventsReceived.length}`);
    console.log();
    
    const eventCounts = {};
    eventsReceived.forEach(({ type }) => {
      eventCounts[type] = (eventCounts[type] || 0) + 1;
    });
    
    console.log('Events by type:');
    Object.entries(eventCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log();
    
    const expectedEvents = 11;
    if (eventsReceived.length === expectedEvents) {
      console.log(`✓ All ${expectedEvents} expected events received!`);
    } else {
      console.log(`✗ Expected ${expectedEvents} events, received ${eventsReceived.length}`);
    }
    
    console.log();
    console.log('Event details:');
    eventsReceived.forEach(({ type, event }, index) => {
      console.log(`  ${index + 1}. ${type} - ${event.action} (${event.timestamp})`);
    });
    
  } catch (error) {
    console.error('\n✗ Test error:', error);
  } finally {
    console.log();
    console.log('Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }
}

socket.on('connect_error', (error) => {
  console.error('✗ Connection error:', error.message);
  console.log('\nMake sure the server is running on', SERVER_URL);
  process.exit(1);
});
