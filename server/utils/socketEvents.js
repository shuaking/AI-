function emitSocketEvent(req, eventName, payload = {}, metadata = {}) {
  const timestamp = new Date().toISOString();
  const eventPayload = {
    ...payload,
    timestamp: payload && payload.timestamp ? payload.timestamp : timestamp
  };

  const logContext = {
    event: eventName,
    action: metadata.action || null,
    resourceType: metadata.resourceType || null,
    resourceId: metadata.resourceId || null,
    timestamp: eventPayload.timestamp
  };

  if (metadata.details) {
    logContext.details = metadata.details;
  }

  if (!req || !req.app || typeof req.app.get !== 'function') {
    console.warn(`[Socket.IO] Skipped event "${eventName}" - Express app unavailable`, logContext);
    return false;
  }

  const io = req.app.get('io');

  if (!io || typeof io.emit !== 'function') {
    console.warn(`[Socket.IO] Skipped event "${eventName}" - Socket.IO instance not found`, logContext);
    return false;
  }

  try {
    io.emit(eventName, eventPayload);
    console.info('[Socket.IO] Event emitted', logContext);
    return true;
  } catch (error) {
    console.error(`[Socket.IO] Failed to emit event "${eventName}"`, {
      ...logContext,
      error: error.message
    });
    return false;
  }
}

module.exports = {
  emitSocketEvent
};
