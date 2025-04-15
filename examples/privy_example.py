#!/usr/bin/env python3
"""
Example usage of the Privy authentication MCP server.
"""

import asyncio
import json
from typing import Dict, Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def run_example():
    """Run the example."""
    # Create server parameters for stdio connection
    server_params = StdioServerParameters(
        command="python",  # Executable
        args=["-m", "servers.privy.server"],  # Module to run
        env=None,  # Use current environment variables
    )
    
    print("Connecting to Privy Authentication MCP server...")
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            
            print("Connected to Privy Authentication MCP server!")
            
            # List available tools
            tools = await session.list_tools()
            print(f"\nAvailable tools: {[tool.name for tool in tools]}")
            
            # Example: Verify a token
            print("\n--- Verifying a token ---")
            verify_result = await session.call_tool(
                "privy_verify_token",
                arguments={
                    "token": "example-token"
                }
            )
            print_json(verify_result)
            
            # Example: Get a user
            print("\n--- Getting a user ---")
            user_result = await session.call_tool(
                "privy_get_user",
                arguments={
                    "user_id": "example-user-id"
                }
            )
            print_json(user_result)
            
            # Example: List users
            print("\n--- Listing users ---")
            list_result = await session.call_tool(
                "privy_list_users",
                arguments={
                    "limit": 5
                }
            )
            print_json(list_result)
            
            # Example: Create a user
            print("\n--- Creating a user ---")
            create_result = await session.call_tool(
                "privy_create_user",
                arguments={
                    "email": "example@example.com",
                    "wallet_address": "0x123456789abcdef",
                    "farcaster_fid": "example-fid",
                    "twitter_handle": "example_twitter",
                    "custom_fields": json.dumps({
                        "xp": 100,
                        "level": 1,
                        "whitelist_eligible": False
                    })
                }
            )
            print_json(create_result)
            
            # Example: Update a user
            print("\n--- Updating a user ---")
            update_result = await session.call_tool(
                "privy_update_user",
                arguments={
                    "user_id": "example-user-id",
                    "custom_fields": json.dumps({
                        "xp": 200,
                        "level": 2,
                        "whitelist_eligible": True
                    })
                }
            )
            print_json(update_result)
            
            # Example: Create an authentication token
            print("\n--- Creating an authentication token ---")
            token_result = await session.call_tool(
                "privy_create_auth_token",
                arguments={
                    "user_id": "example-user-id",
                    "expiration_seconds": 3600
                }
            )
            print_json(token_result)
            
            # Example: Revoke an authentication token
            print("\n--- Revoking an authentication token ---")
            revoke_result = await session.call_tool(
                "privy_revoke_auth_token",
                arguments={
                    "token": "example-token"
                }
            )
            print_json(revoke_result)
            
            # Example: Delete a user
            print("\n--- Deleting a user ---")
            delete_result = await session.call_tool(
                "privy_delete_user",
                arguments={
                    "user_id": "example-user-id"
                }
            )
            print_json(delete_result)


def print_json(data: str):
    """Print JSON data in a readable format."""
    try:
        parsed = json.loads(data)
        print(json.dumps(parsed, indent=2))
    except json.JSONDecodeError:
        print(data)


if __name__ == "__main__":
    asyncio.run(run_example())
