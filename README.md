# AI工作流工作室 (AI Workflow Studio)

Single-page AI workflow studio (v2.2) with Express + Socket.IO backend. The application provides a comprehensive workflow management interface with template management, role management, prompt library, LLM interface configuration, and collaborative chat-style workspace.

## Features

- **Workflow Templates**: Pre-built and custom workflow templates
- **Role Management**: Define and manage AI agent roles
- **Prompt Library**: Store and manage reusable prompts and variables
- **LLM Interface Configuration**: Configure standard and custom LLM APIs with streaming support
- **Collaborative Workspace**: Chat-style interface with stage progress, message flow, and role mentions
- **Real-time Communication**: Socket.IO powered real-time updates
- **Data Persistence**: REST API backend with JSON storage for workflows, roles, prompts, and settings
- **Offline Support**: Automatic fallback to localStorage cache when offline or server unavailable

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn

## Installation

1. Clone the repository and navigate to the project directory:
```bash
cd /path/to/ai-workflow-studio
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

Run the server with hot-reload using nodemon:

```bash
npm run dev
```

The server will automatically restart when you make changes to the server code.

### Production Mode

Run the server in production mode:

```bash
npm start
```

## Accessing the Application

Once the server is running, open your browser and navigate to:

```
http://localhost:3000
```

The application will serve the single-page UI from the `public` directory.

## Configuration

The server can be configured using environment variables:

- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)
- `CORS_ORIGIN`: CORS origin (default: *)
- `NODE_ENV`: Environment mode (development/production)

### Example with custom port:

```bash
PORT=8080 npm start
```

## Project Structure

```
.
├── server/
│   ├── index.js              # Main server entry point
│   ├── config.js             # Configuration module
│   ├── data/                 # JSON data storage
│   │   ├── workflows.json    # Workflow templates
│   │   ├── roles.json        # Role definitions
│   │   ├── prompts.json      # Prompt templates
│   │   └── settings.json     # User settings and variables
│   ├── routes/               # REST API routes
│   │   ├── workflows.js      # Workflow CRUD endpoints
│   │   ├── roles.js          # Role CRUD endpoints
│   │   ├── prompts.js        # Prompt CRUD endpoints
│   │   └── settings.js       # Settings CRUD endpoints
│   ├── utils/                # Utility modules
│   │   ├── jsonStore.js      # JSON file storage with caching
│   │   └── validators.js     # Data validation
│   └── middleware/           # Express middleware
│       ├── errorHandler.js   # Error handling
│       └── requestLogger.js  # Request logging
├── public/
│   ├── index.html            # Single-page application UI
│   └── js/
│       ├── apiClient.js      # API client with offline support
│       └── socketClient.js   # Socket.IO client
├── package.json              # Node.js dependencies and scripts
├── .gitignore                # Git ignore rules
├── README.md                 # This file
├── DEVELOPER_NOTES.md        # Technical documentation
└── JSON_STORAGE_API_SUMMARY.md  # API documentation
```

## API Endpoints

### Health Check

```
GET /api/health
```

Returns server status and uptime information.

### Data Management

The application provides RESTful API endpoints for managing workflows, roles, prompts, and settings:

#### Workflows
- `GET /api/workflows` - List all workflows
- `GET /api/workflows/:id` - Get specific workflow
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

#### Roles
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get specific role
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

#### Prompts
- `GET /api/prompts` - List all prompts
- `GET /api/prompts/:id` - Get specific prompt
- `POST /api/prompts` - Create prompt
- `PUT /api/prompts/:id` - Update prompt
- `DELETE /api/prompts/:id` - Delete prompt

#### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings/variables` - Update global variables
- `PUT /api/settings/api-configs` - Update custom API configurations

See `server/README.md` for detailed API documentation.

## Socket.IO

The server includes a Socket.IO instance for real-time communication. Connection and disconnection events are logged to the console.

### Connection Example

The Socket.IO server is available at the same address as the HTTP server. The client can connect using:

```javascript
const socket = io();
```

## Development Notes

- The frontend is a self-contained single-page application with inline CSS and JavaScript
- All static assets are served from the `public` directory
- Socket.IO namespace is configured at the root level (`/`)
- CORS is enabled by default for development purposes

### Data Loading Strategy

The application uses a hybrid approach for data management:

1. **Primary Source**: On page load, the application fetches data from REST API endpoints
2. **Caching**: Successfully fetched data is cached in localStorage for offline use
3. **Offline Mode**: If the API is unavailable, the app automatically falls back to cached data
4. **Graceful Degradation**: If both API and cache fail, the app uses hardcoded defaults

This ensures the application works seamlessly both online and offline.

### Testing the API Client

A test page is available at `http://localhost:3000/test-api-client.html` to verify the API client integration and test various scenarios including:
- Fetching workflows, roles, prompts, and settings
- Saving and reading data
- Online/offline status detection

## Troubleshooting

### Port Already in Use

If you see an error that the port is already in use, either:
1. Stop the process using that port
2. Use a different port: `PORT=3001 npm start`

### Cannot Connect to Socket.IO

Ensure that:
1. The server is running
2. There are no firewall rules blocking the connection
3. CORS is properly configured if accessing from a different origin

## License

ISC
