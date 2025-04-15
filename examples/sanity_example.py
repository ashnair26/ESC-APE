#!/usr/bin/env python3
"""
Example usage of the Sanity CMS MCP server.
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
        args=["-m", "servers.sanity.server"],  # Module to run
        env=None,  # Use current environment variables
    )
    
    print("Connecting to Sanity CMS MCP server...")
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            
            print("Connected to Sanity CMS MCP server!")
            
            # List available tools
            tools = await session.list_tools()
            print(f"\nAvailable tools: {[tool.name for tool in tools]}")
            
            # Example: Execute a GROQ query
            print("\n--- Executing a GROQ query ---")
            query_result = await session.call_tool(
                "sanity_query",
                arguments={
                    "query": "*[_type == 'post'][0...5]"
                }
            )
            print_json(query_result)
            
            # Example: Get a document by ID
            print("\n--- Getting a document by ID ---")
            document_result = await session.call_tool(
                "sanity_get_document",
                arguments={
                    "id": "drafts.1234567890"
                }
            )
            print_json(document_result)
            
            # Example: Create a document
            print("\n--- Creating a document ---")
            create_result = await session.call_tool(
                "sanity_create_document",
                arguments={
                    "document": json.dumps({
                        "_type": "post",
                        "title": "Hello, Sanity!",
                        "slug": {
                            "_type": "slug",
                            "current": "hello-sanity"
                        },
                        "body": [
                            {
                                "_type": "block",
                                "style": "normal",
                                "children": [
                                    {
                                        "_type": "span",
                                        "text": "This is a test post created via the MCP server."
                                    }
                                ]
                            }
                        ]
                    })
                }
            )
            print_json(create_result)
            
            # Example: Update a document
            print("\n--- Updating a document ---")
            update_result = await session.call_tool(
                "sanity_update_document",
                arguments={
                    "id": "drafts.1234567890",
                    "patch": json.dumps({
                        "title": "Updated Title"
                    })
                }
            )
            print_json(update_result)
            
            # Example: Get assets
            print("\n--- Getting assets ---")
            assets_result = await session.call_tool(
                "sanity_get_assets",
                arguments={
                    "type": "image",
                    "limit": 5
                }
            )
            print_json(assets_result)
            
            # Example: Get schema
            print("\n--- Getting schema ---")
            schema_result = await session.call_tool(
                "sanity_get_schema",
                arguments={}
            )
            print_json(schema_result)


def print_json(data: str):
    """Print JSON data in a readable format."""
    try:
        parsed = json.loads(data)
        print(json.dumps(parsed, indent=2))
    except json.JSONDecodeError:
        print(data)


if __name__ == "__main__":
    asyncio.run(run_example())
