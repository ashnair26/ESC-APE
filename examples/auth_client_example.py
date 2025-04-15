#!/usr/bin/env python3
"""
Example client for the authentication middleware.

This example demonstrates how to use the authentication middleware from a client
by sending API tokens or JWT tokens in the request headers.
"""

import os
import sys
import json
import asyncio
from typing import Dict, Any, Optional

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def run_example():
    """Run the example."""
    # Create server parameters for stdio connection
    server_params = StdioServerParameters(
        command="python",  # Executable
        args=["-m", "examples.auth_example"],  # Module to run
        env={"SKIP_AUTH": "false"},  # Enable authentication
    )
    
    print("Connecting to Authentication Example Server...")
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            
            print("Connected to Authentication Example Server!")
            
            # List available tools
            tools = await session.list_tools()
            print(f"\nAvailable tools: {[tool.name for tool in tools]}")
            
            # Try to access the protected tool without authentication
            print("\n--- Accessing protected tool without authentication ---")
            try:
                result = await session.call_tool(
                    "protected_tool",
                    arguments={"name": "Anonymous"}
                )
                print(json.loads(result))
            except Exception as e:
                print(f"Error: {str(e)}")
            
            # Create an API token for testing
            print("\n--- Creating an API token ---")
            token_result = await session.call_tool(
                "create_token",
                arguments={
                    "user_id": "test-user",
                    "username": "testuser",
                    "role": "user",
                    "scopes": "example:access,example:read"
                }
            )
            token_data = json.loads(token_result)
            api_token = token_data["token"]
            print(f"API token created: {api_token[:10]}...{api_token[-5:]}")
            
            # Create a new session with the API token
            print("\n--- Creating a new session with the API token ---")
            # Close the current session
            await session.shutdown()
            
            # Create a new session with the API token in the headers
            async with stdio_client(server_params) as (read, write):
                # Set the API token in the headers
                headers = {"X-API-Token": api_token}
                
                async with ClientSession(read, write, headers=headers) as auth_session:
                    # Initialize the connection
                    await auth_session.initialize()
                    
                    print("Connected with API token!")
                    
                    # Try to access the protected tool with authentication
                    print("\n--- Accessing protected tool with authentication ---")
                    try:
                        result = await auth_session.call_tool(
                            "protected_tool",
                            arguments={"name": "Authenticated User"}
                        )
                        print(json.loads(result))
                    except Exception as e:
                        print(f"Error: {str(e)}")
                    
                    # Try to access the admin tool without admin scope
                    print("\n--- Accessing admin tool without admin scope ---")
                    try:
                        result = await auth_session.call_tool(
                            "admin_tool",
                            arguments={}
                        )
                        print(json.loads(result))
                    except Exception as e:
                        print(f"Error: {str(e)}")
                    
                    # Access the public tool
                    print("\n--- Accessing public tool ---")
                    try:
                        result = await auth_session.call_tool(
                            "public_tool",
                            arguments={}
                        )
                        print(json.loads(result))
                    except Exception as e:
                        print(f"Error: {str(e)}")
            
            # Create an admin API token
            print("\n--- Creating an admin API token ---")
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    # Initialize the connection
                    await session.initialize()
                    
                    token_result = await session.call_tool(
                        "create_token",
                        arguments={
                            "user_id": "admin-user",
                            "username": "adminuser",
                            "role": "admin",
                            "scopes": "example:access,example:read,example:admin"
                        }
                    )
                    token_data = json.loads(token_result)
                    admin_token = token_data["token"]
                    print(f"Admin API token created: {admin_token[:10]}...{admin_token[-5:]}")
            
            # Create a new session with the admin API token
            print("\n--- Creating a new session with the admin API token ---")
            async with stdio_client(server_params) as (read, write):
                # Set the admin API token in the headers
                headers = {"X-API-Token": admin_token}
                
                async with ClientSession(read, write, headers=headers) as admin_session:
                    # Initialize the connection
                    await admin_session.initialize()
                    
                    print("Connected with admin API token!")
                    
                    # Try to access the admin tool with admin scope
                    print("\n--- Accessing admin tool with admin scope ---")
                    try:
                        result = await admin_session.call_tool(
                            "admin_tool",
                            arguments={}
                        )
                        print(json.loads(result))
                    except Exception as e:
                        print(f"Error: {str(e)}")


if __name__ == "__main__":
    asyncio.run(run_example())
