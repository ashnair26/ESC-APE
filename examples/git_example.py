#!/usr/bin/env python3
"""
Example usage of the Git MCP server.
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
        args=["-m", "servers.git.server"],  # Module to run
        env=None,  # Use current environment variables
    )
    
    print("Connecting to Git MCP server...")
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            
            print("Connected to Git MCP server!")
            
            # List available tools
            tools = await session.list_tools()
            print(f"\nAvailable tools: {[tool.name for tool in tools]}")
            
            # Example: Get repository status
            print("\n--- Getting repository status ---")
            status_result = await session.call_tool(
                "git_status_tool",
                arguments={}
            )
            print(status_result)
            
            # Example: Create a new file
            print("\n--- Creating a new file ---")
            with open("example.txt", "w") as f:
                f.write("This is an example file created by the Git MCP server example.")
            
            # Example: Add the file to the staging area
            print("\n--- Adding the file to the staging area ---")
            add_result = await session.call_tool(
                "git_add_tool",
                arguments={
                    "paths": "example.txt"
                }
            )
            print(add_result)
            
            # Example: Commit the changes
            print("\n--- Committing the changes ---")
            commit_result = await session.call_tool(
                "git_commit_tool",
                arguments={
                    "message": "Add example.txt"
                }
            )
            print(commit_result)
            
            # Example: View the commit history
            print("\n--- Viewing the commit history ---")
            log_result = await session.call_tool(
                "git_log_tool",
                arguments={
                    "n": 1,
                    "oneline": True
                }
            )
            print(log_result)
            
            # Example: Create a new branch
            print("\n--- Creating a new branch ---")
            branch_result = await session.call_tool(
                "git_branch_tool",
                arguments={
                    "name": "example-branch",
                    "checkout": True
                }
            )
            print(branch_result)
            
            # Example: Modify the file
            print("\n--- Modifying the file ---")
            with open("example.txt", "a") as f:
                f.write("\nThis line was added in the example-branch.")
            
            # Example: Show the differences
            print("\n--- Showing the differences ---")
            diff_result = await session.call_tool(
                "git_diff_tool",
                arguments={}
            )
            print(diff_result)
            
            # Example: Add and commit the changes
            print("\n--- Adding and committing the changes ---")
            add_result = await session.call_tool(
                "git_add_tool",
                arguments={
                    "paths": "example.txt"
                }
            )
            commit_result = await session.call_tool(
                "git_commit_tool",
                arguments={
                    "message": "Update example.txt in example-branch"
                }
            )
            print(commit_result)
            
            # Example: Switch back to the main branch
            print("\n--- Switching back to the main branch ---")
            branch_result = await session.call_tool(
                "git_branch_tool",
                arguments={
                    "name": "main",
                    "checkout": True
                }
            )
            print(branch_result)
            
            # Example: List all branches
            print("\n--- Listing all branches ---")
            branch_result = await session.call_tool(
                "git_branch_tool",
                arguments={
                    "list_all": True
                }
            )
            print(branch_result)
            
            # Clean up
            print("\n--- Cleaning up ---")
            import os
            os.remove("example.txt")


if __name__ == "__main__":
    asyncio.run(run_example())
