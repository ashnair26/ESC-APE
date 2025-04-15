#!/usr/bin/env python3
"""
Authentication routes for the ESCAPE Creator Engine admin dashboard.
"""

import os
import time
from typing import Dict, List, Optional, Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import jwt

# Create the router
router = APIRouter(
    prefix="/api/admin/auth",
    tags=["admin", "auth"]
)

# OAuth2 password bearer for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/auth/token")


class User(BaseModel):
    """
    Model for a user.
    """
    
    id: str
    email: str
    name: str
    role: str


class Token(BaseModel):
    """
    Model for an authentication token.
    """
    
    access_token: str
    token_type: str


# Mock admin users for demonstration purposes
# In a real implementation, these would be stored in the database
ADMIN_USERS = {
    "admin@example.com": {
        "id": "admin-1",
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "admin",
        "password": "admin123"  # In a real implementation, this would be hashed
    }
}


def get_current_admin_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Get the current admin user from the authentication token.
    
    Args:
        token: The authentication token.
        
    Returns:
        The current admin user.
        
    Raises:
        HTTPException: If the token is invalid or the user is not an admin.
    """
    try:
        # Decode the JWT token
        payload = jwt.decode(
            token,
            os.environ.get("JWT_SECRET_KEY", "secret"),
            algorithms=["HS256"]
        )
        
        # Get the user ID from the token
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Find the user by ID
        user = None
        for u in ADMIN_USERS.values():
            if u["id"] == user_id:
                user = u
                break
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Check if the user is an admin
        if user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access admin resources",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return User(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"]
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )


@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login and get an authentication token.
    
    Args:
        form_data: The login form data.
        
    Returns:
        An authentication token.
        
    Raises:
        HTTPException: If the login credentials are invalid.
    """
    # Check if the user exists
    user = ADMIN_USERS.get(form_data.username)
    
    if user is None or user["password"] != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Create a JWT token
    token_data = {
        "sub": user["id"],
        "exp": int(time.time()) + 3600,  # Token expires in 1 hour
        "role": user["role"]
    }
    
    token = jwt.encode(
        token_data,
        os.environ.get("JWT_SECRET_KEY", "secret"),
        algorithm="HS256"
    )
    
    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=User)
async def get_current_user(current_user: User = Depends(get_current_admin_user)):
    """
    Get the current user.
    
    Args:
        current_user: The current user.
        
    Returns:
        The current user.
    """
    return current_user
