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
async def context7_resolve_library_id(ctx: Context, libraryName: str = None) -> dict:
    """Resolves a general library name into a Context7-compatible library ID."""
    try:
        return await context7_adapter.resolve_library_id(libraryName)
    except Exception as e:
        logger.error(f"Error resolving library ID: {e}")
        return {"error": str(e)}


async def context7_get_library_docs(ctx: Context, context7CompatibleLibraryID: str, topic: str = None, tokens: int = 5000) -> dict:
    """Fetches documentation for a library using a Context7-compatible library ID."""
    try:
        return await context7_adapter.get_library_docs(context7CompatibleLibraryID, topic, tokens)
    except Exception as e:
        logger.error(f"Error getting library docs: {e}")
        return {"error": str(e)}


# Adapter functions for Figma MCP server
async def figma_get_file(ctx: Context, fileKey: str, accessToken: str = None) -> dict:
    """Retrieves a Figma file by its key."""
    try:
        return await figma_adapter.get_file(fileKey, accessToken)
    except Exception as e:
        logger.error(f"Error getting Figma file: {e}")
        return {"error": str(e)}


async def figma_get_components(ctx: Context, fileKey: str, accessToken: str = None) -> dict:
    """Retrieves components from a Figma file."""
    try:
        return await figma_adapter.get_components(fileKey, accessToken)
    except Exception as e:
        logger.error(f"Error getting Figma components: {e}")
        return {"error": str(e)}


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
        mcp.register_tool(
            name=tool_name,
            func=tool.func,
            description=tool.description
        )


# Register tools from FastMCP-based servers
register_tools_from_server(supabase_mcp, prefix="supabase")
register_tools_from_server(git_mcp, prefix="git")
register_tools_from_server(sanity_mcp, prefix="sanity")
register_tools_from_server(privy_mcp, prefix="privy")
register_tools_from_server(base_mcp, prefix="base")

# Register Context7 tools
mcp.register_tool(
    name="context7_resolve_library_id",
    func=context7_resolve_library_id,
    description="Resolves a general library name into a Context7-compatible library ID"
)

mcp.register_tool(
    name="context7_get_library_docs",
    func=context7_get_library_docs,
    description="Fetches documentation for a library using a Context7-compatible library ID"
)

# Register Figma tools
mcp.register_tool(
    name="figma_get_file",
    func=figma_get_file,
    description="Retrieves a Figma file by its key"
)

mcp.register_tool(
    name="figma_get_components",
    func=figma_get_components,
    description="Retrieves components from a Figma file"
)

mcp.register_tool(
    name="figma_get_styles",
    func=figma_get_styles,
    description="Retrieves styles from a Figma file"
)


# Add lifecycle hooks
@mcp.on_startup
async def startup():
    """Initialize the adapters when the server starts."""
    logger.info("Initializing adapters...")
    await initialize_adapters()
    logger.info("Adapters initialized")


@mcp.on_shutdown
async def shutdown():
    """Close the adapters when the server shuts down."""
    logger.info("Closing adapters...")
    await close_adapters()
    logger.info("Adapters closed")


# Add a main function to run the server
if __name__ == "__main__":
    import uvicorn
    import asyncio

    # Initialize the adapters
    asyncio.run(initialize_adapters())

    # Run the server
    mcp.run_stdio()