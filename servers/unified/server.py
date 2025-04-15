#!/usr/bin/env python3
"""
Unified MCP server implementation for the ESCAPE Creator Engine.

This server combines all the individual MCP servers into a single server,
allowing LLMs to access all the tools from different servers without having
to connect to each one separately.
"""

import importlib
import inspect
from typing import Dict, List, Any, Callable, Optional

from mcp.server.fastmcp import FastMCP, Context, Tool

# Import all the individual MCP servers
from servers.supabase.server import mcp as supabase_mcp
from servers.git.server import mcp as git_mcp
from servers.sanity.server import mcp as sanity_mcp
from servers.privy.server import mcp as privy_mcp
from servers.base.server import mcp as base_mcp

# Initialize the unified MCP server
mcp = FastMCP("ESCAPE Unified Server")


def import_tools_from_server(source_mcp: FastMCP) -> List[Tool]:
    """
    Import all tools from a source MCP server.
    
    Args:
        source_mcp: The source MCP server.
        
    Returns:
        A list of tools imported from the source server.
    """
    tools = []
    
    # Get all tools from the source server
    for tool in source_mcp.tools:
        tools.append(tool)
    
    return tools


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


# Register tools from all individual servers
register_tools_from_server(supabase_mcp, prefix=None)
register_tools_from_server(git_mcp, prefix=None)
register_tools_from_server(sanity_mcp, prefix=None)
register_tools_from_server(privy_mcp, prefix=None)
register_tools_from_server(base_mcp, prefix=None)


if __name__ == "__main__":
    # Run the server with stdio transport
    mcp.run()
