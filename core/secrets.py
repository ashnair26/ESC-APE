#!/usr/bin/env python3
"""
Secrets management utilities for the ESCAPE Creator Engine.

This module provides utilities for securely storing and retrieving API tokens
and other sensitive information using Supabase Vault.
"""

import os
import json
import logging
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass

import httpx
from core.utils import get_env_var

# Configure logging
logger = logging.getLogger(__name__)


@dataclass
class Secret:
    """
    Represents a secret stored in the secrets manager.
    """
    
    id: str
    name: str
    value: str
    creator_id: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class SecretsManager:
    """
    Manages secrets using Supabase Vault.
    """
    
    def __init__(self, supabase_url: str, supabase_key: str):
        """
        Initialize the SecretsManager.
        
        Args:
            supabase_url: The URL of the Supabase project.
            supabase_key: The service role key for the Supabase project.
        """
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
    
    @classmethod
    def from_env(cls) -> "SecretsManager":
        """
        Create a SecretsManager from environment variables.
        
        Returns:
            A SecretsManager instance.
            
        Raises:
            ValueError: If the required environment variables are not set.
        """
        supabase_url = get_env_var("SUPABASE_URL")
        supabase_key = get_env_var("SUPABASE_SERVICE_ROLE_KEY")
        
        return cls(supabase_url=supabase_url, supabase_key=supabase_key)
    
    async def _request(
        self, 
        method: str, 
        path: str, 
        json_data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a request to the Supabase API.
        
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
        url = f"{self.supabase_url}{path}"
        
        # Set up headers
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
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
                error_msg = f"Supabase API error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                raise Exception(error_msg)
                
            return response.json()
    
    async def get_secret(self, name: str, creator_id: Optional[str] = None) -> Optional[Secret]:
        """
        Get a secret by name.
        
        Args:
            name: The name of the secret.
            creator_id: The ID of the creator the secret belongs to.
            
        Returns:
            The secret, or None if it doesn't exist.
        """
        # Build the query
        query_params = {
            "name": f"eq.{name}"
        }
        
        if creator_id:
            query_params["creator_id"] = f"eq.{creator_id}"
        
        try:
            # Make the request
            response = await self._request(
                method="GET",
                path="/rest/v1/secrets",
                params=query_params
            )
            
            # Return the first result, or None if there are no results
            if response and len(response) > 0:
                secret_data = response[0]
                return Secret(
                    id=secret_data["id"],
                    name=secret_data["name"],
                    value=secret_data["value"],
                    creator_id=secret_data.get("creator_id"),
                    description=secret_data.get("description"),
                    created_at=secret_data.get("created_at"),
                    updated_at=secret_data.get("updated_at")
                )
            
            return None
        except Exception as e:
            logger.error(f"Error getting secret {name}: {str(e)}")
            return None
    
    async def set_secret(
        self, 
        name: str, 
        value: str, 
        creator_id: Optional[str] = None,
        description: Optional[str] = None
    ) -> Optional[Secret]:
        """
        Set a secret.
        
        Args:
            name: The name of the secret.
            value: The value of the secret.
            creator_id: The ID of the creator the secret belongs to.
            description: A description of the secret.
            
        Returns:
            The created or updated secret, or None if the operation failed.
        """
        try:
            # Check if the secret already exists
            existing_secret = await self.get_secret(name, creator_id)
            
            if existing_secret:
                # Update the existing secret
                response = await self._request(
                    method="PATCH",
                    path=f"/rest/v1/secrets?id=eq.{existing_secret.id}",
                    json_data={
                        "value": value,
                        "description": description,
                        "updated_at": "now()"
                    }
                )
                
                if response and len(response) > 0:
                    secret_data = response[0]
                    return Secret(
                        id=secret_data["id"],
                        name=secret_data["name"],
                        value=secret_data["value"],
                        creator_id=secret_data.get("creator_id"),
                        description=secret_data.get("description"),
                        created_at=secret_data.get("created_at"),
                        updated_at=secret_data.get("updated_at")
                    )
            else:
                # Create a new secret
                response = await self._request(
                    method="POST",
                    path="/rest/v1/secrets",
                    json_data={
                        "name": name,
                        "value": value,
                        "creator_id": creator_id,
                        "description": description
                    }
                )
                
                if response and len(response) > 0:
                    secret_data = response[0]
                    return Secret(
                        id=secret_data["id"],
                        name=secret_data["name"],
                        value=secret_data["value"],
                        creator_id=secret_data.get("creator_id"),
                        description=secret_data.get("description"),
                        created_at=secret_data.get("created_at"),
                        updated_at=secret_data.get("updated_at")
                    )
            
            return None
        except Exception as e:
            logger.error(f"Error setting secret {name}: {str(e)}")
            return None
    
    async def delete_secret(self, name: str, creator_id: Optional[str] = None) -> bool:
        """
        Delete a secret.
        
        Args:
            name: The name of the secret.
            creator_id: The ID of the creator the secret belongs to.
            
        Returns:
            True if the secret was deleted, False otherwise.
        """
        try:
            # Build the query
            query_params = {
                "name": f"eq.{name}"
            }
            
            if creator_id:
                query_params["creator_id"] = f"eq.{creator_id}"
            
            # Make the request
            await self._request(
                method="DELETE",
                path="/rest/v1/secrets",
                params=query_params
            )
            
            return True
        except Exception as e:
            logger.error(f"Error deleting secret {name}: {str(e)}")
            return False
    
    async def list_secrets(self, creator_id: Optional[str] = None) -> List[Secret]:
        """
        List all secrets.
        
        Args:
            creator_id: The ID of the creator to filter by.
            
        Returns:
            A list of secrets.
        """
        try:
            # Build the query
            query_params = {}
            
            if creator_id:
                query_params["creator_id"] = f"eq.{creator_id}"
            
            # Make the request
            response = await self._request(
                method="GET",
                path="/rest/v1/secrets",
                params=query_params
            )
            
            # Convert the response to Secret objects
            secrets = []
            for secret_data in response:
                secrets.append(Secret(
                    id=secret_data["id"],
                    name=secret_data["name"],
                    value=secret_data["value"],
                    creator_id=secret_data.get("creator_id"),
                    description=secret_data.get("description"),
                    created_at=secret_data.get("created_at"),
                    updated_at=secret_data.get("updated_at")
                ))
            
            return secrets
        except Exception as e:
            logger.error(f"Error listing secrets: {str(e)}")
            return []


# Global instance of the SecretsManager
_secrets_manager: Optional[SecretsManager] = None


def get_secrets_manager() -> SecretsManager:
    """
    Get the global SecretsManager instance.
    
    Returns:
        The SecretsManager instance.
        
    Raises:
        ValueError: If the required environment variables are not set.
    """
    global _secrets_manager
    
    if _secrets_manager is None:
        _secrets_manager = SecretsManager.from_env()
    
    return _secrets_manager


async def get_secret(name: str, creator_id: Optional[str] = None) -> Optional[str]:
    """
    Get a secret value by name.
    
    Args:
        name: The name of the secret.
        creator_id: The ID of the creator the secret belongs to.
        
    Returns:
        The secret value, or None if it doesn't exist.
    """
    secrets_manager = get_secrets_manager()
    secret = await secrets_manager.get_secret(name, creator_id)
    
    if secret:
        return secret.value
    
    return None


async def set_secret(
    name: str, 
    value: str, 
    creator_id: Optional[str] = None,
    description: Optional[str] = None
) -> bool:
    """
    Set a secret.
    
    Args:
        name: The name of the secret.
        value: The value of the secret.
        creator_id: The ID of the creator the secret belongs to.
        description: A description of the secret.
        
    Returns:
        True if the secret was set, False otherwise.
    """
    secrets_manager = get_secrets_manager()
    secret = await secrets_manager.set_secret(name, value, creator_id, description)
    
    return secret is not None


async def delete_secret(name: str, creator_id: Optional[str] = None) -> bool:
    """
    Delete a secret.
    
    Args:
        name: The name of the secret.
        creator_id: The ID of the creator the secret belongs to.
        
    Returns:
        True if the secret was deleted, False otherwise.
    """
    secrets_manager = get_secrets_manager()
    return await secrets_manager.delete_secret(name, creator_id)


async def list_secrets(creator_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    List all secrets.
    
    Args:
        creator_id: The ID of the creator to filter by.
        
    Returns:
        A list of secrets.
    """
    secrets_manager = get_secrets_manager()
    secrets = await secrets_manager.list_secrets(creator_id)
    
    return [
        {
            "id": secret.id,
            "name": secret.name,
            "creator_id": secret.creator_id,
            "description": secret.description,
            "created_at": secret.created_at,
            "updated_at": secret.updated_at
        }
        for secret in secrets
    ]
