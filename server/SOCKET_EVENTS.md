# Socket.IO Event Reference

The AI Workflow Studio server publishes Socket.IO events whenever critical resources change. These events allow browser clients to stay in sync without reloading the page.

## Event Overview

| Event name          | Resource    | Triggered by                                    | Routes                                                                   |
|---------------------|-------------|-------------------------------------------------|--------------------------------------------------------------------------|
| `workflows:updated` | Workflows   | Successful `POST`, `PUT`, or `DELETE` requests | `POST /api/workflows` · `PUT /api/workflows/:id` · `DELETE /api/workflows/:id` |
| `roles:updated`     | Roles       | Successful `POST`, `PUT`, or `DELETE` requests | `POST /api/roles` · `PUT /api/roles/:id` · `DELETE /api/roles/:id`             |
| `prompts:updated`   | Prompts     | Successful `POST`, `PUT`, or `DELETE` requests | `POST /api/prompts` · `PUT /api/prompts/:id` · `DELETE /api/prompts/:id`       |
| `settings:updated`  | Settings    | Successful writes to settings resources        | `PUT /api/settings/variables`, `PUT/DELETE /api/settings/variables/:key`, `PUT /api/settings/api-configs`, `PUT/DELETE /api/settings/api-configs/:name` |

Each event is only emitted after validation passes and data has been persisted to disk. Failed validations or storage errors stop the request before an event is emitted.

## Payload Structure

All Socket.IO payloads share the same shape:

```json
{
  "data": "<resource contents>",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

- **data** — The full in-memory representation of the affected resource after the change has been applied.
  - Workflows: an object keyed by workflow ID.
  - Roles / Prompts: an array of resources.
  - Settings: the entire settings object from `settings.json`.
- **timestamp** — ISO 8601 timestamp generated on the server at emit time. Clients can use this to deduplicate or order updates.

### Example: `workflows:updated`

```json
{
  "data": {
    "demo": {
      "name": "Demo Workflow",
      "stages": [
        { "id": "idea", "title": "Ideation" },
        { "id": "plan", "title": "Planning" }
      ]
    }
  },
  "timestamp": "2024-11-07T12:34:56.789Z"
}
```

## Server-Side Helper

All routes call `emitSocketEvent` to guarantee consistent payloads, structured logging, and safe error handling:

```javascript
const { emitSocketEvent } = require('../utils/socketEvents');

emitSocketEvent(
  req,
  'workflows:updated',
  { data: workflows },
  { resourceType: 'workflow', action: 'update', resourceId: workflowId }
);
```

The helper:

- Adds an ISO timestamp when the payload does not already include one.
- Emits a structured `console.info` log with the event name, action, and resource identifier.
- Catches and logs emission failures without interrupting the HTTP response flow.
- Emits `console.warn` logs if the Socket.IO instance is unavailable.

## Client Integration

The default frontend client (`public/js/socketClient.js`) automatically connects to the same-origin Socket.IO server and listens for all events:

```javascript
socket.on('workflows:updated', (payload) => {
  console.log('[SocketClient] workflows:updated received', payload);
});
```

For custom handling:

```javascript
if (window.socketClient.connect()) {
  window.socketClient.on('roles:updated', ({ data, timestamp }) => {
    refreshRolesTable(data, timestamp);
  });
}
```

### Testing tips

1. Start the server (`npm start`) and open `http://localhost:3000` in two browser tabs.
2. Use the UI or REST client to create, update, or delete workflows, roles, prompts, or settings.
3. Watch the browser console — each tab should log the corresponding `*:updated` event with the latest payload.
4. Observe the server logs for structured `[Socket.IO] Event emitted` entries showing the event name, action, resource type, and resource ID.

## Error Handling & Observability

- Event emissions are wrapped in `try/catch`; failures are logged as `[Socket.IO] Failed to emit event "<event>"` without affecting the HTTP response sent to the caller.
- When the Express `app` or Socket.IO instance is missing, a warning is logged and the request proceeds normally. This protects CLI tools and integration tests that do not bootstrap Socket.IO.
- Structured logs include the action (`create`, `update`, `delete`), resource type, resource ID, and emit timestamp, making it straightforward to trace event flow in production logs.

Refer back to this document whenever you add new real-time events or need to validate the existing ones.
