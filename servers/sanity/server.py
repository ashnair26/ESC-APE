#!/usr/bin/env python3
"""
Sanity CMS MCP server implementation for the ESCAPE Creator Engine.
"""

import json
from typing import Dict, List, Optional, Any, Union

from mcp.server.fastmcp import FastMCP, Context

from core.utils import format_error_message
from servers.sanity.client import get_sanity_client, SanityClient

# Initialize the MCP server
mcp = FastMCP("ESCAPE Sanity CMS Server")


@mcp.tool()
async def sanity_query(
    ctx: Context,
    query: str,
    params: Optional[str] = None,
    creator_id: Optional[str] = None
) -> str:
    """
    Execute a GROQ query against the Sanity dataset.

    Args:
        query: The GROQ query to execute
        params: JSON string of parameters to substitute in the query
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the query results
    """
    client = await get_sanity_client(ctx, creator_id)

    # Parse parameters if provided
    parsed_params = None
    if params:
        try:
            parsed_params = json.loads(params)
        except json.JSONDecodeError:
            ctx.error(f"Invalid JSON in params: {params}")
            return json.dumps({"error": "Invalid params format"})

    try:
        result = await client.query(query, parsed_params)
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error executing query: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def sanity_get_document(
    ctx: Context,
    id: str,
    creator_id: Optional[str] = None
) -> str:
    """
    Get a document by ID.

    Args:
        id: The document ID
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the document
    """
    client = await get_sanity_client(ctx, creator_id)

    try:
        document = await client.get_document(id)
        return json.dumps(document, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error getting document: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def sanity_create_document(
    ctx: Context,
    document: str,
    creator_id: Optional[str] = None
) -> str:
    """
    Create a new document.

    Args:
        document: JSON string containing the document to create
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the created document
    """
    client = await get_sanity_client(ctx, creator_id)

    try:
        # Parse the document JSON
        parsed_document = json.loads(document)

        # Create the document
        result = await client.create_document(parsed_document)

        return json.dumps(result, indent=2)
    except json.JSONDecodeError:
        ctx.error(f"Invalid JSON in document: {document}")
        return json.dumps({"error": "Invalid document format"})
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error creating document: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def sanity_update_document(
    ctx: Context,
    id: str,
    patch: str,
    creator_id: Optional[str] = None
) -> str:
    """
    Update a document by ID.

    Args:
        id: The document ID
        patch: JSON string containing the patch to apply to the document
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the result of the update operation
    """
    client = await get_sanity_client(ctx, creator_id)

    try:
        # Parse the patch JSON
        parsed_patch = json.loads(patch)

        # Update the document
        result = await client.update_document(id, parsed_patch)

        return json.dumps(result, indent=2)
    except json.JSONDecodeError:
        ctx.error(f"Invalid JSON in patch: {patch}")
        return json.dumps({"error": "Invalid patch format"})
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error updating document: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def sanity_delete_document(
    ctx: Context,
    id: str,
    creator_id: Optional[str] = None
) -> str:
    """
    Delete a document by ID.

    Args:
        id: The document ID
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the result of the delete operation
    """
    client = await get_sanity_client(ctx, creator_id)

    try:
        result = await client.delete_document(id)
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error deleting document: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def sanity_get_assets(
    ctx: Context,
    type: str = "image",
    limit: int = 100,
    offset: int = 0,
    creator_id: Optional[str] = None
) -> str:
    """
    Get assets from the Sanity dataset.

    Args:
        type: The type of asset to get (image or file)
        limit: Maximum number of assets to return
        offset: Number of assets to skip
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the assets
    """
    client = await get_sanity_client(ctx, creator_id)

    try:
        result = await client.get_assets(type, limit, offset)
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error getting assets: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def sanity_get_schema(
    ctx: Context,
    creator_id: Optional[str] = None
) -> str:
    """
    Get the schema for the Sanity dataset.

    Args:
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the schema
    """
    client = await get_sanity_client(ctx, creator_id)

    try:
        result = await client.get_schema()
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error getting schema: {error_message}")
        return json.dumps({"error": error_message})


if __name__ == "__main__":
    # Run the server with stdio transport
    mcp.run()
