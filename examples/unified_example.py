#!/usr/bin/env python3
"""
Example usage of the unified MCP server.

This example demonstrates how to use the unified MCP server to access tools
from all the individual MCP servers (Supabase, Git, Sanity, Privy, and BASE).
"""

import asyncio
import json
from typing import Dict, Any, List

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def run_example():
    """Run the example."""
    # Create server parameters for stdio connection
    server_params = StdioServerParameters(
        command="python",  # Executable
        args=["-m", "servers.unified.server"],  # Module to run
        env=None,  # Use current environment variables
    )
    
    print("Connecting to Unified MCP server...")
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            
            print("Connected to Unified MCP server!")
            
            # List available tools
            tools = await session.list_tools()
            tool_names = [tool.name for tool in tools]
            
            # Group tools by server
            supabase_tools = [name for name in tool_names if name.startswith("supabase_")]
            git_tools = [name for name in tool_names if name.startswith("git_")]
            sanity_tools = [name for name in tool_names if name.startswith("sanity_")]
            privy_tools = [name for name in tool_names if name.startswith("privy_")]
            base_tools = [name for name in tool_names if name.startswith("base_")]
            
            # Print available tools by server
            print(f"\nTotal available tools: {len(tool_names)}")
            print(f"Supabase tools: {len(supabase_tools)}")
            print(f"Git tools: {len(git_tools)}")
            print(f"Sanity tools: {len(sanity_tools)}")
            print(f"Privy tools: {len(privy_tools)}")
            print(f"BASE tools: {len(base_tools)}")
            
            # Example: Use a tool from each server
            
            # Example: Supabase tool
            print("\n--- Using a Supabase tool ---")
            try:
                supabase_result = await session.call_tool(
                    "supabase_list_tables",
                    arguments={}
                )
                print_json(supabase_result)
            except Exception as e:
                print(f"Error using Supabase tool: {str(e)}")
            
            # Example: Git tool
            print("\n--- Using a Git tool ---")
            try:
                git_result = await session.call_tool(
                    "git_status_tool",
                    arguments={}
                )
                print_json(git_result)
            except Exception as e:
                print(f"Error using Git tool: {str(e)}")
            
            # Example: Sanity tool
            print("\n--- Using a Sanity tool ---")
            try:
                sanity_result = await session.call_tool(
                    "sanity_query",
                    arguments={
                        "query": "*[_type == 'post'][0...5]"
                    }
                )
                print_json(sanity_result)
            except Exception as e:
                print(f"Error using Sanity tool: {str(e)}")
            
            # Example: Privy tool
            print("\n--- Using a Privy tool ---")
            try:
                privy_result = await session.call_tool(
                    "privy_list_users",
                    arguments={
                        "limit": 5
                    }
                )
                print_json(privy_result)
            except Exception as e:
                print(f"Error using Privy tool: {str(e)}")
            
            # Example: BASE tool
            print("\n--- Using a BASE tool ---")
            try:
                base_result = await session.call_tool(
                    "base_get_gas_price",
                    arguments={
                        "network": "sepolia"
                    }
                )
                print_json(base_result)
            except Exception as e:
                print(f"Error using BASE tool: {str(e)}")


def print_json(data: str):
    """Print JSON data in a readable format."""
    try:
        parsed = json.loads(data)
        print(json.dumps(parsed, indent=2))
    except json.JSONDecodeError:
        print(data)


if __name__ == "__main__":
    asyncio.run(run_example())
