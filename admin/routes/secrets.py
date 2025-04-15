#!/usr/bin/env python3
"""
API routes for managing secrets in the ESCAPE Creator Engine.
"""

import json
from typing import Dict, List, Optional, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from core.secrets import get_secret, set_secret, delete_secret, list_secrets
from admin.routes.auth import get_current_admin_user

# Create the router
router = APIRouter(
    prefix="/api/admin/secrets",
    tags=["admin", "secrets"],
    dependencies=[Depends(get_current_admin_user)]
)


class SecretCreate(BaseModel):
    """
    Model for creating a secret.
    """
    
    name: str
    value: str
    creator_id: Optional[str] = None
    description: Optional[str] = None


class SecretUpdate(BaseModel):
    """
    Model for updating a secret.
    """
    
    value: str
    description: Optional[str] = None


class SecretResponse(BaseModel):
    """
    Model for a secret response.
    """
    
    id: str
    name: str
    creator_id: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


@router.get("/", response_model=List[SecretResponse])
async def get_secrets(creator_id: Optional[str] = None):
    """
    Get all secrets.
    
    Args:
        creator_id: The ID of the creator to filter by.
        
    Returns:
        A list of secrets.
    """
    secrets = await list_secrets(creator_id)
    return secrets


@router.get("/{name}", response_model=SecretResponse)
async def get_secret_by_name(name: str, creator_id: Optional[str] = None):
    """
    Get a secret by name.
    
    Args:
        name: The name of the secret.
        creator_id: The ID of the creator the secret belongs to.
        
    Returns:
        The secret.
        
    Raises:
        HTTPException: If the secret doesn't exist.
    """
    secret_value = await get_secret(name, creator_id)
    
    if secret_value is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Secret {name} not found"
        )
    
    # Note: This is a simplified implementation. In a real implementation,
    # we would return the full secret object, not just the value.
    return {
        "id": "placeholder",
        "name": name,
        "creator_id": creator_id,
        "description": None,
        "created_at": None,
        "updated_at": None
    }


@router.post("/", response_model=SecretResponse, status_code=status.HTTP_201_CREATED)
async def create_secret(secret: SecretCreate):
    """
    Create a new secret.
    
    Args:
        secret: The secret to create.
        
    Returns:
        The created secret.
        
    Raises:
        HTTPException: If the secret couldn't be created.
    """
    success = await set_secret(
        name=secret.name,
        value=secret.value,
        creator_id=secret.creator_id,
        description=secret.description
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create secret {secret.name}"
        )
    
    # Note: This is a simplified implementation. In a real implementation,
    # we would return the full secret object, not just a placeholder.
    return {
        "id": "placeholder",
        "name": secret.name,
        "creator_id": secret.creator_id,
        "description": secret.description,
        "created_at": None,
        "updated_at": None
    }


@router.put("/{name}", response_model=SecretResponse)
async def update_secret(name: str, secret: SecretUpdate, creator_id: Optional[str] = None):
    """
    Update a secret.
    
    Args:
        name: The name of the secret to update.
        secret: The updated secret.
        creator_id: The ID of the creator the secret belongs to.
        
    Returns:
        The updated secret.
        
    Raises:
        HTTPException: If the secret doesn't exist or couldn't be updated.
    """
    # Check if the secret exists
    existing_secret = await get_secret(name, creator_id)
    
    if existing_secret is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Secret {name} not found"
        )
    
    # Update the secret
    success = await set_secret(
        name=name,
        value=secret.value,
        creator_id=creator_id,
        description=secret.description
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update secret {name}"
        )
    
    # Note: This is a simplified implementation. In a real implementation,
    # we would return the full secret object, not just a placeholder.
    return {
        "id": "placeholder",
        "name": name,
        "creator_id": creator_id,
        "description": secret.description,
        "created_at": None,
        "updated_at": None
    }


@router.delete("/{name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_secret_by_name(name: str, creator_id: Optional[str] = None):
    """
    Delete a secret.
    
    Args:
        name: The name of the secret to delete.
        creator_id: The ID of the creator the secret belongs to.
        
    Raises:
        HTTPException: If the secret doesn't exist or couldn't be deleted.
    """
    # Check if the secret exists
    existing_secret = await get_secret(name, creator_id)
    
    if existing_secret is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Secret {name} not found"
        )
    
    # Delete the secret
    success = await delete_secret(name, creator_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete secret {name}"
        )
