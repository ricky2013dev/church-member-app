# Development Scripts

This document explains how to use the development scripts to run both the frontend and backend servers simultaneously.

## Quick Start

### Option 1: Using the Bash Script (Recommended)

```bash
# Start both servers
./dev start

# Stop both servers
./dev stop

# Restart both servers
./dev restart

# Check server status
./dev status
```

### Option 2: Using NPM Scripts

```bash
# Start both servers
npm run dev:start

# Stop both servers
npm run dev:stop

# Restart both servers
npm run dev:restart

# Check server status
npm run dev:status

# Alternative: Using concurrently (keeps running in terminal)
npm run dev:full
```

## What Gets Started

When you run the start command, both servers will launch:

- **Backend Server**: http://localhost:3000 (Express.js API)
- **Frontend App**: http://localhost:5173 (React/Vite dev server)

## Features

### Bash Script Features (`dev`)

- ✅ Colored output for better readability
- ✅ Process tracking with PID files
- ✅ Graceful shutdown handling
- ✅ Port cleanup (kills processes on ports 3000 & 5173)
- ✅ Status checking
- ✅ Error handling and recovery

### NPM Script Features

- ✅ Simple npm command interface
- ✅ Integrates with existing package.json scripts
- ✅ Uses concurrently for parallel execution
- ✅ Color-coded output (SERVER in blue, FRONTEND in green)

## Stopping the Servers

### Method 1: Use Stop Command

```bash
./dev stop
# or
npm run dev:stop
```

### Method 2: Ctrl+C (when running in foreground)

If you started the servers and they're running in your terminal, simply press `Ctrl+C` to stop both.

### Method 3: Manual Process Kill

If scripts fail to stop the servers:

```bash
# Kill processes on dev ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

## Troubleshooting

### Port Already in Use

If you get port conflicts, use the stop command first:

```bash
./dev stop
./dev start
```

### Servers Won't Stop

Run the status command to check what's running:

```bash
./dev status
```

### Permission Denied

Make sure the script is executable:

```bash
chmod +x dev
```

## Script Details

### File Structure

- `dev` - Main bash script for server management
- `.dev-server.pid` - Temporary file storing process IDs (auto-generated)
- `package.json` - Contains npm script shortcuts

### Process Management

The bash script creates a `.dev-server.pid` file to track running processes. This file is automatically cleaned up when servers are stopped properly.
