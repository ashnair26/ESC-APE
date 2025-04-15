#!/usr/bin/env python3
"""
Privy authentication MCP server implementation for the ESCAPE Creator Engine.
"""

import json
from typing import Dict, List, Optional, Any

from mcp.server.fastmcp import FastMCP, Context

from core.utils import format_error_message
from servers.privy.client import get_privy_client

# Initialize the MCP server
mcp = FastMCP("ESCAPE Privy Authentication Server")


@mcp.tool()
async def privy_verify_token(
    ctx: Context,
    token: str,
    creator_id: Optional[str] = None
) -> str:
    """
    Verify a Privy authentication token.
    
    Args:
        token: The token to verify
        creator_id: The ID of the creator to get secrets for
        
    Returns:
        JSON string containing the user data if the token is valid
    """
    client = await get_privy_client(ctx, creator_id)
    
    try:
        result = await client.verify_token(token)
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error verifying token: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def privy_get_user(
    ctx: Context,
    user_id: str,
    creator_id: Optional[str] = None
) -> str:
    """
    Get a user by ID.
    
    Args:
        user_id: The user ID
        creator_id: The ID of the creator to get secrets for
        
    Returns:
        JSON string containing the user data
    """
    client = await get_privy_client(ctx, creator_id)
    
    try:
        result = await client.get_user(user_id)
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error getting user: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def privy_list_users(
    ctx: Context,
    limit: int = 100,
    cursor: Optional[str] = None,
    creator_id: Optional[str] = None
) -> str:
    """
    List users.
    
    Args:
        limit: The maximum number of users to return
        cursor: The cursor for pagination
        creator_id: The ID of the creator to get secrets for
        
    Returns:
        JSON string containing the users data
    """
    client = await get_privy_client(ctx, creator_id)
    
    try:
        result = await client.list_users(limit, cursor)
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error listing users: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def privy_create_user(
    ctx: Context,
    email: Optional[str] = None,
    wallet_address: Optional[str] = None,
    farcaster_fid: Optional[str] = None,
    twitter_handle: Optional[str] = None,
    linked_accounts: Optional[str] = None,
    custom_fields: Optional[str] = None,
    creator_id: Optional[str] = None
) -> str:
    """
    Create a new user.
    
    Args:
        email: The user's email address
        wallet_address: The user's wallet address
        farcaster_fid: The user's Farcaster FID
        twitter_handle: The user's Twitter handle
        linked_accounts: JSON string containing additional linked accounts
        custom_fields: JSON string containing custom fields to include in the user data
        creator_id: The ID of the creator to get secrets for
        
    Returns:
        JSON string containing the created user data
    """
    client = await get_privy_client(ctx, creator_id)
    
    try:
        # Parse linked_accounts if provided
        parsed_linked_accounts = None
        if linked_accounts:
            try:
                parsed_linked_accounts = json.loads(linked_accounts)
            except json.JSONDecodeError:
                ctx.error(f"Invalid JSON in linked_accounts: {linked_accounts}")
                return json.dumps({"error": "Invalid linked_accounts format"})
        
        # Parse custom_fields if provided
        parsed_custom_fields = None
        if custom_fields:
            try:
                parsed_custom_fields = json.loads(custom_fields)
            except json.JSONDecodeError:
                ctx.error(f"Invalid JSON in custom_fields: {custom_fields}")
                return json.dumps({"error": "Invalid custom_fields format"})
        
        result = await client.create_user(
            email=email,
            wallet_address=wallet_address,
            farcaster_fid=farcaster_fid,
            twitter_handle=twitter_handle,
            linked_accounts=parsed_linked_accounts,
            custom_fields=parsed_custom_fields
        )
        
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error creating user: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def privy_update_user(
    ctx: Context,
    user_id: str,
    email: Optional[str] = None,
    wallet_address: Optional[str] = None,
    farcaster_fid: Optional[str] = None,
    twitter_handle: Optional[str] = None,
    linked_accounts: Optional[str] = None,
    custom_fields: Optional[str] = None,
    creator_id: Optional[str] = None
) -> str:
    """
    Update a user.
    
    Args:
        user_id: The user ID
        email: The user's email address
        wallet_address: The user's wallet address
        farcaster_fid: The user's Farcaster FID
        twitter_handle: The user's Twitter handle
        linked_accounts: JSON string containing additional linked accounts
        custom_fields: JSON string containing custom fields to include in the user data
        creator_id: The ID of the creator to get secrets for
        
    Returns:
        JSON string containing the updated user data
    """
    client = await get_privy_client(ctx, creator_id)
    
    try:
        # Parse linked_accounts if provided
        parsed_linked_accounts = None
        if linked_accounts:
            try:
                parsed_linked_accounts = json.loads(linked_accounts)
            except json.JSONDecodeError:
                ctx.error(f"Invalid JSON in linked_accounts: {linked_accounts}")
                return json.dumps({"error": "Invalid linked_accounts format"})
        
        # Parse custom_fields if provided
        parsed_custom_fields = None
        if custom_fields:
            try:
                parsed_custom_fields = json.loads(custom_fields)
            except json.JSONDecodeError:
                ctx.error(f"Invalid JSON in custom_fields: {custom_fields}")
                return json.dumps({"error": "Invalid custom_fields format"})
        
        result = await client.update_user(
            user_id=user_id,
            email=email,
            wallet_address=wallet_address,
            farcaster_fid=farcaster_fid,
            twitter_handle=twitter_handle,
            linked_accounts=parsed_linked_accounts,
            custom_fields=parsed_custom_fields
        )
        
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error updating user: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def privy_delete_user(
    ctx: Context,
    user_id: str,
    creator_id: Optional[str] = None
) -> str:
    """
    Delete a user.
    
    Args:
        user_id: The user ID
        creator_id: The ID of the creator to get secrets for
        
    Returns:
        JSON string containing the response data
    """
    client = await get_privy_client(ctx, creator_id)
    
    try:
        result = await client.delete_user(user_id)
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error deleting user: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def privy_create_auth_token(
    ctx: Context,
    user_id: str,
    expiration_seconds: int = 3600,
    creator_id: Optional[str] = None
) -> str:
    """
    Create an authentication token for a user.
    
    Args:
        user_id: The user ID
        expiration_seconds: The token expiration time in seconds
        creator_id: The ID of the creator to get secrets for
        
    Returns:
        JSON string containing the token data
    """
    client = await get_privy_client(ctx, creator_id)
    
    try:
        result = await client.create_auth_token(user_id, expiration_seconds)
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error creating auth token: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def privy_revoke_auth_token(
    ctx: Context,
    token: str,
    creator_id: Optional[str] = None
) -> str:
    """
    Revoke an authentication token.
    
    Args:
        token: The token to revoke
        creator_id: The ID of the creator to get secrets for
        
    Returns:
        JSON string containing the response data
    """
    client = await get_privy_client(ctx, creator_id)
    
    try:
        result = await client.revoke_auth_token(token)
        return json.dumps(result, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error revoking auth token: {error_message}")
        return json.dumps({"error": error_message})


if __name__ == "__main__":
    # Run the server with stdio transport
    mcp.run()
