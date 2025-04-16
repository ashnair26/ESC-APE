#!/usr/bin/env python3
"""
Authentication flow utilities for the ESCAPE Creator Engine.

This module provides utilities for implementing authentication flows
using various authentication providers, such as Privy.
"""

import os
import json
import time
import logging
import asyncio
from typing import Any, Dict, List, Optional, Union, Callable, Awaitable
from dataclasses import dataclass

from core.auth import AuthUser, create_jwt_token, create_api_token
from servers.privy.client import get_privy_client

# Configure logging
logger = logging.getLogger(__name__)


@dataclass
class AuthFlowResult:
    """
    Represents the result of an authentication flow.
    """
    
    success: bool
    user: Optional[AuthUser] = None
    token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None
    error: Optional[str] = None
    redirect_url: Optional[str] = None


class PrivyAuthFlow:
    """
    Authentication flow implementation using Privy.
    """
    
    def __init__(
        self,
        app_id: Optional[str] = None,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        jwt_secret: Optional[str] = None,
        jwt_algorithm: str = "HS256",
        token_expiration: int = 3600,  # 1 hour
        refresh_token_expiration: int = 2592000,  # 30 days
        creator_id: Optional[str] = None
    ):
        """
        Initialize the PrivyAuthFlow.
        
        Args:
            app_id: The Privy app ID.
            api_key: The Privy API key.
            base_url: The Privy API base URL.
            jwt_secret: The secret key for JWT token generation.
            jwt_algorithm: The algorithm to use for JWT token generation.
            token_expiration: The expiration time for JWT tokens in seconds.
            refresh_token_expiration: The expiration time for refresh tokens in seconds.
            creator_id: The ID of the creator to get secrets for.
        """
        self.app_id = app_id or os.environ.get("PRIVY_APP_ID")
        self.api_key = api_key or os.environ.get("PRIVY_API_KEY")
        self.base_url = base_url or os.environ.get("PRIVY_BASE_URL", "https://auth.privy.io/api/v1")
        self.jwt_secret = jwt_secret or os.environ.get("JWT_SECRET")
        self.jwt_algorithm = jwt_algorithm
        self.token_expiration = token_expiration
        self.refresh_token_expiration = refresh_token_expiration
        self.creator_id = creator_id
    
    async def verify_token(self, token: str) -> AuthFlowResult:
        """
        Verify a Privy authentication token and create a JWT token.
        
        Args:
            token: The Privy authentication token to verify.
            
        Returns:
            An AuthFlowResult object.
        """
        try:
            # Get the Privy client
            client = await get_privy_client(creator_id=self.creator_id)
            
            # Verify the token with Privy
            result = await client.verify_token(token)
            
            # Extract the user data
            user_id = result.get("user", {}).get("id")
            if not user_id:
                return AuthFlowResult(
                    success=False,
                    error="Invalid token: User ID not found in response"
                )
            
            # Get the user details
            user_data = await client.get_user(user_id)
            
            # Create an AuthUser object
            user = self._create_auth_user_from_privy(user_data)
            
            # Create a JWT token
            jwt_token = await create_jwt_token(
                user_id=user.id,
                username=user.username,
                email=user.email,
                role=user.role,
                scopes=user.scopes,
                expires_in=self.token_expiration,
                jwt_secret=self.jwt_secret,
                jwt_algorithm=self.jwt_algorithm
            )
            
            # Create a refresh token
            refresh_token = await create_api_token(
                user_id=user.id,
                username=user.username,
                email=user.email,
                role=user.role,
                scopes=["auth:refresh"],
                expires_in=self.refresh_token_expiration
            )
            
            return AuthFlowResult(
                success=True,
                user=user,
                token=jwt_token,
                refresh_token=refresh_token,
                expires_in=self.token_expiration
            )
        except Exception as e:
            logger.error(f"Error verifying Privy token: {str(e)}")
            return AuthFlowResult(
                success=False,
                error=f"Error verifying token: {str(e)}"
            )
    
    async def refresh_token(self, refresh_token: str) -> AuthFlowResult:
        """
        Refresh a JWT token using a refresh token.
        
        Args:
            refresh_token: The refresh token.
            
        Returns:
            An AuthFlowResult object.
        """
        try:
            # Get the refresh token data from the secrets manager
            from core.secrets import get_secret
            token_data_str = await get_secret(f"api_token:{refresh_token}")
            
            if not token_data_str:
                return AuthFlowResult(
                    success=False,
                    error="Invalid refresh token"
                )
            
            # Parse the token data
            try:
                token_data = json.loads(token_data_str)
            except json.JSONDecodeError:
                return AuthFlowResult(
                    success=False,
                    error="Invalid refresh token data format"
                )
            
            # Check if the token has expired
            if "expires_at" in token_data and token_data["expires_at"] < time.time():
                return AuthFlowResult(
                    success=False,
                    error="Refresh token has expired"
                )
            
            # Check if the token has the required scope
            if "auth:refresh" not in token_data.get("scopes", []):
                return AuthFlowResult(
                    success=False,
                    error="Invalid refresh token: Missing required scope"
                )
            
            # Create an AuthUser object
            user = AuthUser(
                id=token_data.get("id", "unknown"),
                username=token_data.get("username"),
                email=token_data.get("email"),
                role=token_data.get("role"),
                scopes=token_data.get("scopes", [])
            )
            
            # Remove the refresh scope from the user's scopes for the JWT token
            jwt_scopes = [scope for scope in user.scopes if scope != "auth:refresh"]
            
            # Create a new JWT token
            jwt_token = await create_jwt_token(
                user_id=user.id,
                username=user.username,
                email=user.email,
                role=user.role,
                scopes=jwt_scopes,
                expires_in=self.token_expiration,
                jwt_secret=self.jwt_secret,
                jwt_algorithm=self.jwt_algorithm
            )
            
            return AuthFlowResult(
                success=True,
                user=user,
                token=jwt_token,
                refresh_token=refresh_token,
                expires_in=self.token_expiration
            )
        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            return AuthFlowResult(
                success=False,
                error=f"Error refreshing token: {str(e)}"
            )
    
    async def logout(self, refresh_token: str) -> AuthFlowResult:
        """
        Log out a user by revoking their refresh token.
        
        Args:
            refresh_token: The refresh token to revoke.
            
        Returns:
            An AuthFlowResult object.
        """
        try:
            # Revoke the refresh token
            from core.auth import revoke_api_token
            result = await revoke_api_token(refresh_token)
            
            if not result:
                return AuthFlowResult(
                    success=False,
                    error="Failed to revoke refresh token"
                )
            
            return AuthFlowResult(
                success=True
            )
        except Exception as e:
            logger.error(f"Error logging out: {str(e)}")
            return AuthFlowResult(
                success=False,
                error=f"Error logging out: {str(e)}"
            )
    
    def _create_auth_user_from_privy(self, user_data: Dict[str, Any]) -> AuthUser:
        """
        Create an AuthUser object from Privy user data.
        
        Args:
            user_data: The Privy user data.
            
        Returns:
            An AuthUser object.
        """
        # Extract the user ID
        user_id = user_data.get("id")
        
        # Extract the email
        email = user_data.get("email", {}).get("address")
        
        # Extract the username (use email or wallet address if available)
        username = email
        if not username:
            wallet = user_data.get("wallet", {}).get("address")
            if wallet:
                username = f"{wallet[:6]}...{wallet[-4:]}"
        
        # Determine the role based on the user's data
        # This is just an example, you should implement your own role determination logic
        role = "user"
        
        # Determine the scopes based on the user's role
        # This is just an example, you should implement your own scope determination logic
        scopes = ["mcp:access"]
        if role == "admin":
            scopes.append("mcp:admin")
        
        # Create the AuthUser object
        return AuthUser(
            id=user_id,
            username=username,
            email=email,
            role=role,
            scopes=scopes
        )


# Global instance of the PrivyAuthFlow
_privy_auth_flow: Optional[PrivyAuthFlow] = None


def get_privy_auth_flow(
    app_id: Optional[str] = None,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    jwt_secret: Optional[str] = None,
    jwt_algorithm: str = "HS256",
    token_expiration: int = 3600,
    refresh_token_expiration: int = 2592000,
    creator_id: Optional[str] = None
) -> PrivyAuthFlow:
    """
    Get the global PrivyAuthFlow instance.
    
    Args:
        app_id: The Privy app ID.
        api_key: The Privy API key.
        base_url: The Privy API base URL.
        jwt_secret: The secret key for JWT token generation.
        jwt_algorithm: The algorithm to use for JWT token generation.
        token_expiration: The expiration time for JWT tokens in seconds.
        refresh_token_expiration: The expiration time for refresh tokens in seconds.
        creator_id: The ID of the creator to get secrets for.
        
    Returns:
        The PrivyAuthFlow instance.
    """
    global _privy_auth_flow
    
    if _privy_auth_flow is None:
        _privy_auth_flow = PrivyAuthFlow(
            app_id=app_id,
            api_key=api_key,
            base_url=base_url,
            jwt_secret=jwt_secret,
            jwt_algorithm=jwt_algorithm,
            token_expiration=token_expiration,
            refresh_token_expiration=refresh_token_expiration,
            creator_id=creator_id
        )
    
    return _privy_auth_flow


async def verify_privy_token(token: str) -> AuthFlowResult:
    """
    Verify a Privy authentication token and create a JWT token.
    
    Args:
        token: The Privy authentication token to verify.
        
    Returns:
        An AuthFlowResult object.
    """
    auth_flow = get_privy_auth_flow()
    return await auth_flow.verify_token(token)


async def refresh_token(refresh_token: str) -> AuthFlowResult:
    """
    Refresh a JWT token using a refresh token.
    
    Args:
        refresh_token: The refresh token.
        
    Returns:
        An AuthFlowResult object.
    """
    auth_flow = get_privy_auth_flow()
    return await auth_flow.refresh_token(refresh_token)


async def logout(refresh_token: str) -> AuthFlowResult:
    """
    Log out a user by revoking their refresh token.
    
    Args:
        refresh_token: The refresh token to revoke.
        
    Returns:
        An AuthFlowResult object.
    """
    auth_flow = get_privy_auth_flow()
    return await auth_flow.logout(refresh_token)
