#!/usr/bin/env python3
"""
Command-line interface for managing authentication.

This script provides a command-line interface for managing API tokens and JWT tokens
in the ESCAPE Creator Engine.
"""

import os
import sys
import json
import asyncio
import argparse
from typing import Optional, Dict, Any, List

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from core.auth import create_api_token, revoke_api_token, create_jwt_token
from core.secrets import list_secrets


async def list_tokens_cmd(args: argparse.Namespace) -> None:
    """
    List all API tokens.
    
    Args:
        args: The command-line arguments.
    """
    # Get all secrets that start with "api_token:"
    all_secrets = await list_secrets()
    api_tokens = [s for s in all_secrets if s["name"].startswith("api_token:")]
    
    if not api_tokens:
        print("No API tokens found.")
        return
    
    # Print the tokens in a table format
    print(f"{'Token':<40} {'User ID':<20} {'Username':<20} {'Role':<10} {'Scopes':<30}")
    print("-" * 120)
    
    for token_secret in api_tokens:
        # Extract the token from the name
        token = token_secret["name"].replace("api_token:", "")
        
        # Get the token data
        from core.secrets import get_secret
        token_data_str = await get_secret(token_secret["name"])
        
        if not token_data_str:
            continue
        
        try:
            token_data = json.loads(token_data_str)
            user_id = token_data.get("id", "")
            username = token_data.get("username", "")
            role = token_data.get("role", "")
            scopes = ", ".join(token_data.get("scopes", []))
            
            # Truncate the token for display
            display_token = token[:10] + "..." + token[-5:]
            
            print(f"{display_token:<40} {user_id:<20} {username:<20} {role:<10} {scopes:<30}")
        except json.JSONDecodeError:
            print(f"{token[:10]}...{token[-5:]} <Invalid token data>")


async def create_token_cmd(args: argparse.Namespace) -> None:
    """
    Create a new API token.
    
    Args:
        args: The command-line arguments.
    """
    user_id = args.user_id
    username = args.username
    email = args.email
    role = args.role
    scopes = args.scopes.split(",") if args.scopes else []
    expires_in = args.expires_in
    
    token = await create_api_token(
        user_id=user_id,
        username=username,
        email=email,
        role=role,
        scopes=scopes,
        expires_in=expires_in
    )
    
    print(f"API token created successfully: {token}")
    print("Keep this token secure! It will not be shown again.")


async def revoke_token_cmd(args: argparse.Namespace) -> None:
    """
    Revoke an API token.
    
    Args:
        args: The command-line arguments.
    """
    token = args.token
    
    result = await revoke_api_token(token)
    
    if result:
        print(f"API token revoked successfully.")
    else:
        print(f"Failed to revoke API token. Token may not exist.")


async def create_jwt_cmd(args: argparse.Namespace) -> None:
    """
    Create a new JWT token.
    
    Args:
        args: The command-line arguments.
    """
    user_id = args.user_id
    username = args.username
    email = args.email
    role = args.role
    scopes = args.scopes.split(",") if args.scopes else []
    expires_in = args.expires_in
    
    try:
        token = await create_jwt_token(
            user_id=user_id,
            username=username,
            email=email,
            role=role,
            scopes=scopes,
            expires_in=expires_in
        )
        
        print(f"JWT token created successfully: {token}")
        print("Keep this token secure! It will not be shown again.")
    except ValueError as e:
        print(f"Error: {str(e)}")
        print("Make sure the JWT_SECRET environment variable is set.")


def main() -> None:
    """
    Main entry point for the CLI.
    """
    parser = argparse.ArgumentParser(description="Manage authentication for the ESCAPE Creator Engine.")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # List tokens command
    list_parser = subparsers.add_parser("list", help="List all API tokens")
    
    # Create API token command
    create_parser = subparsers.add_parser("create", help="Create a new API token")
    create_parser.add_argument("user_id", help="The ID of the user")
    create_parser.add_argument("--username", help="The username of the user")
    create_parser.add_argument("--email", help="The email of the user")
    create_parser.add_argument("--role", help="The role of the user")
    create_parser.add_argument("--scopes", help="Comma-separated list of scopes")
    create_parser.add_argument("--expires-in", type=int, help="Number of seconds until the token expires")
    
    # Revoke API token command
    revoke_parser = subparsers.add_parser("revoke", help="Revoke an API token")
    revoke_parser.add_argument("token", help="The API token to revoke")
    
    # Create JWT token command
    jwt_parser = subparsers.add_parser("create-jwt", help="Create a new JWT token")
    jwt_parser.add_argument("user_id", help="The ID of the user")
    jwt_parser.add_argument("--username", help="The username of the user")
    jwt_parser.add_argument("--email", help="The email of the user")
    jwt_parser.add_argument("--role", help="The role of the user")
    jwt_parser.add_argument("--scopes", help="Comma-separated list of scopes")
    jwt_parser.add_argument("--expires-in", type=int, help="Number of seconds until the token expires")
    
    args = parser.parse_args()
    
    if args.command == "list":
        asyncio.run(list_tokens_cmd(args))
    elif args.command == "create":
        asyncio.run(create_token_cmd(args))
    elif args.command == "revoke":
        asyncio.run(revoke_token_cmd(args))
    elif args.command == "create-jwt":
        asyncio.run(create_jwt_cmd(args))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
