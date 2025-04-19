# MCP Servers for ESC-APE

This directory contains the Model Context Protocol (MCP) servers for the ESC-APE project.

## Available Servers

- **Unified MCP**: Main unified MCP server that combines all other servers
- **Git MCP**: Git repository integration server
- **Privy MCP**: Privy authentication integration server
- **Supabase MCP**: Supabase database integration server
- **Sanity MCP**: Sanity CMS integration server
- **BASE MCP**: BASE blockchain integration server

## Managing Servers

You can manage the MCP servers using the `manage_servers.py` script in the root directory:

```bash
# Check the status of all servers
python manage_servers.py status

# Start all servers
python manage_servers.py start

# Start a specific server
python manage_servers.py start supabase

# Stop all servers
python manage_servers.py stop

# Stop a specific server
python manage_servers.py stop unified
```

## Server URLs

The servers run on the following URLs:

- Unified MCP: http://localhost:8000
- Git MCP: http://localhost:8004
- Privy MCP: http://localhost:8005
- Supabase MCP: http://localhost:8006
- Sanity MCP: http://localhost:8007
- BASE MCP: http://localhost:8008

## API Endpoints

Each server provides the following endpoints:

- `/health`: Check if the server is running
- `/tools`: Get a list of available tools
- `/`: Main endpoint for executing tools

## Dependencies

Make sure you have the required dependencies installed:

```bash
pip install mcp psutil requests
```

## Environment Variables

The servers use the following environment variables:

- `JWT_SECRET`: Secret key for JWT authentication
- `SKIP_AUTH`: Set to "true" to skip authentication (for development)
- `SUPABASE_URL`: URL of your Supabase instance
- `SUPABASE_KEY`: API key for your Supabase instance
- `PRIVY_APP_ID`: Your Privy App ID
- `SANITY_PROJECT_ID`: Your Sanity project ID
- `SANITY_TOKEN`: Your Sanity API token
