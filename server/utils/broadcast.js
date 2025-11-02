function createBroadcaster(io) {
  function broadcast(resource, action, payload, metadata = {}) {
    const event = {
      resource,
      action,
      payload,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    
    const eventName = `${resource}:updated`;
    
    io.emit(eventName, event);
    
    console.log(`[Socket.IO] Event emitted: ${eventName}`, {
      action,
      resourceId: metadata.id || 'N/A',
      timestamp: event.timestamp
    });
    
    return event;
  }
  
  return { broadcast };
}

module.exports = createBroadcaster;
