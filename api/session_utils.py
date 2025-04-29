import os
import asyncio
import logging
from typing import Dict, Any, Optional

from fastapi import HTTPException

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Configure logging
logger = logging.getLogger(__name__)

# MCP server parameters
MCP_SERVERS = {
    "unified": StdioServerParameters(
        command="python",
        args=["-m", "servers.unified.server"],
        env=None,
    ),
    "supabase": StdioServerParameters(
        command="python",
        args=["-m", "servers.supabase.server"],
        env=None,
    ),
    "git": StdioServerParameters(
        command="python",
        args=["-m", "servers.git.server"],
        env=None,
    ),
    "sanity": StdioServerParameters(
        command="python",
        args=["-m", "servers.sanity.server"],
        env=None,
    ),
    "privy": StdioServerParameters(
        command="python",
        args=["-m", "servers.privy.server"],
        env=None,
    ),
    "base": StdioServerParameters(
        command="python",
        args=["-m", "servers.base.server"],
        env=None,
    ),
}

# MCP client sessions
mcp_sessions: Dict[str, ClientSession] = {}


async def get_mcp_session(server: str) -> ClientSession:
    """
    Get an MCP client session for the specified server.

    Args:
        server: The name of the MCP server.

    Returns:
        The MCP client session.

    Raises:
        HTTPException: If the server is not found or the connection fails.
    """
    # Check if the server exists
    if server not in MCP_SERVERS:
        raise HTTPException(status_code=404, detail=f"MCP server '{server}' not found")

    # Check if we already have a session for this server
    if server in mcp_sessions and mcp_sessions[server].is_connected():
        return mcp_sessions[server]

    # Create a new session
    try:
        server_params = MCP_SERVERS[server]

        # Connect to the MCP server
        read_stream, write_stream = await stdio_client(server_params)
        session = ClientSession(read_stream, write_stream)

        # Initialize the session
        await session.initialize()

        # Store the session
        mcp_sessions[server] = session

        return session
    except Exception as e:
        logger.error(f"Error connecting to MCP server '{server}': {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error connecting to MCP server: {str(e)}")


async def startup_event():
    """
    Startup event handler to initialize MCP sessions.
    """
    logger.info("Initializing MCP sessions...")
    # You might want to connect to essential servers on startup
    # For now, we'll connect on demand in get_mcp_session
    pass


async def shutdown_event():
    """
    Shutdown event handler to close MCP sessions.
    """
    logger.info("Closing MCP sessions...")
    for server, session in mcp_sessions.items():
        if session.is_connected():
            await session.close()
            logger.info(f"Closed session for {server}")