#!/usr/bin/env python3
"""
Privy authentication client implementation for the ESCAPE Creator Engine.
"""

import json
import logging
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass

import httpx
from mcp.server.fastmcp import Context

from core.utils import get_env_var, format_error_message
from core.secrets import get_secret

# Configure logging
logger = logging.getLogger(__name__)


@dataclass
class PrivyClient:
    """
    Client for interacting with the Privy authentication API.
    """
    
    app_id: str
    api_key: str
    base_url: str = "https://auth.privy.io/api/v1"
    
    @classmethod
    async def from_env(cls, creator_id: Optional[str] = None) -> "PrivyClient":
        """
        Create a PrivyClient from environment variables and secrets manager.
        
        Args:
            creator_id: The ID of the creator to get secrets for.
            
        Returns:
            A PrivyClient instance.
            
        Raises:
            ValueError: If the required environment variables are not set.
        """
        # Get app ID from environment variables
        app_id = get_env_var("PRIVY_APP_ID")
        
        # Try to get the API key from the secrets manager first
        api_key_name = "PRIVY_API_KEY"
        api_key = await get_secret(api_key_name, creator_id)
        
        # If the API key is not in the secrets manager, try to get it from environment variables
        if api_key is None:
            api_key = get_env_var("PRIVY_API_KEY")
        
        # Get the base URL from environment variables or use the default
        base_url = get_env_var("PRIVY_BASE_URL", "https://auth.privy.io/api/v1")
        
        return cls(
            app_id=app_id,
            api_key=api_key,
            base_url=base_url
        )
    
    async def _request(
        self, 
        method: str, 
        path: str, 
        json_data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a request to the Privy API.
        
        Args:
            method: The HTTP method to use.
            path: The path to request.
            json_data: The JSON data to send in the request body.
            params: The query parameters to include in the request.
            
        Returns:
            The response data.
            
        Raises:
            Exception: If the request fails.
        """
        # Ensure path starts with a slash
        if not path.startswith("/"):
            path = f"/{path}"
        
        # Build the full URL
        url = f"{self.base_url}{path}"
        
        # Set up headers
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "x-privy-app-id": self.app_id
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=method,
                url=url,
                headers=headers,
                json=json_data,
                params=params
            )
            
            if response.status_code >= 400:
                error_msg = f"Privy API error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                raise Exception(error_msg)
                
            return response.json()
    
    async def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verify a Privy authentication token.
        
        Args:
            token: The token to verify.
            
        Returns:
            The user data if the token is valid.
            
        Raises:
            Exception: If the token is invalid.
        """
        return await self._request(
            method="POST",
            path="/auth/verify",
            json_data={"token": token}
        )
    
    async def get_user(self, user_id: str) -> Dict[str, Any]:
        """
        Get a user by ID.
        
        Args:
            user_id: The user ID.
            
        Returns:
            The user data.
            
        Raises:
            Exception: If the user is not found.
        """
        return await self._request(
            method="GET",
            path=f"/users/{user_id}"
        )
    
    async def list_users(
        self, 
        limit: int = 100, 
        cursor: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        List users.
        
        Args:
            limit: The maximum number of users to return.
            cursor: The cursor for pagination.
            
        Returns:
            The users data.
        """
        params = {"limit": limit}
        if cursor:
            params["cursor"] = cursor
        
        return await self._request(
            method="GET",
            path="/users",
            params=params
        )
    
    async def create_user(
        self, 
        email: Optional[str] = None,
        wallet_address: Optional[str] = None,
        farcaster_fid: Optional[str] = None,
        twitter_handle: Optional[str] = None,
        linked_accounts: Optional[List[Dict[str, Any]]] = None,
        custom_fields: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a new user.
        
        Args:
            email: The user's email address.
            wallet_address: The user's wallet address.
            farcaster_fid: The user's Farcaster FID.
            twitter_handle: The user's Twitter handle.
            linked_accounts: Additional linked accounts.
            custom_fields: Custom fields to include in the user data.
            
        Returns:
            The created user data.
            
        Raises:
            Exception: If the user could not be created.
        """
        # Build the request data
        data: Dict[str, Any] = {}
        
        if email:
            data["email"] = email
        
        if wallet_address:
            data["wallet"] = {"address": wallet_address}
        
        if farcaster_fid or twitter_handle or linked_accounts:
            data["linked_accounts"] = linked_accounts or []
            
            if farcaster_fid:
                data["linked_accounts"].append({
                    "type": "farcaster",
                    "fid": farcaster_fid
                })
            
            if twitter_handle:
                data["linked_accounts"].append({
                    "type": "twitter",
                    "username": twitter_handle
                })
        
        if custom_fields:
            data["custom_fields"] = custom_fields
        
        return await self._request(
            method="POST",
            path="/users",
            json_data=data
        )
    
    async def update_user(
        self, 
        user_id: str,
        email: Optional[str] = None,
        wallet_address: Optional[str] = None,
        farcaster_fid: Optional[str] = None,
        twitter_handle: Optional[str] = None,
        linked_accounts: Optional[List[Dict[str, Any]]] = None,
        custom_fields: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Update a user.
        
        Args:
            user_id: The user ID.
            email: The user's email address.
            wallet_address: The user's wallet address.
            farcaster_fid: The user's Farcaster FID.
            twitter_handle: The user's Twitter handle.
            linked_accounts: Additional linked accounts.
            custom_fields: Custom fields to include in the user data.
            
        Returns:
            The updated user data.
            
        Raises:
            Exception: If the user could not be updated.
        """
        # Build the request data
        data: Dict[str, Any] = {}
        
        if email:
            data["email"] = email
        
        if wallet_address:
            data["wallet"] = {"address": wallet_address}
        
        if farcaster_fid or twitter_handle or linked_accounts:
            data["linked_accounts"] = linked_accounts or []
            
            if farcaster_fid:
                data["linked_accounts"].append({
                    "type": "farcaster",
                    "fid": farcaster_fid
                })
            
            if twitter_handle:
                data["linked_accounts"].append({
                    "type": "twitter",
                    "username": twitter_handle
                })
        
        if custom_fields:
            data["custom_fields"] = custom_fields
        
        return await self._request(
            method="PATCH",
            path=f"/users/{user_id}",
            json_data=data
        )
    
    async def delete_user(self, user_id: str) -> Dict[str, Any]:
        """
        Delete a user.
        
        Args:
            user_id: The user ID.
            
        Returns:
            The response data.
            
        Raises:
            Exception: If the user could not be deleted.
        """
        return await self._request(
            method="DELETE",
            path=f"/users/{user_id}"
        )
    
    async def create_auth_token(
        self, 
        user_id: str, 
        expiration_seconds: int = 3600
    ) -> Dict[str, Any]:
        """
        Create an authentication token for a user.
        
        Args:
            user_id: The user ID.
            expiration_seconds: The token expiration time in seconds.
            
        Returns:
            The token data.
            
        Raises:
            Exception: If the token could not be created.
        """
        return await self._request(
            method="POST",
            path="/auth/token",
            json_data={
                "user_id": user_id,
                "expiration_seconds": expiration_seconds
            }
        )
    
    async def revoke_auth_token(self, token: str) -> Dict[str, Any]:
        """
        Revoke an authentication token.
        
        Args:
            token: The token to revoke.
            
        Returns:
            The response data.
            
        Raises:
            Exception: If the token could not be revoked.
        """
        return await self._request(
            method="POST",
            path="/auth/revoke",
            json_data={"token": token}
        )


async def get_privy_client(ctx: Optional[Context] = None, creator_id: Optional[str] = None) -> PrivyClient:
    """
    Get a Privy client from environment variables and secrets manager.
    
    Args:
        ctx: Optional MCP Context for logging.
        creator_id: The ID of the creator to get secrets for.
        
    Returns:
        A PrivyClient instance.
        
    Raises:
        ValueError: If the required environment variables are not set.
    """
    try:
        return await PrivyClient.from_env(creator_id)
    except ValueError as e:
        if ctx:
            ctx.error(str(e))
        raise
