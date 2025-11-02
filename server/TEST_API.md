# JSON Storage API Testing Guide

This document provides manual testing instructions for the JSON Storage API endpoints.

## Prerequisites

Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## Health Endpoint

Check server status:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 10.5,
  "version": "2.2.0",
  "services": {
    "api": "operational",
    "storage": "operational",
    "socketIO": "idle"
  }
}
```

## Workflows API

### List all workflows
```bash
curl http://localhost:3000/api/workflows
```

### Get specific workflow
```bash
curl http://localhost:3000/api/workflows/brainstorm
```

### Create new workflow
```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "id": "custom_flow",
    "name": "Custom Workflow",
    "description": "My custom workflow",
    "stages": [
      {
        "id": "stage1",
        "name": "Stage 1",
        "duration": 1000
      }
    ]
  }'
```

### Update workflow
```bash
curl -X PUT http://localhost:3000/api/workflows/custom_flow \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Custom Workflow",
    "description": "Updated description",
    "stages": [
      {
        "id": "stage1",
        "name": "Updated Stage",
        "duration": 2000
      }
    ]
  }'
```

### Delete workflow
```bash
curl -X DELETE http://localhost:3000/api/workflows/custom_flow
```

## Roles API

### List all roles
```bash
curl http://localhost:3000/api/roles
```

### Get specific role
```bash
curl http://localhost:3000/api/roles/pm
```

### Create new role
```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "id": "analyst",
    "name": "Data Analyst",
    "emoji": "📈",
    "color": "#FFA500",
    "title": "Senior Data Analyst",
    "personality": "Analytical, detail-oriented, data-driven"
  }'
```

### Update role
```bash
curl -X PUT http://localhost:3000/api/roles/analyst \
  -H "Content-Type: application/json" \
  -d '{
    "id": "analyst",
    "name": "Lead Data Analyst",
    "emoji": "📊",
    "color": "#FFA500",
    "title": "Lead Data Analyst",
    "personality": "Highly analytical, strategic thinker"
  }'
```

### Delete role (non-required only)
```bash
curl -X DELETE http://localhost:3000/api/roles/analyst
```

## Prompts API

### List all prompts
```bash
curl http://localhost:3000/api/prompts
```

### Get specific prompt
```bash
curl http://localhost:3000/api/prompts/brainstorm
```

### Create new prompt
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "id": "custom_prompt",
    "name": "Custom Prompt",
    "description": "A custom prompt template",
    "type": "stage",
    "content": "You are {role} working on {topic}",
    "variables": ["role", "topic"]
  }'
```

### Update prompt
```bash
curl -X PUT http://localhost:3000/api/prompts/custom_prompt \
  -H "Content-Type: application/json" \
  -d '{
    "id": "custom_prompt",
    "name": "Updated Prompt",
    "description": "Updated description",
    "type": "role",
    "content": "You are {role} with {personality}",
    "variables": ["role", "personality"]
  }'
```

### Delete prompt
```bash
curl -X DELETE http://localhost:3000/api/prompts/custom_prompt
```

## Settings API

### Get all settings
```bash
curl http://localhost:3000/api/settings
```

### Get all variables
```bash
curl http://localhost:3000/api/settings/variables
```

### Get specific variable
```bash
curl http://localhost:3000/api/settings/variables/projectName
```

### Set/update variable
```bash
curl -X PUT http://localhost:3000/api/settings/variables/projectName \
  -H "Content-Type: application/json" \
  -d '{"value": "My Awesome Project"}'
```

### Delete variable
```bash
curl -X DELETE http://localhost:3000/api/settings/variables/projectName
```

### Update all variables at once
```bash
curl -X PUT http://localhost:3000/api/settings/variables \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "AI Workflow Studio",
    "version": "2.2.0",
    "author": "Development Team"
  }'
```

### Get all API configs
```bash
curl http://localhost:3000/api/settings/api-configs
```

### Get specific API config
```bash
curl http://localhost:3000/api/settings/api-configs/myCustomAPI
```

### Set/update API config
```bash
curl -X PUT http://localhost:3000/api/settings/api-configs/myCustomAPI \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom API",
    "endpoint": "https://api.example.com/v1/chat",
    "apiKey": "sk-test-key",
    "modelName": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 2000,
    "timeout": 30
  }'
```

### Delete API config
```bash
curl -X DELETE http://localhost:3000/api/settings/api-configs/myCustomAPI
```

## Error Handling Tests

### Test validation errors

Missing required fields:
```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test",
    "stages": []
  }'
```

Invalid ID format:
```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "id": "invalid id with spaces",
    "name": "Test"
  }'
```

Invalid color code:
```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test",
    "name": "Test",
    "emoji": "😀",
    "color": "not-a-color",
    "title": "Test",
    "personality": "Test"
  }'
```

### Test 404 errors

```bash
curl http://localhost:3000/api/workflows/nonexistent
curl http://localhost:3000/api/roles/nonexistent
curl http://localhost:3000/api/prompts/nonexistent
```

### Test conflict errors

Try creating a duplicate:
```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "id": "brainstorm",
    "name": "Duplicate",
    "description": "Test",
    "stages": [{"id": "test", "name": "Test", "duration": 1000}]
  }'
```

## Concurrent Access Test

To test atomic writes and locking, run multiple simultaneous write operations:

```bash
# Terminal 1
for i in {1..10}; do
  curl -X PUT http://localhost:3000/api/settings/variables/counter \
    -H "Content-Type: application/json" \
    -d "{\"value\": \"$i\"}" &
done
wait
```

Check the final value - it should be one of 1-10, not corrupted.

## Cache Testing

1. Make a request to load data into cache:
```bash
curl http://localhost:3000/api/workflows
```

2. Directly edit `server/data/workflows.json` to add a new workflow

3. Wait 30+ seconds (default TTL) and request again:
```bash
curl http://localhost:3000/api/workflows
```

The new workflow should now appear (cache expired and reloaded from disk).

## Success Criteria

✅ All GET requests return 200 with proper data structure
✅ POST requests create new resources and return 201
✅ PUT requests update existing resources and return 200
✅ DELETE requests remove resources and return 200
✅ Invalid requests return 400 with descriptive error messages
✅ Missing resources return 404 with appropriate messages
✅ Duplicate creation attempts return 409
✅ Health endpoint returns 200 with server metadata
✅ Concurrent writes don't corrupt data
✅ Cache TTL works as expected
