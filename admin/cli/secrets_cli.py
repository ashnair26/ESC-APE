#!/usr/bin/env python3
"""
Command-line interface for managing secrets.

This script provides a command-line interface for managing secrets in the
ESCAPE Creator Engine. It allows you to list, get, set, and delete secrets.
"""

import os
import sys
import json
import asyncio
import argparse
from typing import Optional, Dict, Any, List

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from core.secrets import get_secret, set_secret, delete_secret, list_secrets


async def list_secrets_cmd(args: argparse.Namespace) -> None:
    """
    List all secrets.
    
    Args:
        args: The command-line arguments.
    """
    creator_id = args.creator_id
    
    secrets = await list_secrets(creator_id)
    
    if not secrets:
        print("No secrets found.")
        return
    
    # Print the secrets in a table format
    print(f"{'ID':<36} {'Name':<30} {'Creator ID':<36} {'Description':<30}")
    print("-" * 132)
    
    for secret in secrets:
        print(f"{secret['id']:<36} {secret['name']:<30} {secret['creator_id'] or '':<36} {secret['description'] or '':<30}")


async def get_secret_cmd(args: argparse.Namespace) -> None:
    """
    Get a secret.
    
    Args:
        args: The command-line arguments.
    """
    name = args.name
    creator_id = args.creator_id
    
    value = await get_secret(name, creator_id)
    
    if value is None:
        print(f"Secret '{name}' not found.")
        return
    
    print(f"Secret '{name}':")
    print(f"Value: {value}")


async def set_secret_cmd(args: argparse.Namespace) -> None:
    """
    Set a secret.
    
    Args:
        args: The command-line arguments.
    """
    name = args.name
    value = args.value
    creator_id = args.creator_id
    description = args.description
    
    result = await set_secret(name, value, creator_id, description)
    
    if result:
        print(f"Secret '{name}' set successfully.")
    else:
        print(f"Failed to set secret '{name}'.")


async def delete_secret_cmd(args: argparse.Namespace) -> None:
    """
    Delete a secret.
    
    Args:
        args: The command-line arguments.
    """
    name = args.name
    creator_id = args.creator_id
    
    result = await delete_secret(name, creator_id)
    
    if result:
        print(f"Secret '{name}' deleted successfully.")
    else:
        print(f"Failed to delete secret '{name}'.")


def main() -> None:
    """
    Main entry point for the CLI.
    """
    parser = argparse.ArgumentParser(description="Manage secrets for the ESCAPE Creator Engine.")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # List secrets command
    list_parser = subparsers.add_parser("list", help="List all secrets")
    list_parser.add_argument("--creator-id", help="Filter by creator ID")
    
    # Get secret command
    get_parser = subparsers.add_parser("get", help="Get a secret")
    get_parser.add_argument("name", help="The name of the secret")
    get_parser.add_argument("--creator-id", help="The creator ID")
    
    # Set secret command
    set_parser = subparsers.add_parser("set", help="Set a secret")
    set_parser.add_argument("name", help="The name of the secret")
    set_parser.add_argument("value", help="The value of the secret")
    set_parser.add_argument("--creator-id", help="The creator ID")
    set_parser.add_argument("--description", help="A description of the secret")
    
    # Delete secret command
    delete_parser = subparsers.add_parser("delete", help="Delete a secret")
    delete_parser.add_argument("name", help="The name of the secret")
    delete_parser.add_argument("--creator-id", help="The creator ID")
    
    # Generate key command
    key_parser = subparsers.add_parser("generate-key", help="Generate a new encryption key")
    
    args = parser.parse_args()
    
    if args.command == "list":
        asyncio.run(list_secrets_cmd(args))
    elif args.command == "get":
        asyncio.run(get_secret_cmd(args))
    elif args.command == "set":
        asyncio.run(set_secret_cmd(args))
    elif args.command == "delete":
        asyncio.run(delete_secret_cmd(args))
    elif args.command == "generate-key":
        from cryptography.fernet import Fernet
        key = Fernet.generate_key()
        print(f"Generated encryption key: {key.decode()}")
        print("Add this key to your environment variables as SECRETS_ENCRYPTION_KEY")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
