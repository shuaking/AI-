# JSON Storage API

A RESTful JSON storage backend for the AI Workflow Studio, providing persistent storage for workflows, roles, prompts, and user settings.

## Architecture

### Components

1. **JsonStore** (`utils/jsonStore.js`)
   - Atomic write operations using temp files and rename
   - In-memory caching with configurable TTL (default: 30 seconds)
   - Mutex-based locking to prevent concurrent write conflicts
   - Automatic backup creation before overwrites

2. **Validators** (`utils/validators.js`)
   - Schema validation for all resource types
   - Type checking and format validation
   - Comprehensive error messages

3. **Routes** (`routes/`)
   - RESTful CRUD endpoints for each resource type
   - Consistent response format
   - HTTP status codes following REST conventions

4. **Middleware**
   - `requestLogger`: Logs all requests with timestamp, method, path, status, and duration
   - `errorHandler`: Centralized error handling with descriptive messages

### Data Storage

JSON files in `server/data/`:
- `workflows.json`: Workflow templates with stages
- `roles.json`: Role definitions
- `prompts.json`: Prompt templates
- `settings.json`: Global variables and custom API configurations

See `data/README.md` for detailed schema documentation.

## API Endpoints

### Health Check

**GET /api/health**

Returns server status and metadata.

Response:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "version": "2.2.0",
  "services": {
    "api": "operational",
    "storage": "operational",
    "socketIO": "idle"
  }
}
```

### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workflows` | List all workflows |
| GET | `/api/workflows/:id` | Get specific workflow |
| POST | `/api/workflows` | Create new workflow |
| PUT | `/api/workflows/:id` | Update workflow |
| DELETE | `/api/workflows/:id` | Delete workflow |

### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | List all roles |
| GET | `/api/roles/:id` | Get specific role |
| POST | `/api/roles` | Create new role |
| PUT | `/api/roles/:id` | Update role |
| DELETE | `/api/roles/:id` | Delete role (non-required only) |

### Prompts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prompts` | List all prompts |
| GET | `/api/prompts/:id` | Get specific prompt |
| POST | `/api/prompts` | Create new prompt |
| PUT | `/api/prompts/:id` | Update prompt |
| DELETE | `/api/prompts/:id` | Delete prompt |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all settings |
| GET | `/api/settings/variables` | Get all variables |
| GET | `/api/settings/variables/:key` | Get specific variable |
| PUT | `/api/settings/variables` | Update all variables |
| PUT | `/api/settings/variables/:key` | Set/update variable |
| DELETE | `/api/settings/variables/:key` | Delete variable |
| GET | `/api/settings/api-configs` | Get all API configs |
| GET | `/api/settings/api-configs/:name` | Get specific API config |
| PUT | `/api/settings/api-configs` | Update all API configs |
| PUT | `/api/settings/api-configs/:name` | Set/update API config |
| DELETE | `/api/settings/api-configs/:name` | Delete API config |

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Descriptive error message",
  "details": ["Additional error details"]
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, or DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Validation error or invalid input
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

## Features

### Atomic Writes

All write operations use atomic file operations:
1. Write to temporary file
2. Create backup of original file
3. Rename temporary file to replace original
4. Remove backup

This ensures data integrity even if the process crashes during a write.

### Caching

The JsonStore maintains an in-memory cache with TTL to reduce disk I/O:
- Default TTL: 30 seconds
- Cache is invalidated on writes
- Cache entries include timestamp for automatic expiration

### Concurrent Access

A simple mutex implementation prevents concurrent writes to the same file:
- Acquire lock before write
- Other operations wait until lock is released
- Prevents race conditions and data corruption

### Validation

All incoming data is validated before being persisted:
- Type checking
- Required field validation
- Format validation (IDs, URLs, colors, etc.)
- Business rule validation (e.g., can't delete required roles)

## Realtime Updates

The server broadcasts Socket.IO events whenever workflows, roles, prompts, or settings change. Events are emitted after successful persistence and include the full resource payload plus an ISO 8601 timestamp. See [SOCKET_EVENTS.md](./SOCKET_EVENTS.md) for detailed event timing, payload examples, and client integration guidance.

## Testing

See `TEST_API.md` for comprehensive manual testing instructions.

Quick test:
```bash
# Start server
npm start

# Test health endpoint
curl http://localhost:3000/api/health

# List workflows
curl http://localhost:3000/api/workflows
```

## Configuration

The cache TTL can be adjusted in `server/index.js`:
```javascript
const jsonStore = new JsonStore(dataDir, 30000); // 30 seconds
```

## Error Handling

The API provides descriptive error messages for common issues:

- **File not found**: Resource doesn't exist
- **Invalid JSON**: Corrupted data file
- **Validation errors**: Input doesn't meet schema requirements
- **Conflicts**: Attempting to create duplicate resources
- **Permission errors**: Can't delete required resources

All errors are logged with stack traces for debugging.

## Logging

Request logging includes:
- Timestamp (ISO 8601)
- HTTP method
- Request path
- Response status code
- Duration in milliseconds

Example:
```
[2024-01-01T00:00:00.000Z] GET /api/workflows - 200 (5ms)
[2024-01-01T00:00:01.000Z] POST /api/roles - 201 (3ms)
[2024-01-01T00:00:02.000Z] GET /api/workflows/nonexistent - 404 (1ms)
```

## Development

### Adding New Resources

1. Create JSON file in `server/data/` with initial data
2. Add validation function in `utils/validators.js`
3. Create router in `routes/` following existing patterns
4. Wire router in `server/index.js`
5. Update documentation

### Modifying Schemas

1. Update validation in `utils/validators.js`
2. Update schema documentation in `data/README.md`
3. Test with various inputs to ensure validation works
4. Consider backward compatibility with existing data

## Security Notes

⚠️ **Important**: This is a local development API. For production use:

1. Add authentication/authorization
2. Implement rate limiting
3. Sanitize user input
4. Use HTTPS
5. Add CORS restrictions
6. Implement API versioning
7. Add audit logging
8. Consider encrypting sensitive data (API keys)
