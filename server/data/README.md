# Data Storage Schemas

This directory contains JSON files that persist application data. All files use UTF-8 encoding.

## workflows.json

Stores workflow templates with stages and configurations.

**Schema:**
```json
{
  "workflowId": {
    "name": "string (workflow display name)",
    "description": "string (workflow description)",
    "stages": [
      {
        "id": "string (unique stage identifier)",
        "name": "string (stage display name)",
        "duration": "number (milliseconds)",
        "facilitator": "boolean (optional, stage led by facilitator)",
        "requiresDecision": "boolean (optional, stage requires decision)",
        "editorRole": "boolean (optional, stage handled by editor)"
      }
    ]
  }
}
```

## roles.json

Stores role definitions for workflow participants.

**Schema:**
```json
[
  {
    "id": "string (unique role identifier)",
    "name": "string (role display name)",
    "emoji": "string (role emoji icon)",
    "color": "string (hex color code)",
    "title": "string (role title/position)",
    "personality": "string (role personality description)",
    "required": "boolean (optional, whether role is required)",
    "specialRole": "boolean (optional, marks special functionality)"
  }
]
```

## prompts.json

Stores prompt templates with variables.

**Schema:**
```json
[
  {
    "id": "string (unique prompt identifier)",
    "name": "string (prompt display name)",
    "description": "string (prompt description)",
    "type": "string (prompt type: stage, role, system, editor)",
    "content": "string (prompt template with {variable} placeholders)",
    "variables": ["string (array of variable names used in template)"]
  }
]
```

## settings.json

Stores user variables and custom API configurations.

**Schema:**
```json
{
  "globalVariables": {
    "variableName": "string (variable value)"
  },
  "customApiConfigs": {
    "apiName": {
      "name": "string (API configuration name)",
      "endpoint": "string (API endpoint URL)",
      "apiKey": "string (API key)",
      "modelName": "string (model identifier)",
      "temperature": "number (0-2, default 0.7)",
      "maxTokens": "number (max response tokens, default 1500)",
      "timeout": "number (request timeout in seconds)"
    }
  }
}
```

## Validation Rules

### Workflows
- `workflowId` must be unique and alphanumeric
- `name` and `description` are required strings
- `stages` must be a non-empty array
- Each stage must have unique `id` and `name`
- `duration` must be a non-negative number

### Roles
- `id` must be unique and alphanumeric
- `name`, `emoji`, `color`, `title`, and `personality` are required
- `color` must be a valid hex color code

### Prompts
- `id` must be unique and alphanumeric
- `name`, `description`, `type`, and `content` are required
- `type` must be one of: stage, role, system, editor
- `variables` must match placeholders in `content`

### Settings
- `globalVariables` keys must be valid variable names
- `customApiConfigs` endpoint must be a valid URL
- `apiKey` and `modelName` are required for each API config
- `temperature` must be between 0 and 2
- `maxTokens` must be a positive integer
