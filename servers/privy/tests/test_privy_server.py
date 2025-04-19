#!/usr/bin/env python3
"""
Tests for the Privy authentication MCP server.
"""

import json
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

from mcp.server.fastmcp import Context
from servers.privy.server import (
    privy_verify_token,
    privy_get_user,
    privy_list_users,
    privy_create_user,
    privy_update_user,
    privy_delete_user,
    privy_create_auth_token,
    privy_revoke_auth_token
)
from servers.privy.client import PrivyClient


@pytest.fixture
def mock_context():
    """Create a mock MCP Context."""
    context = MagicMock(spec=Context)
    return context


@pytest.fixture
def mock_client():
    """Create a mock PrivyClient."""
    client = MagicMock(spec=PrivyClient)
    return client


class TestPrivyMCPServer:
    """Tests for the Privy MCP server tools."""
    
    @pytest.mark.asyncio
    async def test_privy_verify_token_success(self, mock_context, mock_client):
        """Test verifying a token successfully."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.verify_token method
            expected_data = {"user_id": "test-user-id", "valid": True}
            mock_client.verify_token = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await privy_verify_token(
                ctx=mock_context,
                token="test-token"
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that verify_token was called with the correct arguments
            mock_client.verify_token.assert_called_once_with("test-token")
    
    @pytest.mark.asyncio
    async def test_privy_verify_token_error(self, mock_context, mock_client):
        """Test verifying a token with an error."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.verify_token method to raise an exception
            mock_client.verify_token = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await privy_verify_token(
                ctx=mock_context,
                token="test-token"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_privy_get_user_success(self, mock_context, mock_client):
        """Test getting a user successfully."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.get_user method
            expected_data = {"id": "test-user-id", "email": "test@example.com"}
            mock_client.get_user = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await privy_get_user(
                ctx=mock_context,
                user_id="test-user-id"
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that get_user was called with the correct arguments
            mock_client.get_user.assert_called_once_with("test-user-id")
    
    @pytest.mark.asyncio
    async def test_privy_get_user_error(self, mock_context, mock_client):
        """Test getting a user with an error."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.get_user method to raise an exception
            mock_client.get_user = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await privy_get_user(
                ctx=mock_context,
                user_id="test-user-id"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_privy_list_users_success(self, mock_context, mock_client):
        """Test listing users successfully."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.list_users method
            expected_data = {"users": [{"id": "test-user-id", "email": "test@example.com"}]}
            mock_client.list_users = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await privy_list_users(
                ctx=mock_context,
                limit=10,
                cursor="test-cursor"
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that list_users was called with the correct arguments
            mock_client.list_users.assert_called_once_with(10, "test-cursor")
    
    @pytest.mark.asyncio
    async def test_privy_list_users_error(self, mock_context, mock_client):
        """Test listing users with an error."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.list_users method to raise an exception
            mock_client.list_users = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await privy_list_users(
                ctx=mock_context
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_privy_create_user_success(self, mock_context, mock_client):
        """Test creating a user successfully."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.create_user method
            expected_data = {"id": "test-user-id", "email": "test@example.com"}
            mock_client.create_user = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await privy_create_user(
                ctx=mock_context,
                email="test@example.com",
                wallet_address="0x123",
                farcaster_fid="test-fid",
                twitter_handle="test-twitter",
                linked_accounts='[{"type": "discord", "id": "test-discord"}]',
                custom_fields='{"xp": 100}'
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that create_user was called with the correct arguments
            mock_client.create_user.assert_called_once()
            call_args = mock_client.create_user.call_args[1]
            assert call_args["email"] == "test@example.com"
            assert call_args["wallet_address"] == "0x123"
            assert call_args["farcaster_fid"] == "test-fid"
            assert call_args["twitter_handle"] == "test-twitter"
            assert call_args["linked_accounts"] == [{"type": "discord", "id": "test-discord"}]
            assert call_args["custom_fields"] == {"xp": 100}
    
    @pytest.mark.asyncio
    async def test_privy_create_user_invalid_linked_accounts(self, mock_context, mock_client):
        """Test creating a user with invalid linked_accounts."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Call the tool
            result = await privy_create_user(
                ctx=mock_context,
                email="test@example.com",
                linked_accounts='invalid json'
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid linked_accounts format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_privy_create_user_invalid_custom_fields(self, mock_context, mock_client):
        """Test creating a user with invalid custom_fields."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Call the tool
            result = await privy_create_user(
                ctx=mock_context,
                email="test@example.com",
                custom_fields='invalid json'
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid custom_fields format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_privy_create_user_error(self, mock_context, mock_client):
        """Test creating a user with an error."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.create_user method to raise an exception
            mock_client.create_user = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await privy_create_user(
                ctx=mock_context,
                email="test@example.com"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_privy_update_user_success(self, mock_context, mock_client):
        """Test updating a user successfully."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.update_user method
            expected_data = {"id": "test-user-id", "email": "updated@example.com"}
            mock_client.update_user = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await privy_update_user(
                ctx=mock_context,
                user_id="test-user-id",
                email="updated@example.com",
                custom_fields='{"xp": 200}'
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that update_user was called with the correct arguments
            mock_client.update_user.assert_called_once()
            call_args = mock_client.update_user.call_args[1]
            assert call_args["user_id"] == "test-user-id"
            assert call_args["email"] == "updated@example.com"
            assert call_args["custom_fields"] == {"xp": 200}
    
    @pytest.mark.asyncio
    async def test_privy_update_user_invalid_linked_accounts(self, mock_context, mock_client):
        """Test updating a user with invalid linked_accounts."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Call the tool
            result = await privy_update_user(
                ctx=mock_context,
                user_id="test-user-id",
                linked_accounts='invalid json'
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid linked_accounts format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_privy_update_user_invalid_custom_fields(self, mock_context, mock_client):
        """Test updating a user with invalid custom_fields."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Call the tool
            result = await privy_update_user(
                ctx=mock_context,
                user_id="test-user-id",
                custom_fields='invalid json'
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid custom_fields format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_privy_update_user_error(self, mock_context, mock_client):
        """Test updating a user with an error."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.update_user method to raise an exception
            mock_client.update_user = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await privy_update_user(
                ctx=mock_context,
                user_id="test-user-id"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_privy_delete_user_success(self, mock_context, mock_client):
        """Test deleting a user successfully."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.delete_user method
            expected_data = {"success": True}
            mock_client.delete_user = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await privy_delete_user(
                ctx=mock_context,
                user_id="test-user-id"
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that delete_user was called with the correct arguments
            mock_client.delete_user.assert_called_once_with("test-user-id")
    
    @pytest.mark.asyncio
    async def test_privy_delete_user_error(self, mock_context, mock_client):
        """Test deleting a user with an error."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.delete_user method to raise an exception
            mock_client.delete_user = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await privy_delete_user(
                ctx=mock_context,
                user_id="test-user-id"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_privy_create_auth_token_success(self, mock_context, mock_client):
        """Test creating an authentication token successfully."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.create_auth_token method
            expected_data = {"token": "test-token", "expires_at": "2023-01-01T00:00:00Z"}
            mock_client.create_auth_token = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await privy_create_auth_token(
                ctx=mock_context,
                user_id="test-user-id",
                expiration_seconds=3600
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that create_auth_token was called with the correct arguments
            mock_client.create_auth_token.assert_called_once_with("test-user-id", 3600)
    
    @pytest.mark.asyncio
    async def test_privy_create_auth_token_error(self, mock_context, mock_client):
        """Test creating an authentication token with an error."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.create_auth_token method to raise an exception
            mock_client.create_auth_token = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await privy_create_auth_token(
                ctx=mock_context,
                user_id="test-user-id"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_privy_revoke_auth_token_success(self, mock_context, mock_client):
        """Test revoking an authentication token successfully."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.revoke_auth_token method
            expected_data = {"success": True}
            mock_client.revoke_auth_token = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await privy_revoke_auth_token(
                ctx=mock_context,
                token="test-token"
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that revoke_auth_token was called with the correct arguments
            mock_client.revoke_auth_token.assert_called_once_with("test-token")
    
    @pytest.mark.asyncio
    async def test_privy_revoke_auth_token_error(self, mock_context, mock_client):
        """Test revoking an authentication token with an error."""
        # Mock the get_privy_client function
        with patch("servers.privy.server.get_privy_client", AsyncMock(return_value=mock_client)):
            # Mock the client.revoke_auth_token method to raise an exception
            mock_client.revoke_auth_token = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await privy_revoke_auth_token(
                ctx=mock_context,
                token="test-token"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
