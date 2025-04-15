#!/usr/bin/env python3
"""
Supabase MCP server implementation for the ESCAPE Creator Engine.
"""

import json
from typing import Any, Dict, List, Optional, Union

from mcp.server.fastmcp import FastMCP, Context

from core.utils import format_error_message
from servers.supabase.client import get_supabase_client, SupabaseClient

# Initialize the MCP server
mcp = FastMCP("ESCAPE Supabase Server")


@mcp.tool()
async def supabase_read(
    ctx: Context,
    table: str,
    select: str = "*",
    filters: Optional[str] = None,
    order: Optional[str] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = None
) -> str:
    """
    Read rows from a Supabase table with optional filtering and pagination.
    
    Args:
        table: The name of the table to read from
        select: Comma-separated list of columns to return (default: "*")
        filters: JSON string of filter conditions (e.g. {"column": "value"})
        order: Order by clause (e.g. "column.asc" or "column.desc")
        limit: Maximum number of rows to return
        offset: Number of rows to skip
        
    Returns:
        JSON string containing the rows that match the query
    """
    client = get_supabase_client(ctx)
    
    # Parse filters if provided
    parsed_filters = None
    if filters:
        try:
            parsed_filters = json.loads(filters)
        except json.JSONDecodeError:
            ctx.error(f"Invalid JSON in filters: {filters}")
            return json.dumps({"error": "Invalid filters format"})
    
    try:
        rows = await client.read_rows(
            table=table,
            select=select,
            filters=parsed_filters,
            order=order,
            limit=limit,
            offset=offset
        )
        return json.dumps(rows, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error reading from table {table}: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def supabase_create(
    ctx: Context,
    table: str,
    records: str
) -> str:
    """
    Create one or more records in a Supabase table.
    
    Args:
        table: The name of the table to create records in
        records: JSON string containing the record(s) to create
                Can be a single object or an array of objects
    
    Returns:
        JSON string containing the created records
    """
    client = get_supabase_client(ctx)
    
    try:
        # Parse the records JSON
        parsed_records = json.loads(records)
        
        # Create the records
        result = await client.create_records(table, parsed_records)
        
        return json.dumps(result, indent=2)
    except json.JSONDecodeError:
        ctx.error(f"Invalid JSON in records: {records}")
        return json.dumps({"error": "Invalid records format"})
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error creating records in table {table}: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def supabase_update(
    ctx: Context,
    table: str,
    records: str,
    match_column: str
) -> str:
    """
    Update one or more records in a Supabase table.
    
    Args:
        table: The name of the table to update records in
        records: JSON string containing the record(s) to update
                Can be a single object or an array of objects
        match_column: The column to use for matching records to update
    
    Returns:
        JSON string containing the updated records
    """
    client = get_supabase_client(ctx)
    
    try:
        # Parse the records JSON
        parsed_records = json.loads(records)
        
        # Update the records
        result = await client.update_records(table, parsed_records, match_column)
        
        return json.dumps(result, indent=2)
    except json.JSONDecodeError:
        ctx.error(f"Invalid JSON in records: {records}")
        return json.dumps({"error": "Invalid records format"})
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error updating records in table {table}: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def supabase_delete(
    ctx: Context,
    table: str,
    filters: str
) -> str:
    """
    Delete records from a Supabase table based on filters.
    
    Args:
        table: The name of the table to delete records from
        filters: JSON string of filter conditions (e.g. {"column": "value"})
                These are combined with AND logic
    
    Returns:
        JSON string containing the result of the delete operation
    """
    client = get_supabase_client(ctx)
    
    try:
        # Parse the filters JSON
        parsed_filters = json.loads(filters)
        
        # Delete the records
        result = await client.delete_records(table, parsed_filters)
        
        return json.dumps(result, indent=2)
    except json.JSONDecodeError:
        ctx.error(f"Invalid JSON in filters: {filters}")
        return json.dumps({"error": "Invalid filters format"})
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error deleting records from table {table}: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def supabase_rpc(
    ctx: Context,
    function_name: str,
    params: str
) -> str:
    """
    Execute a Postgres function via the Supabase REST API.
    
    Args:
        function_name: The name of the function to execute
        params: JSON string of parameters to pass to the function
    
    Returns:
        JSON string containing the result of the function execution
    """
    client = get_supabase_client(ctx)
    
    try:
        # Parse the params JSON
        parsed_params = json.loads(params)
        
        # Execute the function
        result = await client.execute_rpc(function_name, parsed_params)
        
        return json.dumps(result, indent=2)
    except json.JSONDecodeError:
        ctx.error(f"Invalid JSON in params: {params}")
        return json.dumps({"error": "Invalid params format"})
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error executing function {function_name}: {error_message}")
        return json.dumps({"error": error_message})


if __name__ == "__main__":
    # Run the server with stdio transport
    mcp.run()
