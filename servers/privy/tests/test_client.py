#!/usr/bin/env python3
"""
Tests for the Privy authentication client.
"""

import json
import pytest
from unittest.mock import patch, AsyncMock

from core.testing import temp_env_vars, MockResponse, mock_async_response
from servers.privy.client import PrivyClient, get_privy_client


class TestPrivyClient:
    """Tests for the PrivyClient class."""
    
    def test_from_env(self):
        """Test creating a client from environment variables."""
        with temp_env_vars(
            PRIVY_APP_ID="test-app-id",
            PRIVY_API_KEY="test-api-key",
            PRIVY_BASE_URL="https://test.privy.io/api/v1"
        ):
            client = PrivyClient.from_env()
            assert client.app_id == "test-app-id"
            assert client.api_key == "test-api-key"
            assert client.base_url == "https://test.privy.io/api/v1"
    
    def test_from_env_defaults(self):
        """Test creating a client with default environment variables."""
        with temp_env_vars(
            PRIVY_APP_ID="test-app-id",
            PRIVY_API_KEY="test-api-key"
        ):
            client = PrivyClient.from_env()
            assert client.app_id == "test-app-id"
            assert client.api_key == "test-api-key"
            assert client.base_url == "https://auth.privy.io/api/v1"
    
    def test_from_env_missing_vars(self):
        """Test creating a client with missing environment variables."""
        with temp_env_vars():
            with pytest.raises(ValueError):
                PrivyClient.from_env()
    
    @pytest.mark.asyncio
    async def test_request_success(self):
        """Test a successful request."""
        client = PrivyClient(
            app_id="test-app-id",
            api_key="test-api-key"
        )
        
        # Mock the httpx.AsyncClient.request method
        expected_data = {"result": "success"}
        mock_response = MockResponse(
            status_code=200,
            json_data=expected_data
        )
        
        with patch("httpx.AsyncClient.request", AsyncMock(return_value=mock_response)):
            # Call the method
            result = await client._request(
                method="GET",
                path="/test"
            )
            
            # Check the result
            assert result == expected_data
    
    @pytest.mark.asyncio
    async def test_request_error(self):
        """Test a request that returns an error."""
        client = PrivyClient(
            app_id="test-app-id",
            api_key="test-api-key"
        )
        
        # Mock the httpx.AsyncClient.request method
        mock_response = MockResponse(
            status_code=400,
            text="Bad Request"
        )
        
        with patch("httpx.AsyncClient.request", AsyncMock(return_value=mock_response)):
            # Call the method
            with pytest.raises(Exception) as excinfo:
                await client._request(
                    method="GET",
                    path="/test"
                )
            
            # Check the error message
            assert "Privy API error: 400 - Bad Request" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_verify_token(self):
        """Test verifying a token."""
        client = PrivyClient(
            app_id="test-app-id",
            api_key="test-api-key"
        )
        
        # Mock the _request method
        expected_data = {"user_id": "test-user-id", "valid": True}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.verify_token("test-token")
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="POST",
            path="/auth/verify",
            json_data={"token": "test-token"}
        )
    
    @pytest.mark.asyncio
    async def test_get_user(self):
        """Test getting a user."""
        client = PrivyClient(
            app_id="test-app-id",
            api_key="test-api-key"
        )
        
        # Mock the _request method
        expected_data = {"id": "test-user-id", "email": "test@example.com"}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.get_user("test-user-id")
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="GET",
            path="/users/test-user-id"
        )
    
    @pytest.mark.asyncio
    async def test_list_users(self):
        """Test listing users."""
        client = PrivyClient(
            app_id="test-app-id",
            api_key="test-api-key"
        )
        
        # Mock the _request method
        expected_data = {"users": [{"id": "test-user-id", "email": "test@example.com"}]}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.list_users(limit=10, cursor="test-cursor")
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="GET",
            path="/users",
            params={"limit": 10, "cursor": "test-cursor"}
        )
    
    @pytest.mark.asyncio
    async def test_create_user(self):
        """Test creating a user."""
        client = PrivyClient(
            app_id="test-app-id",
            api_key="test-api-key"
        )
        
        # Mock the _request method
        expected_data = {"id": "test-user-id", "email": "test@example.com"}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.create_user(
            email="test@example.com",
            wallet_address="0x123",
            farcaster_fid="test-fid",
            twitter_handle="test-twitter",
            custom_fields={"xp": 100}
        )
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once()
        call_args = client._request.call_args[1]
        assert call_args["method"] == "POST"
        assert call_args["path"] == "/users"
        
        # Check the JSON data
        json_data = call_args["json_data"]
        assert json_data["email"] == "test@example.com"
        assert json_data["wallet"]["address"] == "0x123"
        assert json_data["custom_fields"] == {"xp": 100}
        
        # Check the linked accounts
        linked_accounts = json_data["linked_accounts"]
        assert len(linked_accounts) == 2
        assert {"type": "farcaster", "fid": "test-fid"} in linked_accounts
        assert {"type": "twitter", "username": "test-twitter"} in linked_accounts
    
    @pytest.mark.asyncio
    async def test_update_user(self):
        """Test updating a user."""
        client = PrivyClient(
            app_id="test-app-id",
            api_key="test-api-key"
        )
        
        # Mock the _request method
        expected_data = {"id": "test-user-id", "email": "updated@example.com"}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.update_user(
            user_id="test-user-id",
            email="updated@example.com",
            custom_fields={"xp": 200}
        )
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once()
        call_args = client._request.call_args[1]
        assert call_args["method"] == "PATCH"
        assert call_args["path"] == "/users/test-user-id"
        
        # Check the JSON data
        json_data = call_args["json_data"]
        assert json_data["email"] == "updated@example.com"
        assert json_data["custom_fields"] == {"xp": 200}
    
    @pytest.mark.asyncio
    async def test_delete_user(self):
        """Test deleting a user."""
        client = PrivyClient(
            app_id="test-app-id",
            api_key="test-api-key"
        )
        
        # Mock the _request method
        expected_data = {"success": True}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.delete_user("test-user-id")
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="DELETE",
            path="/users/test-user-id"
        )
    
    @pytest.mark.asyncio
    async def test_create_auth_token(self):
        """Test creating an authentication token."""
        client = PrivyClient(
            app_id="test-app-id",
            api_key="test-api-key"
        )
        
        # Mock the _request method
        expected_data = {"token": "test-token", "expires_at": "2023-01-01T00:00:00Z"}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.create_auth_token("test-user-id", 3600)
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="POST",
            path="/auth/token",
            json_data={"user_id": "test-user-id", "expiration_seconds": 3600}
        )
    
    @pytest.mark.asyncio
    async def test_revoke_auth_token(self):
        """Test revoking an authentication token."""
        client = PrivyClient(
            app_id="test-app-id",
            api_key="test-api-key"
        )
        
        # Mock the _request method
        expected_data = {"success": True}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.revoke_auth_token("test-token")
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="POST",
            path="/auth/revoke",
            json_data={"token": "test-token"}
        )


@pytest.mark.asyncio
async def test_get_privy_client():
    """Test getting a Privy client."""
    with temp_env_vars(
        PRIVY_APP_ID="test-app-id",
        PRIVY_API_KEY="test-api-key"
    ):
        # Mock the PrivyClient.from_env method
        with patch("servers.privy.client.PrivyClient.from_env", AsyncMock(return_value=PrivyClient(
            app_id="test-app-id",
            api_key="test-api-key"
        ))):
            client = await get_privy_client()
            assert isinstance(client, PrivyClient)
            assert client.app_id == "test-app-id"
            assert client.api_key == "test-api-key"


@pytest.mark.asyncio
async def test_get_privy_client_error():
    """Test getting a Privy client with an error."""
    with temp_env_vars():
        # Mock the PrivyClient.from_env method to raise an error
        with patch("servers.privy.client.PrivyClient.from_env", AsyncMock(side_effect=ValueError("Test error"))):
            with pytest.raises(ValueError) as excinfo:
                await get_privy_client()
            
            # Check the error message
            assert "Test error" in str(excinfo.value)
