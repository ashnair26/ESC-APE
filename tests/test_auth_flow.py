#!/usr/bin/env python3
"""
Tests for the authentication flow.
"""

import os
import json
import time
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

from core.auth import AuthUser
from core.auth_flow import (
    AuthFlowResult,
    PrivyAuthFlow,
    get_privy_auth_flow,
    verify_privy_token,
    refresh_token,
    logout
)


class TestAuthFlowResult:
    """Tests for the AuthFlowResult class."""
    
    def test_auth_flow_result_success(self):
        """Test creating a successful AuthFlowResult."""
        user = AuthUser(id="test-user")
        result = AuthFlowResult(
            success=True,
            user=user,
            token="test-token",
            refresh_token="test-refresh-token",
            expires_in=3600
        )
        
        assert result.success is True
        assert result.user is user
        assert result.token == "test-token"
        assert result.refresh_token == "test-refresh-token"
        assert result.expires_in == 3600
        assert result.error is None
        assert result.redirect_url is None
    
    def test_auth_flow_result_failure(self):
        """Test creating a failed AuthFlowResult."""
        result = AuthFlowResult(
            success=False,
            error="Authentication failed"
        )
        
        assert result.success is False
        assert result.user is None
        assert result.token is None
        assert result.refresh_token is None
        assert result.expires_in is None
        assert result.error == "Authentication failed"
        assert result.redirect_url is None


class TestPrivyAuthFlow:
    """Tests for the PrivyAuthFlow class."""
    
    def test_init(self):
        """Test initializing a PrivyAuthFlow."""
        auth_flow = PrivyAuthFlow(
            app_id="test-app-id",
            api_key="test-api-key",
            base_url="https://example.com",
            jwt_secret="test-jwt-secret",
            jwt_algorithm="HS256",
            token_expiration=3600,
            refresh_token_expiration=2592000,
            creator_id="test-creator-id"
        )
        
        assert auth_flow.app_id == "test-app-id"
        assert auth_flow.api_key == "test-api-key"
        assert auth_flow.base_url == "https://example.com"
        assert auth_flow.jwt_secret == "test-jwt-secret"
        assert auth_flow.jwt_algorithm == "HS256"
        assert auth_flow.token_expiration == 3600
        assert auth_flow.refresh_token_expiration == 2592000
        assert auth_flow.creator_id == "test-creator-id"
    
    def test_init_defaults(self):
        """Test initializing a PrivyAuthFlow with default values."""
        # Mock environment variables
        with patch.dict(os.environ, {
            "PRIVY_APP_ID": "env-app-id",
            "PRIVY_API_KEY": "env-api-key",
            "PRIVY_BASE_URL": "https://env-example.com",
            "JWT_SECRET": "env-jwt-secret"
        }):
            auth_flow = PrivyAuthFlow()
            
            assert auth_flow.app_id == "env-app-id"
            assert auth_flow.api_key == "env-api-key"
            assert auth_flow.base_url == "https://env-example.com"
            assert auth_flow.jwt_secret == "env-jwt-secret"
            assert auth_flow.jwt_algorithm == "HS256"
            assert auth_flow.token_expiration == 3600
            assert auth_flow.refresh_token_expiration == 2592000
            assert auth_flow.creator_id is None
    
    def test_create_auth_user_from_privy(self):
        """Test creating an AuthUser from Privy user data."""
        auth_flow = PrivyAuthFlow()
        
        # Test with email
        user_data = {
            "id": "test-user-id",
            "email": {
                "address": "test@example.com",
                "verified": True
            }
        }
        
        user = auth_flow._create_auth_user_from_privy(user_data)
        
        assert user.id == "test-user-id"
        assert user.username == "test@example.com"
        assert user.email == "test@example.com"
        assert user.role == "user"
        assert user.scopes == ["mcp:access"]
        
        # Test with wallet
        user_data = {
            "id": "test-user-id",
            "wallet": {
                "address": "0x1234567890abcdef1234567890abcdef12345678"
            }
        }
        
        user = auth_flow._create_auth_user_from_privy(user_data)
        
        assert user.id == "test-user-id"
        assert user.username == "0x1234...5678"
        assert user.email is None
        assert user.role == "user"
        assert user.scopes == ["mcp:access"]
    
    @pytest.mark.asyncio
    async def test_verify_token(self):
        """Test verifying a Privy token."""
        auth_flow = PrivyAuthFlow(
            jwt_secret="test-jwt-secret",
            jwt_algorithm="HS256"
        )
        
        # Mock the Privy client
        with patch("core.auth_flow.get_privy_client") as mock_get_client, \
             patch("core.auth_flow.create_jwt_token") as mock_create_jwt, \
             patch("core.auth_flow.create_api_token") as mock_create_api:
            # Set up the mock client
            mock_client = AsyncMock()
            mock_client.verify_token.return_value = {
                "user": {"id": "test-user-id"}
            }
            mock_client.get_user.return_value = {
                "id": "test-user-id",
                "email": {"address": "test@example.com"}
            }
            mock_get_client.return_value = mock_client
            
            # Set up the mock token creation
            mock_create_jwt.return_value = "test-jwt-token"
            mock_create_api.return_value = "test-refresh-token"
            
            # Call the method
            result = await auth_flow.verify_token("test-privy-token")
            
            # Check the result
            assert result.success is True
            assert result.user.id == "test-user-id"
            assert result.user.username == "test@example.com"
            assert result.user.email == "test@example.com"
            assert result.token == "test-jwt-token"
            assert result.refresh_token == "test-refresh-token"
            assert result.expires_in == 3600
            
            # Check that the client methods were called
            mock_get_client.assert_called_once_with(creator_id=None)
            mock_client.verify_token.assert_called_once_with("test-privy-token")
            mock_client.get_user.assert_called_once_with("test-user-id")
            
            # Check that the token creation methods were called
            mock_create_jwt.assert_called_once_with(
                user_id="test-user-id",
                username="test@example.com",
                email="test@example.com",
                role="user",
                scopes=["mcp:access"],
                expires_in=3600,
                jwt_secret="test-jwt-secret",
                jwt_algorithm="HS256"
            )
            mock_create_api.assert_called_once_with(
                user_id="test-user-id",
                username="test@example.com",
                email="test@example.com",
                role="user",
                scopes=["auth:refresh"],
                expires_in=2592000
            )
    
    @pytest.mark.asyncio
    async def test_verify_token_error(self):
        """Test handling errors when verifying a Privy token."""
        auth_flow = PrivyAuthFlow()
        
        # Mock the Privy client
        with patch("core.auth_flow.get_privy_client") as mock_get_client:
            # Set up the mock client to raise an exception
            mock_client = AsyncMock()
            mock_client.verify_token.side_effect = Exception("Test error")
            mock_get_client.return_value = mock_client
            
            # Call the method
            result = await auth_flow.verify_token("test-privy-token")
            
            # Check the result
            assert result.success is False
            assert result.error == "Error verifying token: Test error"
            
            # Check that the client methods were called
            mock_get_client.assert_called_once_with(creator_id=None)
            mock_client.verify_token.assert_called_once_with("test-privy-token")
    
    @pytest.mark.asyncio
    async def test_refresh_token(self):
        """Test refreshing a JWT token."""
        auth_flow = PrivyAuthFlow(
            jwt_secret="test-jwt-secret",
            jwt_algorithm="HS256"
        )
        
        # Mock the get_secret and create_jwt_token functions
        with patch("core.auth_flow.get_secret") as mock_get_secret, \
             patch("core.auth_flow.create_jwt_token") as mock_create_jwt:
            # Set up the mock get_secret
            token_data = {
                "id": "test-user-id",
                "username": "testuser",
                "email": "test@example.com",
                "role": "user",
                "scopes": ["mcp:access", "auth:refresh"],
                "created_at": time.time()
            }
            mock_get_secret.return_value = json.dumps(token_data)
            
            # Set up the mock create_jwt_token
            mock_create_jwt.return_value = "test-jwt-token"
            
            # Call the method
            result = await auth_flow.refresh_token("test-refresh-token")
            
            # Check the result
            assert result.success is True
            assert result.user.id == "test-user-id"
            assert result.user.username == "testuser"
            assert result.user.email == "test@example.com"
            assert result.user.role == "user"
            assert result.user.scopes == ["mcp:access", "auth:refresh"]
            assert result.token == "test-jwt-token"
            assert result.refresh_token == "test-refresh-token"
            assert result.expires_in == 3600
            
            # Check that the functions were called
            mock_get_secret.assert_called_once_with("api_token:test-refresh-token")
            mock_create_jwt.assert_called_once_with(
                user_id="test-user-id",
                username="testuser",
                email="test@example.com",
                role="user",
                scopes=["mcp:access"],
                expires_in=3600,
                jwt_secret="test-jwt-secret",
                jwt_algorithm="HS256"
            )
    
    @pytest.mark.asyncio
    async def test_refresh_token_expired(self):
        """Test refreshing an expired token."""
        auth_flow = PrivyAuthFlow()
        
        # Mock the get_secret function
        with patch("core.auth_flow.get_secret") as mock_get_secret:
            # Set up the mock get_secret with an expired token
            token_data = {
                "id": "test-user-id",
                "username": "testuser",
                "email": "test@example.com",
                "role": "user",
                "scopes": ["mcp:access", "auth:refresh"],
                "created_at": time.time(),
                "expires_at": time.time() - 3600  # Expired 1 hour ago
            }
            mock_get_secret.return_value = json.dumps(token_data)
            
            # Call the method
            result = await auth_flow.refresh_token("test-refresh-token")
            
            # Check the result
            assert result.success is False
            assert result.error == "Refresh token has expired"
            
            # Check that the functions were called
            mock_get_secret.assert_called_once_with("api_token:test-refresh-token")
    
    @pytest.mark.asyncio
    async def test_refresh_token_invalid_scope(self):
        """Test refreshing a token with invalid scope."""
        auth_flow = PrivyAuthFlow()
        
        # Mock the get_secret function
        with patch("core.auth_flow.get_secret") as mock_get_secret:
            # Set up the mock get_secret with a token missing the auth:refresh scope
            token_data = {
                "id": "test-user-id",
                "username": "testuser",
                "email": "test@example.com",
                "role": "user",
                "scopes": ["mcp:access"],  # Missing auth:refresh
                "created_at": time.time()
            }
            mock_get_secret.return_value = json.dumps(token_data)
            
            # Call the method
            result = await auth_flow.refresh_token("test-refresh-token")
            
            # Check the result
            assert result.success is False
            assert result.error == "Invalid refresh token: Missing required scope"
            
            # Check that the functions were called
            mock_get_secret.assert_called_once_with("api_token:test-refresh-token")
    
    @pytest.mark.asyncio
    async def test_logout(self):
        """Test logging out."""
        auth_flow = PrivyAuthFlow()
        
        # Mock the revoke_api_token function
        with patch("core.auth_flow.revoke_api_token") as mock_revoke:
            # Set up the mock revoke_api_token
            mock_revoke.return_value = True
            
            # Call the method
            result = await auth_flow.logout("test-refresh-token")
            
            # Check the result
            assert result.success is True
            
            # Check that the functions were called
            mock_revoke.assert_called_once_with("test-refresh-token")
    
    @pytest.mark.asyncio
    async def test_logout_error(self):
        """Test handling errors when logging out."""
        auth_flow = PrivyAuthFlow()
        
        # Mock the revoke_api_token function
        with patch("core.auth_flow.revoke_api_token") as mock_revoke:
            # Set up the mock revoke_api_token to return False
            mock_revoke.return_value = False
            
            # Call the method
            result = await auth_flow.logout("test-refresh-token")
            
            # Check the result
            assert result.success is False
            assert result.error == "Failed to revoke refresh token"
            
            # Check that the functions were called
            mock_revoke.assert_called_once_with("test-refresh-token")


def test_get_privy_auth_flow():
    """Test getting the global PrivyAuthFlow instance."""
    # Reset the global instance
    import core.auth_flow
    core.auth_flow._privy_auth_flow = None
    
    # Call the function
    auth_flow = get_privy_auth_flow(
        app_id="test-app-id",
        api_key="test-api-key",
        base_url="https://example.com",
        jwt_secret="test-jwt-secret",
        jwt_algorithm="HS256",
        token_expiration=3600,
        refresh_token_expiration=2592000,
        creator_id="test-creator-id"
    )
    
    # Check the result
    assert isinstance(auth_flow, PrivyAuthFlow)
    assert auth_flow.app_id == "test-app-id"
    assert auth_flow.api_key == "test-api-key"
    assert auth_flow.base_url == "https://example.com"
    assert auth_flow.jwt_secret == "test-jwt-secret"
    assert auth_flow.jwt_algorithm == "HS256"
    assert auth_flow.token_expiration == 3600
    assert auth_flow.refresh_token_expiration == 2592000
    assert auth_flow.creator_id == "test-creator-id"
    
    # Call the function again
    auth_flow2 = get_privy_auth_flow()
    
    # Check that the same instance is returned
    assert auth_flow2 is auth_flow


@pytest.mark.asyncio
async def test_verify_privy_token():
    """Test the verify_privy_token function."""
    # Mock the PrivyAuthFlow.verify_token method
    with patch("core.auth_flow.get_privy_auth_flow") as mock_get_flow:
        # Set up the mock auth flow
        mock_flow = MagicMock()
        mock_result = AuthFlowResult(success=True)
        mock_flow.verify_token = AsyncMock(return_value=mock_result)
        mock_get_flow.return_value = mock_flow
        
        # Call the function
        result = await verify_privy_token("test-privy-token")
        
        # Check the result
        assert result is mock_result
        
        # Check that the functions were called
        mock_get_flow.assert_called_once()
        mock_flow.verify_token.assert_called_once_with("test-privy-token")


@pytest.mark.asyncio
async def test_refresh_token_function():
    """Test the refresh_token function."""
    # Mock the PrivyAuthFlow.refresh_token method
    with patch("core.auth_flow.get_privy_auth_flow") as mock_get_flow:
        # Set up the mock auth flow
        mock_flow = MagicMock()
        mock_result = AuthFlowResult(success=True)
        mock_flow.refresh_token = AsyncMock(return_value=mock_result)
        mock_get_flow.return_value = mock_flow
        
        # Call the function
        result = await refresh_token("test-refresh-token")
        
        # Check the result
        assert result is mock_result
        
        # Check that the functions were called
        mock_get_flow.assert_called_once()
        mock_flow.refresh_token.assert_called_once_with("test-refresh-token")


@pytest.mark.asyncio
async def test_logout_function():
    """Test the logout function."""
    # Mock the PrivyAuthFlow.logout method
    with patch("core.auth_flow.get_privy_auth_flow") as mock_get_flow:
        # Set up the mock auth flow
        mock_flow = MagicMock()
        mock_result = AuthFlowResult(success=True)
        mock_flow.logout = AsyncMock(return_value=mock_result)
        mock_get_flow.return_value = mock_flow
        
        # Call the function
        result = await logout("test-refresh-token")
        
        # Check the result
        assert result is mock_result
        
        # Check that the functions were called
        mock_get_flow.assert_called_once()
        mock_flow.logout.assert_called_once_with("test-refresh-token")
