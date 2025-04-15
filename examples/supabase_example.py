#!/usr/bin/env python3
"""
Example usage of the Supabase MCP server.
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
        args=["-m", "servers.supabase.server"],  # Module to run
        env=None,  # Use current environment variables
    )
    
    print("Connecting to Supabase MCP server...")
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            
            print("Connected to Supabase MCP server!")
            
            # List available tools
            tools = await session.list_tools()
            print(f"\nAvailable tools: {[tool.name for tool in tools]}")
            
            # Example: Read from a table
            print("\n--- Reading from a table ---")
            read_result = await session.call_tool(
                "supabase_read",
                arguments={
                    "table": "users",
                    "select": "id,name,email",
                    "limit": 5
                }
            )
            print_json(read_result)
            
            # Example: Create a record
            print("\n--- Creating a record ---")
            create_result = await session.call_tool(
                "supabase_create",
                arguments={
                    "table": "users",
                    "records": json.dumps({
                        "name": "John Doe",
                        "email": "john@example.com"
                    })
                }
            )
            print_json(create_result)
            
            # Example: Update a record
            print("\n--- Updating a record ---")
            update_result = await session.call_tool(
                "supabase_update",
                arguments={
                    "table": "users",
                    "records": json.dumps({
                        "id": 1,
                        "name": "John Updated"
                    }),
                    "match_column": "id"
                }
            )
            print_json(update_result)
            
            # Example: Delete a record
            print("\n--- Deleting a record ---")
            delete_result = await session.call_tool(
                "supabase_delete",
                arguments={
                    "table": "users",
                    "filters": json.dumps({
                        "id": 1
                    })
                }
            )
            print_json(delete_result)
            
            # Example: Execute an RPC function
            print("\n--- Executing an RPC function ---")
            rpc_result = await session.call_tool(
                "supabase_rpc",
                arguments={
                    "function_name": "get_user_by_id",
                    "params": json.dumps({
                        "user_id": 1
                    })
                }
            )
            print_json(rpc_result)


def print_json(data: str):
    """Print JSON data in a readable format."""
    try:
        parsed = json.loads(data)
        print(json.dumps(parsed, indent=2))
    except json.JSONDecodeError:
        print(data)


if __name__ == "__main__":
    asyncio.run(run_example())
