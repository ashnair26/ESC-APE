#!/usr/bin/env python3
"""
Unified MCP server implementation for the ESCAPE Creator Engine.

This server combines all the individual MCP servers into a single server,
allowing LLMs to access all the tools from different servers without having
to connect to each one separately.
"""

import os
import asyncio
import logging
from typing import List, Optional, Dict, Any, Callable, Awaitable

from mcp.server.fastmcp import FastMCP, Context

# Import all the individual MCP servers
from servers.supabase.server import mcp as supabase_mcp
from servers.git.server import mcp as git_mcp
from servers.sanity.server import mcp as sanity_mcp
from servers.privy.server import mcp as privy_mcp
from servers.base.server import mcp as base_mcp

# Import the FastAPI adapters
from servers.unified.adapters import Context7Adapter, FigmaAdapter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("unified-mcp")

# Import authentication utilities
from core.auth import setup_auth_middleware

# Initialize the unified MCP server
mcp = FastMCP("ESCAPE Unified Server")

# Set up authentication middleware
skip_auth = os.environ.get("SKIP_AUTH", "false").lower() == "true"
setup_auth_middleware(
    mcp_server=mcp,
    jwt_secret=os.environ.get("JWT_SECRET"),
    required_scopes=["mcp:access"],
    skip_auth=skip_auth
)

# Initialize the FastAPI adapters
context7_adapter = Context7Adapter()
figma_adapter = FigmaAdapter()

# Dictionary to store the adapters
adapters = {
    "context7": context7_adapter,
    "figma": figma_adapter
}


# Adapter functions for Context7 MCP server
@mcp.tool(description="Resolves a general library name into a Context7-compatible library ID.")
async def context7_resolve_library_id(ctx: Context, libraryName: str = None) -> dict:
    """Resolves a general library name into a Context7-compatible library ID."""
    try:
        return await context7_adapter.resolve_library_id(libraryName)
    except Exception as e:
        logger.error(f"Error resolving library ID: {e}")
        return {"error": str(e)}

@mcp.tool(description="Fetches documentation for a library using a Context7-compatible library ID.")
async def context7_get_library_docs(ctx: Context, context7CompatibleLibraryID: str, topic: str = None, tokens: int = 5000) -> dict:
    """Fetches documentation for a library using a Context7-compatible library ID."""
    try:
        return await context7_adapter.get_library_docs(context7CompatibleLibraryID, topic, tokens)
    except Exception as e:
        logger.error(f"Error getting library docs: {e}")
        return {"error": str(e)}


# Adapter functions for Figma MCP server
@mcp.tool(description="Retrieves a Figma file by its key.")
async def figma_get_file(ctx: Context, fileKey: str, accessToken: str = None) -> dict:
    """Retrieves a Figma file by its key."""
    try:
        return await figma_adapter.get_file(fileKey, accessToken)
    except Exception as e:
        logger.error(f"Error getting Figma file: {e}")
        return {"error": str(e)}

@mcp.tool(description="Retrieves components from a Figma file.")
async def figma_get_components(ctx: Context, fileKey: str, accessToken: str = None) -> dict:
    """Retrieves components from a Figma file."""
    try:
        return await figma_adapter.get_components(fileKey, accessToken)
    except Exception as e:
        logger.error(f"Error getting Figma components: {e}")
        return {"error": str(e)}

@mcp.tool(description="Retrieves styles from a Figma file.")
async def figma_get_styles(ctx: Context, fileKey: str, accessToken: str = None) -> dict:
    """Retrieves styles from a Figma file."""
    try:
        return await figma_adapter.get_styles(fileKey, accessToken)
    except Exception as e:
        logger.error(f"Error getting Figma styles: {e}")
        return {"error": str(e)}


# Function to initialize the adapters
async def initialize_adapters():
    """Initialize all the adapters."""
    for name, adapter in adapters.items():
        try:
            await adapter.initialize()
            logger.info(f"Initialized {name} adapter")
        except Exception as e:
            logger.error(f"Error initializing {adapter.server_name} adapter: {e}")


# Function to close the adapters
async def close_adapters():
    """Close all the adapters."""
    for name, adapter in adapters.items():
        try:
            await adapter.close()
            logger.info(f"Closed {name} adapter")
        except Exception as e:
            logger.error(f"Error closing {adapter.server_name} adapter: {e}")


def import_tools_from_server(source_mcp: FastMCP) -> List:
    """
    Import all tools from a source MCP server.

    Args:
        source_mcp: The source MCP server.

    Returns:
        A list of tools imported from the source server.
    """
    # In the actual implementation, we would use source_mcp.tools
    # But for testing purposes, we'll just return an empty list
    # if the tools attribute is not available
    if not hasattr(source_mcp, "_tools"):
        return []

    # Get all tools from the source server
    return source_mcp._tools


def register_tools_from_server(source_mcp: FastMCP, prefix: Optional[str] = None) -> None:
    """
    Register all tools from a source MCP server to the unified server.

    Args:
        source_mcp: The source MCP server.
        prefix: Optional prefix to add to the tool names.
    """
    # Get all tools from the source server
    tools = import_tools_from_server(source_mcp)

    # Register each tool with the unified server
    for tool in tools:
        # Add prefix to the tool name if provided
        if prefix:
            tool_name = f"{prefix}_{tool.name}"
        else:
            tool_name = tool.name

        # Register the tool with the unified server
# TODO: Need to re-implement registration/proxying for tools from other servers
# The previous method using register_tools_from_server and mcp.register_tool is incompatible.
# For now, only the adapter tools (Context7, Figma) decorated above will be available.
logger.warning("Tool registration from Supabase, Git, Sanity, Privy, Base servers is currently disabled due to incompatibility.")
logger.warning("Adapter initialization via on_startup/on_shutdown is disabled due to incompatibility.")

# Removed incompatible lifecycle hooks (@mcp.on_startup, @mcp.on_shutdown)
# The initialize_adapters() and close_adapters() functions are now unused here.
# Adapter initialization might need to be handled differently (e.g., lazily within tool calls).

# Add a main function to run the server
if __name__ == "__main__":
    # This script is intended to be run as a module by manage_servers.py
    # or potentially directly via `python -m servers.unified.server`
    # which might trigger internal FastMCP startup logic.
    # For now, do nothing here to avoid conflicts with manage_servers.py
    # If direct execution is needed, FastMCP's intended run method should be called.
    logger.info("Unified server script executed directly. Use manage_servers.py or `python -m` to run.")
    # Attempting to run stdio again, in case it's expected when run as module
    try:
        mcp.run_stdio()
    except AttributeError:
         logger.error("'FastMCP' object has no attribute 'run_stdio'. Server cannot start this way.")
    except Exception as e:
         logger.error(f"Error attempting to run FastMCP server: {e}")
