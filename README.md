# AI工作流工作室 (AI Workflow Studio)

Single-page AI workflow studio (v2.2) with Express + Socket.IO backend. The application provides a comprehensive workflow management interface with template management, role management, prompt library, LLM interface configuration, and collaborative chat-style workspace.

## Features

- **Workflow Templates**: Pre-built and custom workflow templates
- **Role Management**: Define and manage AI agent roles
- **Prompt Library**: Store and manage reusable prompts and variables
- **LLM Interface Configuration**: Configure standard and custom LLM APIs with streaming support
- **Collaborative Workspace**: Chat-style interface with stage progress, message flow, and role mentions
- **Real-time Communication**: Socket.IO powered real-time updates

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
│   ├── index.js          # Main server entry point
│   └── config.js         # Configuration module
├── public/
│   └── index.html        # Single-page application UI
├── package.json          # Node.js dependencies and scripts
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and uptime information.

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
