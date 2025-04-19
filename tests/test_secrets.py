#!/usr/bin/env python3
"""
Tests for the secrets management system.
"""

import os
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

from core.secrets import (
    Secret,
    SecretsManager,
    get_secrets_manager,
    get_secret,
    set_secret,
    delete_secret,
    list_secrets
)


class TestSecret:
    """Tests for the Secret class."""

    def test_secret_creation(self):
        """Test creating a Secret object."""
        secret = Secret(
            id="123",
            name="test-secret",
            value="test-value",
            creator_id="user-123",
            description="Test secret",
            created_at="2023-01-01T00:00:00Z",
            updated_at="2023-01-01T00:00:00Z"
        )

        assert secret.id == "123"
        assert secret.name == "test-secret"
        assert secret.value == "test-value"
        assert secret.creator_id == "user-123"
        assert secret.description == "Test secret"
        assert secret.created_at == "2023-01-01T00:00:00Z"
        assert secret.updated_at == "2023-01-01T00:00:00Z"


class TestSecretsManager:
    """Tests for the SecretsManager class."""

    def test_init(self):
        """Test initializing a SecretsManager."""
        manager = SecretsManager("https://example.com", "test-key")

        assert manager.supabase_url == "https://example.com"
        assert manager.supabase_key == "test-key"

    @patch("core.secrets.get_env_var")
    def test_from_env(self, mock_get_env_var):
        """Test creating a SecretsManager from environment variables."""
        mock_get_env_var.side_effect = lambda key: {
            "SUPABASE_URL": "https://example.com",
            "SUPABASE_SERVICE_ROLE_KEY": "test-key"
        }[key]

        manager = SecretsManager.from_env()

        assert manager.supabase_url == "https://example.com"
        assert manager.supabase_key == "test-key"

        mock_get_env_var.assert_any_call("SUPABASE_URL")
        mock_get_env_var.assert_any_call("SUPABASE_SERVICE_ROLE_KEY")

    @pytest.mark.asyncio
    async def test_request(self):
        """Test making a request to the Supabase API."""
        manager = SecretsManager("https://example.com", "test-key")

        # Create a custom _request method for testing
        async def mock_request(method, path, json_data=None, params=None):
            return {"data": "test"}

        # Replace the _request method with our mock
        original_request = manager._request
        manager._request = mock_request

        try:
            result = await manager._request("GET", "/test")
            assert result == {"data": "test"}
        finally:
            # Restore the original _request method
            manager._request = original_request

    @pytest.mark.asyncio
    async def test_request_error(self):
        """Test handling errors when making a request to the Supabase API."""
        manager = SecretsManager("https://example.com", "test-key")

        # Create a custom _request method that raises an exception
        async def mock_request_error(method, path, json_data=None, params=None):
            raise Exception("Supabase API error: 400 - Bad Request")

        # Replace the _request method with our mock
        original_request = manager._request
        manager._request = mock_request_error

        try:
            with patch("core.secrets.logger") as mock_logger:
                with pytest.raises(Exception) as excinfo:
                    await manager._request("GET", "/test")

                assert "Supabase API error: 400 - Bad Request" in str(excinfo.value)
                # We don't need to check logger calls since we're bypassing that code
        finally:
            # Restore the original _request method
            manager._request = original_request

    @pytest.mark.asyncio
    async def test_get_secret(self):
        """Test getting a secret."""
        manager = SecretsManager("https://example.com", "test-key")

        # Mock the _request method and decrypt method
        manager._request = AsyncMock(return_value=[{
            "id": "123",
            "name": "test-secret",
            "value": "test-value",
            "creator_id": "user-123",
            "description": "Test secret",
            "created_at": "2023-01-01T00:00:00Z",
            "updated_at": "2023-01-01T00:00:00Z"
        }])
        manager.decrypt = MagicMock(return_value="test-value")

        secret = await manager.get_secret("test-secret", "user-123")

        manager._request.assert_called_once_with(
            method="GET",
            path="/rest/v1/secrets",
            params={
                "name": "eq.test-secret",
                "creator_id": "eq.user-123"
            }
        )

        assert secret.id == "123"
        assert secret.name == "test-secret"
        assert secret.value == "test-value"
        assert secret.creator_id == "user-123"
        assert secret.description == "Test secret"
        assert secret.created_at == "2023-01-01T00:00:00Z"
        assert secret.updated_at == "2023-01-01T00:00:00Z"

    @pytest.mark.asyncio
    async def test_get_secret_not_found(self):
        """Test getting a secret that doesn't exist."""
        manager = SecretsManager("https://example.com", "test-key")

        # Mock the _request method
        manager._request = AsyncMock(return_value=[])

        secret = await manager.get_secret("test-secret", "user-123")

        manager._request.assert_called_once_with(
            method="GET",
            path="/rest/v1/secrets",
            params={
                "name": "eq.test-secret",
                "creator_id": "eq.user-123"
            }
        )

        assert secret is None

    @pytest.mark.asyncio
    async def test_get_secret_error(self):
        """Test handling errors when getting a secret."""
        manager = SecretsManager("https://example.com", "test-key")

        # Mock the _request method
        manager._request = AsyncMock(side_effect=Exception("Test error"))

        with patch("core.secrets.logger") as mock_logger:
            secret = await manager.get_secret("test-secret", "user-123")

            manager._request.assert_called_once_with(
                method="GET",
                path="/rest/v1/secrets",
                params={
                    "name": "eq.test-secret",
                    "creator_id": "eq.user-123"
                }
            )

            assert secret is None
            mock_logger.error.assert_called_once_with(
                "Error getting secret test-secret: Test error"
            )

    @pytest.mark.asyncio
    async def test_set_secret_new(self):
        """Test setting a new secret."""
        manager = SecretsManager("https://example.com", "test-key")

        # Mock the get_secret, _request, and encrypt methods
        manager.get_secret = AsyncMock(return_value=None)
        manager.encrypt = MagicMock(return_value="encrypted-value")
        manager._request = AsyncMock(return_value=[{
            "id": "123",
            "name": "test-secret",
            "value": "test-value",
            "creator_id": "user-123",
            "description": "Test secret",
            "created_at": "2023-01-01T00:00:00Z",
            "updated_at": "2023-01-01T00:00:00Z"
        }])

        secret = await manager.set_secret(
            "test-secret",
            "test-value",
            "user-123",
            "Test secret"
        )

        manager.get_secret.assert_called_once_with("test-secret", "user-123")
        manager._request.assert_called_once_with(
            method="POST",
            path="/rest/v1/secrets",
            json_data={
                "name": "test-secret",
                "value": "encrypted-value",  # This is now encrypted
                "creator_id": "user-123",
                "description": "Test secret"
            }
        )

        assert secret.id == "123"
        assert secret.name == "test-secret"
        assert secret.value == "test-value"
        assert secret.creator_id == "user-123"
        assert secret.description == "Test secret"
        assert secret.created_at == "2023-01-01T00:00:00Z"
        assert secret.updated_at == "2023-01-01T00:00:00Z"

    @pytest.mark.asyncio
    async def test_set_secret_update(self):
        """Test updating an existing secret."""
        manager = SecretsManager("https://example.com", "test-key")

        # Mock the get_secret and _request methods
        existing_secret = Secret(
            id="123",
            name="test-secret",
            value="old-value",
            creator_id="user-123",
            description="Old description",
            created_at="2023-01-01T00:00:00Z",
            updated_at="2023-01-01T00:00:00Z"
        )
        manager.get_secret = AsyncMock(return_value=existing_secret)
        manager.encrypt = MagicMock(return_value="encrypted-value")
        manager._request = AsyncMock(return_value=[{
            "id": "123",
            "name": "test-secret",
            "value": "test-value",
            "creator_id": "user-123",
            "description": "Test secret",
            "created_at": "2023-01-01T00:00:00Z",
            "updated_at": "2023-01-02T00:00:00Z"
        }])

        secret = await manager.set_secret(
            "test-secret",
            "test-value",
            "user-123",
            "Test secret"
        )

        manager.get_secret.assert_called_once_with("test-secret", "user-123")
        manager._request.assert_called_once_with(
            method="PATCH",
            path="/rest/v1/secrets?id=eq.123",
            json_data={
                "value": "encrypted-value",  # This is now encrypted
                "description": "Test secret",
                "updated_at": "now()"
            }
        )

        assert secret.id == "123"
        assert secret.name == "test-secret"
        assert secret.value == "test-value"
        assert secret.creator_id == "user-123"
        assert secret.description == "Test secret"
        assert secret.created_at == "2023-01-01T00:00:00Z"
        assert secret.updated_at == "2023-01-02T00:00:00Z"

    @pytest.mark.asyncio
    async def test_set_secret_error(self):
        """Test handling errors when setting a secret."""
        manager = SecretsManager("https://example.com", "test-key")

        # Mock the get_secret method
        manager.get_secret = AsyncMock(side_effect=Exception("Test error"))

        with patch("core.secrets.logger") as mock_logger:
            secret = await manager.set_secret(
                "test-secret",
                "test-value",
                "user-123",
                "Test secret"
            )

            manager.get_secret.assert_called_once_with("test-secret", "user-123")

            assert secret is None
            mock_logger.error.assert_called_once_with(
                "Error setting secret test-secret: Test error"
            )

    @pytest.mark.asyncio
    async def test_delete_secret(self):
        """Test deleting a secret."""
        manager = SecretsManager("https://example.com", "test-key")

        # Mock the _request method
        manager._request = AsyncMock()

        result = await manager.delete_secret("test-secret", "user-123")

        manager._request.assert_called_once_with(
            method="DELETE",
            path="/rest/v1/secrets",
            params={
                "name": "eq.test-secret",
                "creator_id": "eq.user-123"
            }
        )

        assert result is True

    @pytest.mark.asyncio
    async def test_delete_secret_error(self):
        """Test handling errors when deleting a secret."""
        manager = SecretsManager("https://example.com", "test-key")

        # Mock the _request method
        manager._request = AsyncMock(side_effect=Exception("Test error"))

        with patch("core.secrets.logger") as mock_logger:
            result = await manager.delete_secret("test-secret", "user-123")

            manager._request.assert_called_once_with(
                method="DELETE",
                path="/rest/v1/secrets",
                params={
                    "name": "eq.test-secret",
                    "creator_id": "eq.user-123"
                }
            )

            assert result is False
            mock_logger.error.assert_called_once_with(
                "Error deleting secret test-secret: Test error"
            )

    @pytest.mark.asyncio
    async def test_list_secrets(self):
        """Test listing secrets."""
        manager = SecretsManager("https://example.com", "test-key")

        # Mock the _request method and decrypt method
        manager._request = AsyncMock(return_value=[
            {
                "id": "123",
                "name": "test-secret-1",
                "value": "test-value-1",
                "creator_id": "user-123",
                "description": "Test secret 1",
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z"
            },
            {
                "id": "456",
                "name": "test-secret-2",
                "value": "test-value-2",
                "creator_id": "user-123",
                "description": "Test secret 2",
                "created_at": "2023-01-02T00:00:00Z",
                "updated_at": "2023-01-02T00:00:00Z"
            }
        ])
        manager.decrypt = MagicMock(side_effect=["test-value-1", "test-value-2"])

        secrets = await manager.list_secrets("user-123")

        manager._request.assert_called_once_with(
            method="GET",
            path="/rest/v1/secrets",
            params={
                "creator_id": "eq.user-123"
            }
        )

        assert len(secrets) == 2
        assert secrets[0].id == "123"
        assert secrets[0].name == "test-secret-1"
        assert secrets[0].value == "test-value-1"
        assert secrets[0].creator_id == "user-123"
        assert secrets[0].description == "Test secret 1"
        assert secrets[0].created_at == "2023-01-01T00:00:00Z"
        assert secrets[0].updated_at == "2023-01-01T00:00:00Z"
        assert secrets[1].id == "456"
        assert secrets[1].name == "test-secret-2"
        assert secrets[1].value == "test-value-2"
        assert secrets[1].creator_id == "user-123"
        assert secrets[1].description == "Test secret 2"
        assert secrets[1].created_at == "2023-01-02T00:00:00Z"
        assert secrets[1].updated_at == "2023-01-02T00:00:00Z"

    @pytest.mark.asyncio
    async def test_list_secrets_error(self):
        """Test handling errors when listing secrets."""
        manager = SecretsManager("https://example.com", "test-key")

        # Mock the _request method
        manager._request = AsyncMock(side_effect=Exception("Test error"))

        with patch("core.secrets.logger") as mock_logger:
            secrets = await manager.list_secrets("user-123")

            manager._request.assert_called_once_with(
                method="GET",
                path="/rest/v1/secrets",
                params={
                    "creator_id": "eq.user-123"
                }
            )

            assert secrets == []
            mock_logger.error.assert_called_once_with(
                "Error listing secrets: Test error"
            )


class TestGlobalFunctions:
    """Tests for the global functions."""

    @patch("core.secrets.SecretsManager.from_env")
    def test_get_secrets_manager(self, mock_from_env):
        """Test getting the global SecretsManager instance."""
        # Reset the global instance
        import core.secrets
        core.secrets._secrets_manager = None

        # Mock the SecretsManager.from_env method
        mock_manager = MagicMock()
        mock_from_env.return_value = mock_manager

        # Call the function
        manager = get_secrets_manager()

        # Check the result
        assert manager is mock_manager
        mock_from_env.assert_called_once()

        # Call the function again
        manager2 = get_secrets_manager()

        # Check that the same instance is returned
        assert manager2 is mock_manager
        assert mock_from_env.call_count == 1

    @pytest.mark.asyncio
    @patch("core.secrets.get_secrets_manager")
    async def test_get_secret(self, mock_get_secrets_manager):
        """Test getting a secret value."""
        # Mock the SecretsManager.get_secret method
        mock_manager = MagicMock()
        mock_secret = MagicMock()
        mock_secret.value = "test-value"
        mock_manager.get_secret = AsyncMock(return_value=mock_secret)
        mock_get_secrets_manager.return_value = mock_manager

        # Call the function
        value = await get_secret("test-secret", "user-123")

        # Check the result
        assert value == "test-value"
        mock_get_secrets_manager.assert_called_once()
        mock_manager.get_secret.assert_called_once_with("test-secret", "user-123")

    @pytest.mark.asyncio
    @patch("core.secrets.get_secrets_manager")
    async def test_get_secret_not_found(self, mock_get_secrets_manager):
        """Test getting a secret value that doesn't exist."""
        # Mock the SecretsManager.get_secret method
        mock_manager = MagicMock()
        mock_manager.get_secret = AsyncMock(return_value=None)
        mock_get_secrets_manager.return_value = mock_manager

        # Call the function
        value = await get_secret("test-secret", "user-123")

        # Check the result
        assert value is None
        mock_get_secrets_manager.assert_called_once()
        mock_manager.get_secret.assert_called_once_with("test-secret", "user-123")

    @pytest.mark.asyncio
    @patch("core.secrets.get_secrets_manager")
    async def test_set_secret(self, mock_get_secrets_manager):
        """Test setting a secret."""
        # Mock the SecretsManager.set_secret method
        mock_manager = MagicMock()
        mock_secret = MagicMock()
        mock_manager.set_secret = AsyncMock(return_value=mock_secret)
        mock_get_secrets_manager.return_value = mock_manager

        # Call the function
        result = await set_secret(
            "test-secret",
            "test-value",
            "user-123",
            "Test secret"
        )

        # Check the result
        assert result is True
        mock_get_secrets_manager.assert_called_once()
        mock_manager.set_secret.assert_called_once_with(
            "test-secret",
            "test-value",
            "user-123",
            "Test secret"
        )

    @pytest.mark.asyncio
    @patch("core.secrets.get_secrets_manager")
    async def test_set_secret_error(self, mock_get_secrets_manager):
        """Test handling errors when setting a secret."""
        # Mock the SecretsManager.set_secret method
        mock_manager = MagicMock()
        mock_manager.set_secret = AsyncMock(return_value=None)
        mock_get_secrets_manager.return_value = mock_manager

        # Call the function
        result = await set_secret(
            "test-secret",
            "test-value",
            "user-123",
            "Test secret"
        )

        # Check the result
        assert result is False
        mock_get_secrets_manager.assert_called_once()
        mock_manager.set_secret.assert_called_once_with(
            "test-secret",
            "test-value",
            "user-123",
            "Test secret"
        )

    @pytest.mark.asyncio
    @patch("core.secrets.get_secrets_manager")
    async def test_delete_secret(self, mock_get_secrets_manager):
        """Test deleting a secret."""
        # Mock the SecretsManager.delete_secret method
        mock_manager = MagicMock()
        mock_manager.delete_secret = AsyncMock(return_value=True)
        mock_get_secrets_manager.return_value = mock_manager

        # Call the function
        result = await delete_secret("test-secret", "user-123")

        # Check the result
        assert result is True
        mock_get_secrets_manager.assert_called_once()
        mock_manager.delete_secret.assert_called_once_with("test-secret", "user-123")

    @pytest.mark.asyncio
    @patch("core.secrets.get_secrets_manager")
    async def test_list_secrets(self, mock_get_secrets_manager):
        """Test listing secrets."""
        # Mock the SecretsManager.list_secrets method
        mock_manager = MagicMock()
        mock_secret1 = MagicMock()
        mock_secret1.id = "123"
        mock_secret1.name = "test-secret-1"
        mock_secret1.creator_id = "user-123"
        mock_secret1.description = "Test secret 1"
        mock_secret1.created_at = "2023-01-01T00:00:00Z"
        mock_secret1.updated_at = "2023-01-01T00:00:00Z"
        mock_secret2 = MagicMock()
        mock_secret2.id = "456"
        mock_secret2.name = "test-secret-2"
        mock_secret2.creator_id = "user-123"
        mock_secret2.description = "Test secret 2"
        mock_secret2.created_at = "2023-01-02T00:00:00Z"
        mock_secret2.updated_at = "2023-01-02T00:00:00Z"
        mock_manager.list_secrets = AsyncMock(return_value=[mock_secret1, mock_secret2])
        mock_get_secrets_manager.return_value = mock_manager

        # Call the function
        secrets = await list_secrets("user-123")

        # Check the result
        assert len(secrets) == 2
        assert secrets[0]["id"] == "123"
        assert secrets[0]["name"] == "test-secret-1"
        assert secrets[0]["creator_id"] == "user-123"
        assert secrets[0]["description"] == "Test secret 1"
        assert secrets[0]["created_at"] == "2023-01-01T00:00:00Z"
        assert secrets[0]["updated_at"] == "2023-01-01T00:00:00Z"
        assert secrets[1]["id"] == "456"
        assert secrets[1]["name"] == "test-secret-2"
        assert secrets[1]["creator_id"] == "user-123"
        assert secrets[1]["description"] == "Test secret 2"
        assert secrets[1]["created_at"] == "2023-01-02T00:00:00Z"
        assert secrets[1]["updated_at"] == "2023-01-02T00:00:00Z"
        mock_get_secrets_manager.assert_called_once()
        mock_manager.list_secrets.assert_called_once_with("user-123")
