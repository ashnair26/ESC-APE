#!/usr/bin/env python3
"""
Example usage of the authentication middleware.

This example demonstrates how to use the authentication middleware to protect
MCP tools and how to create and use API tokens.
"""

import os
import json
import asyncio
from typing import Dict, Any

from mcp.server.fastmcp import FastMCP, Context
from core.auth import setup_auth_middleware, require_auth, create_api_token


# Initialize the MCP server
mcp = FastMCP("Authentication Example Server")

# Set up authentication middleware
# In a real application, you would set the JWT_SECRET environment variable
# For this example, we'll use a hardcoded secret
os.environ["JWT_SECRET"] = "example_secret_key"

# Set up the authentication middleware
# For development, we can set skip_auth=True to bypass authentication
skip_auth = os.environ.get("SKIP_AUTH", "false").lower() == "true"
setup_auth_middleware(
    mcp_server=mcp,
    jwt_secret=os.environ.get("JWT_SECRET"),
    required_scopes=["example:access"],
    skip_auth=skip_auth
)


# Define a tool that requires authentication
@mcp.tool()
@require_auth(scopes=["example:read"])
async def protected_tool(ctx: Context, name: str) -> str:
    """
    A tool that requires authentication.
    
    Args:
        ctx: The MCP context.
        name: A name to greet.
        
    Returns:
        A greeting message.
    """
    # The user is available in the context if authentication succeeded
    user = getattr(ctx, "user", None)
    
    if user:
        return json.dumps({
            "message": f"Hello, {name}! You are authenticated as {user.username or user.id}.",
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "scopes": user.scopes
        })
    else:
        return json.dumps({
            "message": f"Hello, {name}! Authentication is disabled."
        })


# Define a tool that requires specific scopes
@mcp.tool()
@require_auth(scopes=["example:admin"])
async def admin_tool(ctx: Context) -> str:
    """
    A tool that requires admin privileges.
    
    Args:
        ctx: The MCP context.
        
    Returns:
        An admin message.
    """
    user = getattr(ctx, "user", None)
    
    if user:
        return json.dumps({
            "message": f"Welcome, admin {user.username or user.id}!",
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "scopes": user.scopes
        })
    else:
        return json.dumps({
            "message": "Welcome, admin! Authentication is disabled."
        })


# Define a tool that doesn't require authentication
@mcp.tool()
async def public_tool(ctx: Context) -> str:
    """
    A tool that doesn't require authentication.
    
    Args:
        ctx: The MCP context.
        
    Returns:
        A public message.
    """
    return json.dumps({
        "message": "This is a public tool that anyone can access."
    })


# Define a tool to create an API token for testing
@mcp.tool()
async def create_token(
    ctx: Context,
    user_id: str,
    username: str,
    role: str = "user",
    scopes: str = "example:access,example:read"
) -> str:
    """
    Create an API token for testing.
    
    Args:
        ctx: The MCP context.
        user_id: The ID of the user.
        username: The username of the user.
        role: The role of the user.
        scopes: Comma-separated list of scopes.
        
    Returns:
        The API token.
    """
    # Convert the scopes string to a list
    scope_list = scopes.split(",")
    
    # Create the token
    token = await create_api_token(
        user_id=user_id,
        username=username,
        role=role,
        scopes=scope_list
    )
    
    return json.dumps({
        "token": token,
        "user_id": user_id,
        "username": username,
        "role": role,
        "scopes": scope_list
    })


if __name__ == "__main__":
    # Run the server
    mcp.run()
