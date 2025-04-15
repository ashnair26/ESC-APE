#!/usr/bin/env python3
"""
Authentication utilities for the ESCAPE Creator Engine.

This module provides utilities for authenticating requests to the MCP servers.
It includes middleware for validating API tokens and JWT tokens.
"""

import os
import json
import time
import logging
import asyncio
from typing import Any, Dict, List, Optional, Union, Callable, Awaitable
from dataclasses import dataclass
from functools import wraps

import jwt
from jwt.exceptions import PyJWTError

from mcp.server.fastmcp import Context, FastMCP
from core.secrets import get_secret

# Configure logging
logger = logging.getLogger(__name__)


@dataclass
class AuthUser:
    """
    Represents an authenticated user.
    """
    
    id: str
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    scopes: List[str] = None
    
    def __post_init__(self):
        if self.scopes is None:
            self.scopes = []


@dataclass
class AuthResult:
    """
    Represents the result of an authentication attempt.
    """
    
    success: bool
    user: Optional[AuthUser] = None
    error: Optional[str] = None


class AuthMiddleware:
    """
    Middleware for authenticating requests to the MCP servers.
    """
    
    def __init__(
        self,
        jwt_secret: Optional[str] = None,
        jwt_algorithm: str = "HS256",
        api_token_header: str = "X-API-Token",
        jwt_token_header: str = "Authorization",
        required_scopes: Optional[List[str]] = None,
        skip_auth: bool = False
    ):
        """
        Initialize the AuthMiddleware.
        
        Args:
            jwt_secret: The secret key for JWT token validation.
            jwt_algorithm: The algorithm to use for JWT token validation.
            api_token_header: The header name for API token authentication.
            jwt_token_header: The header name for JWT token authentication.
            required_scopes: The scopes required to access the server.
            skip_auth: Whether to skip authentication (for development).
        """
        self.jwt_secret = jwt_secret or os.environ.get("JWT_SECRET")
        self.jwt_algorithm = jwt_algorithm
        self.api_token_header = api_token_header
        self.jwt_token_header = jwt_token_header
        self.required_scopes = required_scopes or []
        self.skip_auth = skip_auth
        
        # Cache for API tokens to avoid frequent database lookups
        self.api_token_cache: Dict[str, AuthUser] = {}
        self.api_token_cache_ttl = 300  # 5 minutes
        self.api_token_cache_timestamps: Dict[str, float] = {}
    
    async def authenticate(self, ctx: Context) -> AuthResult:
        """
        Authenticate a request.
        
        Args:
            ctx: The MCP context.
            
        Returns:
            An AuthResult object.
        """
        # Skip authentication if configured to do so
        if self.skip_auth:
            return AuthResult(
                success=True,
                user=AuthUser(
                    id="dev",
                    username="developer",
                    role="admin",
                    scopes=["*"]
                )
            )
        
        # Get the request headers
        headers = ctx.request_meta.get("headers", {})
        
        # Try API token authentication
        api_token = headers.get(self.api_token_header)
        if api_token:
            auth_result = await self._authenticate_api_token(api_token)
            if auth_result.success:
                return auth_result
        
        # Try JWT token authentication
        jwt_token = headers.get(self.jwt_token_header)
        if jwt_token:
            # Remove "Bearer " prefix if present
            if jwt_token.startswith("Bearer "):
                jwt_token = jwt_token[7:]
            
            auth_result = await self._authenticate_jwt_token(jwt_token)
            if auth_result.success:
                return auth_result
        
        # If we get here, authentication failed
        return AuthResult(
            success=False,
            error="Authentication failed. No valid API token or JWT token provided."
        )
    
    async def _authenticate_api_token(self, token: str) -> AuthResult:
        """
        Authenticate a request using an API token.
        
        Args:
            token: The API token.
            
        Returns:
            An AuthResult object.
        """
        # Check the cache first
        if token in self.api_token_cache:
            # Check if the cache entry is still valid
            timestamp = self.api_token_cache_timestamps.get(token, 0)
            if time.time() - timestamp < self.api_token_cache_ttl:
                return AuthResult(
                    success=True,
                    user=self.api_token_cache[token]
                )
        
        try:
            # Look up the token in the database
            token_data = await get_secret(f"api_token:{token}")
            
            if not token_data:
                return AuthResult(
                    success=False,
                    error=f"Invalid API token."
                )
            
            # Parse the token data
            try:
                user_data = json.loads(token_data)
            except json.JSONDecodeError:
                return AuthResult(
                    success=False,
                    error=f"Invalid API token data format."
                )
            
            # Create the user
            user = AuthUser(
                id=user_data.get("id", "unknown"),
                username=user_data.get("username"),
                email=user_data.get("email"),
                role=user_data.get("role"),
                scopes=user_data.get("scopes", [])
            )
            
            # Check if the user has the required scopes
            if not self._has_required_scopes(user):
                return AuthResult(
                    success=False,
                    error=f"Insufficient permissions. Required scopes: {', '.join(self.required_scopes)}"
                )
            
            # Cache the result
            self.api_token_cache[token] = user
            self.api_token_cache_timestamps[token] = time.time()
            
            return AuthResult(
                success=True,
                user=user
            )
        except Exception as e:
            logger.error(f"Error authenticating API token: {str(e)}")
            return AuthResult(
                success=False,
                error=f"Error authenticating API token: {str(e)}"
            )
    
    async def _authenticate_jwt_token(self, token: str) -> AuthResult:
        """
        Authenticate a request using a JWT token.
        
        Args:
            token: The JWT token.
            
        Returns:
            An AuthResult object.
        """
        if not self.jwt_secret:
            return AuthResult(
                success=False,
                error="JWT authentication is not configured."
            )
        
        try:
            # Decode and validate the JWT token
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=[self.jwt_algorithm]
            )
            
            # Check if the token is expired
            if "exp" in payload and payload["exp"] < time.time():
                return AuthResult(
                    success=False,
                    error="JWT token has expired."
                )
            
            # Create the user
            user = AuthUser(
                id=payload.get("sub", "unknown"),
                username=payload.get("username"),
                email=payload.get("email"),
                role=payload.get("role"),
                scopes=payload.get("scopes", [])
            )
            
            # Check if the user has the required scopes
            if not self._has_required_scopes(user):
                return AuthResult(
                    success=False,
                    error=f"Insufficient permissions. Required scopes: {', '.join(self.required_scopes)}"
                )
            
            return AuthResult(
                success=True,
                user=user
            )
        except PyJWTError as e:
            return AuthResult(
                success=False,
                error=f"Invalid JWT token: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error authenticating JWT token: {str(e)}")
            return AuthResult(
                success=False,
                error=f"Error authenticating JWT token: {str(e)}"
            )
    
    def _has_required_scopes(self, user: AuthUser) -> bool:
        """
        Check if a user has the required scopes.
        
        Args:
            user: The user to check.
            
        Returns:
            True if the user has the required scopes, False otherwise.
        """
        # If no scopes are required, allow access
        if not self.required_scopes:
            return True
        
        # If the user has the wildcard scope, allow access
        if "*" in user.scopes:
            return True
        
        # Check if the user has all the required scopes
        for scope in self.required_scopes:
            if scope not in user.scopes:
                return False
        
        return True


def require_auth(
    scopes: Optional[List[str]] = None,
    skip_auth: bool = False
) -> Callable:
    """
    Decorator for requiring authentication on MCP tool functions.
    
    Args:
        scopes: The scopes required to access the tool.
        skip_auth: Whether to skip authentication (for development).
        
    Returns:
        A decorator function.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(ctx: Context, *args, **kwargs) -> Any:
            # Skip authentication if configured to do so
            if skip_auth:
                return await func(ctx, *args, **kwargs)
            
            # Get the auth middleware from the context
            auth_middleware = getattr(ctx.fastmcp, "_auth_middleware", None)
            
            # If no auth middleware is configured, allow access
            if not auth_middleware:
                return await func(ctx, *args, **kwargs)
            
            # Authenticate the request
            auth_result = await auth_middleware.authenticate(ctx)
            
            # If authentication failed, return an error
            if not auth_result.success:
                ctx.error(auth_result.error)
                return json.dumps({"error": auth_result.error})
            
            # If scopes are required, check if the user has them
            if scopes:
                user = auth_result.user
                for scope in scopes:
                    if scope not in user.scopes and "*" not in user.scopes:
                        error = f"Insufficient permissions. Required scope: {scope}"
                        ctx.error(error)
                        return json.dumps({"error": error})
            
            # If we get here, authentication succeeded
            # Add the user to the context
            ctx.user = auth_result.user
            
            # Call the original function
            return await func(ctx, *args, **kwargs)
        
        return wrapper
    
    return decorator


def setup_auth_middleware(
    mcp_server: FastMCP,
    jwt_secret: Optional[str] = None,
    jwt_algorithm: str = "HS256",
    api_token_header: str = "X-API-Token",
    jwt_token_header: str = "Authorization",
    required_scopes: Optional[List[str]] = None,
    skip_auth: bool = False
) -> None:
    """
    Set up authentication middleware for an MCP server.
    
    Args:
        mcp_server: The MCP server to set up authentication for.
        jwt_secret: The secret key for JWT token validation.
        jwt_algorithm: The algorithm to use for JWT token validation.
        api_token_header: The header name for API token authentication.
        jwt_token_header: The header name for JWT token authentication.
        required_scopes: The scopes required to access the server.
        skip_auth: Whether to skip authentication (for development).
    """
    # Create the auth middleware
    auth_middleware = AuthMiddleware(
        jwt_secret=jwt_secret,
        jwt_algorithm=jwt_algorithm,
        api_token_header=api_token_header,
        jwt_token_header=jwt_token_header,
        required_scopes=required_scopes,
        skip_auth=skip_auth
    )
    
    # Attach the auth middleware to the MCP server
    mcp_server._auth_middleware = auth_middleware


async def create_api_token(
    user_id: str,
    username: Optional[str] = None,
    email: Optional[str] = None,
    role: Optional[str] = None,
    scopes: Optional[List[str]] = None,
    expires_in: Optional[int] = None
) -> str:
    """
    Create a new API token.
    
    Args:
        user_id: The ID of the user.
        username: The username of the user.
        email: The email of the user.
        role: The role of the user.
        scopes: The scopes to grant to the token.
        expires_in: The number of seconds until the token expires.
        
    Returns:
        The API token.
    """
    from core.secrets import set_secret
    
    # Generate a random token
    import secrets as pysecrets
    token = pysecrets.token_urlsafe(32)
    
    # Create the token data
    token_data = {
        "id": user_id,
        "username": username,
        "email": email,
        "role": role,
        "scopes": scopes or [],
        "created_at": time.time()
    }
    
    # Add expiration if provided
    if expires_in:
        token_data["expires_at"] = time.time() + expires_in
    
    # Store the token in the database
    await set_secret(
        f"api_token:{token}",
        json.dumps(token_data),
        description=f"API token for {username or user_id}"
    )
    
    return token


async def revoke_api_token(token: str) -> bool:
    """
    Revoke an API token.
    
    Args:
        token: The API token to revoke.
        
    Returns:
        True if the token was revoked, False otherwise.
    """
    from core.secrets import delete_secret
    
    # Delete the token from the database
    return await delete_secret(f"api_token:{token}")


async def create_jwt_token(
    user_id: str,
    username: Optional[str] = None,
    email: Optional[str] = None,
    role: Optional[str] = None,
    scopes: Optional[List[str]] = None,
    expires_in: Optional[int] = None,
    jwt_secret: Optional[str] = None,
    jwt_algorithm: str = "HS256"
) -> str:
    """
    Create a new JWT token.
    
    Args:
        user_id: The ID of the user.
        username: The username of the user.
        email: The email of the user.
        role: The role of the user.
        scopes: The scopes to grant to the token.
        expires_in: The number of seconds until the token expires.
        jwt_secret: The secret key for JWT token validation.
        jwt_algorithm: The algorithm to use for JWT token validation.
        
    Returns:
        The JWT token.
    """
    # Get the JWT secret
    secret = jwt_secret or os.environ.get("JWT_SECRET")
    
    if not secret:
        raise ValueError("JWT secret is not configured.")
    
    # Create the token payload
    payload = {
        "sub": user_id,
        "iat": int(time.time())
    }
    
    # Add optional fields
    if username:
        payload["username"] = username
    
    if email:
        payload["email"] = email
    
    if role:
        payload["role"] = role
    
    if scopes:
        payload["scopes"] = scopes
    
    # Add expiration if provided
    if expires_in:
        payload["exp"] = int(time.time()) + expires_in
    
    # Create the JWT token
    token = jwt.encode(
        payload,
        secret,
        algorithm=jwt_algorithm
    )
    
    return token
