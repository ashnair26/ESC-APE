#!/usr/bin/env python3
"""
Tests for the authentication API server.
"""

import os
import json
import time
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient

from core.auth import AuthUser
from core.auth_flow import AuthFlowResult
from servers.auth.server import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


class TestAuthServer:
    """Tests for the authentication API server."""

    def test_verify_token_endpoint_success(self, client):
        """Test the verify token endpoint with a successful result."""
        # Mock the verify_privy_token function
        with patch("servers.auth.server.verify_privy_token") as mock_verify:
            # Set up the mock verify_privy_token
            mock_verify.return_value = AuthFlowResult(
                success=True,
                user=AuthUser(
                    id="test-user-id",
                    username="testuser",
                    email="test@example.com",
                    role="user",
                    scopes=["mcp:access"]
                ),
                token="test-jwt-token",
                refresh_token="test-refresh-token",
                expires_in=3600
            )

            # Make the request
            response = client.post(
                "/auth/verify",
                json={"token": "test-privy-token"}
            )

            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["token"] == "test-jwt-token"
            assert data["refresh_token"] == "test-refresh-token"
            assert data["expires_in"] == 3600
            assert data["user"]["id"] == "test-user-id"
            assert data["user"]["username"] == "testuser"
            assert data["user"]["email"] == "test@example.com"
            assert data["user"]["role"] == "user"
            assert data["user"]["scopes"] == ["mcp:access"]

            # Check that the function was called
            mock_verify.assert_called_once_with("test-privy-token")

            # Check that the cookies were set
            cookies = response.cookies
            assert "token" in cookies
            assert "refresh_token" in cookies

    def test_verify_token_endpoint_failure(self, client):
        """Test the verify token endpoint with a failed result."""
        # Mock the verify_privy_token function
        with patch("servers.auth.server.verify_privy_token") as mock_verify:
            # Set up the mock verify_privy_token
            mock_verify.return_value = AuthFlowResult(
                success=False,
                error="Invalid token"
            )

            # Make the request
            response = client.post(
                "/auth/verify",
                json={"token": "test-privy-token"}
            )

            # Check the response
            assert response.status_code == 401
            data = response.json()
            assert data["detail"] == "Invalid token"

            # Check that the function was called
            mock_verify.assert_called_once_with("test-privy-token")

    def test_refresh_token_endpoint_success(self, client):
        """Test the refresh token endpoint with a successful result."""
        # Mock the refresh_token function
        with patch("servers.auth.server.refresh_token") as mock_refresh:
            # Set up the mock refresh_token
            mock_refresh.return_value = AuthFlowResult(
                success=True,
                user=AuthUser(
                    id="test-user-id",
                    username="testuser",
                    email="test@example.com",
                    role="user",
                    scopes=["mcp:access"]
                ),
                token="test-jwt-token",
                refresh_token="test-refresh-token",
                expires_in=3600
            )

            # Make the request
            response = client.post(
                "/auth/refresh",
                json={"refresh_token": "test-refresh-token"}
            )

            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["token"] == "test-jwt-token"
            assert data["refresh_token"] == "test-refresh-token"
            assert data["expires_in"] == 3600
            assert data["user"]["id"] == "test-user-id"
            assert data["user"]["username"] == "testuser"
            assert data["user"]["email"] == "test@example.com"
            assert data["user"]["role"] == "user"
            assert data["user"]["scopes"] == ["mcp:access"]

            # Check that the function was called
            mock_refresh.assert_called_once_with("test-refresh-token")

            # Check that the cookies were set
            cookies = response.cookies
            assert "token" in cookies

    def test_refresh_token_endpoint_from_cookie(self, client):
        """Test the refresh token endpoint with a token from cookies."""
        # Mock the refresh_token function
        with patch("servers.auth.server.refresh_token") as mock_refresh:
            # Set up the mock refresh_token
            mock_refresh.return_value = AuthFlowResult(
                success=True,
                user=AuthUser(
                    id="test-user-id",
                    username="testuser",
                    email="test@example.com",
                    role="user",
                    scopes=["mcp:access"]
                ),
                token="test-jwt-token",
                refresh_token="test-refresh-token",
                expires_in=3600
            )

            # Make the request with a cookie
            client.cookies.set("refresh_token", "test-refresh-token")
            response = client.post("/auth/refresh")

            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True

            # Check that the function was called
            mock_refresh.assert_called_once_with("test-refresh-token")

    def test_refresh_token_endpoint_failure(self, client):
        """Test the refresh token endpoint with a failed result."""
        # Mock the refresh_token function
        with patch("servers.auth.server.refresh_token") as mock_refresh:
            # Set up the mock refresh_token
            mock_refresh.return_value = AuthFlowResult(
                success=False,
                error="Invalid refresh token"
            )

            # Make the request
            response = client.post(
                "/auth/refresh",
                json={"refresh_token": "test-refresh-token"}
            )

            # Check the response
            assert response.status_code == 401
            data = response.json()
            assert data["detail"] == "Invalid refresh token"

            # Check that the function was called
            mock_refresh.assert_called_once_with("test-refresh-token")

    def test_logout_endpoint_success(self, client):
        """Test the logout endpoint with a successful result."""
        # Mock the logout function
        with patch("servers.auth.server.logout") as mock_logout:
            # Set up the mock logout
            mock_logout.return_value = AuthFlowResult(
                success=True
            )

            # Make the request
            response = client.post(
                "/auth/logout",
                json={"refresh_token": "test-refresh-token"}
            )

            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True

            # Check that the function was called
            mock_logout.assert_called_once_with("test-refresh-token")

            # Check that the cookies were cleared
            cookies = response.cookies
            assert cookies.get("token") == ""
            assert cookies.get("refresh_token") == ""

    def test_logout_endpoint_from_cookie(self, client):
        """Test the logout endpoint with a token from cookies."""
        # Mock the logout function
        with patch("servers.auth.server.logout") as mock_logout:
            # Set up the mock logout
            mock_logout.return_value = AuthFlowResult(
                success=True
            )

            # Make the request with a cookie
            client.cookies.set("refresh_token", "test-refresh-token")
            response = client.post("/auth/logout")

            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True

            # Check that the function was called
            mock_logout.assert_called_once_with("test-refresh-token")

    def test_logout_endpoint_failure(self, client):
        """Test the logout endpoint with a failed result."""
        # Mock the logout function
        with patch("servers.auth.server.logout") as mock_logout:
            # Set up the mock logout
            mock_logout.return_value = AuthFlowResult(
                success=False,
                error="Failed to revoke refresh token"
            )

            # Make the request
            response = client.post(
                "/auth/logout",
                json={"refresh_token": "test-refresh-token"}
            )

            # Check the response
            assert response.status_code == 500
            data = response.json()
            assert data["detail"] == "Failed to revoke refresh token"

            # Check that the function was called
            mock_logout.assert_called_once_with("test-refresh-token")

            # Check that the cookies were cleared anyway
            cookies = response.cookies
            assert cookies.get("token") == ""
            assert cookies.get("refresh_token") == ""

    def test_get_user_endpoint_success(self, client):
        """Test the get user endpoint with a valid JWT token."""
        # Mock the jwt.decode function
        with patch("servers.auth.server.jwt") as mock_jwt, \
             patch.dict(os.environ, {"JWT_SECRET": "test-jwt-secret"}):
            # Set up the mock jwt.decode
            mock_jwt.decode.return_value = {
                "sub": "test-user-id",
                "username": "testuser",
                "email": "test@example.com",
                "role": "user",
                "scopes": ["mcp:access"],
                "exp": int(time.time()) + 3600
            }

            # Make the request
            response = client.get(
                "/auth/user",
                headers={"Authorization": "Bearer test-jwt-token"}
            )

            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["user"]["id"] == "test-user-id"
            assert data["user"]["username"] == "testuser"
            assert data["user"]["email"] == "test@example.com"
            assert data["user"]["role"] == "user"
            assert data["user"]["scopes"] == ["mcp:access"]

            # Check that the function was called
            mock_jwt.decode.assert_called_once_with(
                "test-jwt-token",
                "test-jwt-secret",
                algorithms=["HS256"]
            )

    def test_get_user_endpoint_from_cookie(self, client):
        """Test the get user endpoint with a token from cookies."""
        # Mock the jwt.decode function
        with patch("servers.auth.server.jwt") as mock_jwt, \
             patch.dict(os.environ, {"JWT_SECRET": "test-jwt-secret"}):
            # Set up the mock jwt.decode
            mock_jwt.decode.return_value = {
                "sub": "test-user-id",
                "username": "testuser",
                "email": "test@example.com",
                "role": "user",
                "scopes": ["mcp:access"],
                "exp": int(time.time()) + 3600
            }

            # Make the request with a cookie
            client.cookies.set("token", "test-jwt-token")
            response = client.get("/auth/user")

            # Check the response
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True

            # Check that the function was called
            mock_jwt.decode.assert_called_once_with(
                "test-jwt-token",
                "test-jwt-secret",
                algorithms=["HS256"]
            )

    def test_get_user_endpoint_expired_token(self, client):
        """Test the get user endpoint with an expired JWT token."""
        # Mock the jwt.decode function
        with patch("servers.auth.server.jwt") as mock_jwt, \
             patch.dict(os.environ, {"JWT_SECRET": "test-jwt-secret"}):
            # Set up the mock jwt.decode
            mock_jwt.decode.return_value = {
                "sub": "test-user-id",
                "username": "testuser",
                "email": "test@example.com",
                "role": "user",
                "scopes": ["mcp:access"],
                "exp": int(time.time()) - 3600  # Expired 1 hour ago
            }

            # Make the request
            response = client.get(
                "/auth/user",
                headers={"Authorization": "Bearer test-jwt-token"}
            )

            # Check the response
            assert response.status_code == 401
            data = response.json()
            assert data["detail"] == "JWT token has expired"

    def test_get_user_endpoint_invalid_token(self, client):
        """Test the get user endpoint with an invalid JWT token."""
        # Mock the jwt.decode function
        with patch("servers.auth.server.jwt") as mock_jwt, \
             patch.dict(os.environ, {"JWT_SECRET": "test-jwt-secret"}):
            # Set up the mock jwt.decode to raise an exception
            from jwt.exceptions import PyJWTError
            mock_jwt.decode.side_effect = PyJWTError("Invalid token")
            mock_jwt.exceptions.PyJWTError = PyJWTError

            # Make the request
            response = client.get(
                "/auth/user",
                headers={"Authorization": "Bearer test-jwt-token"}
            )

            # Check the response
            assert response.status_code == 401
            data = response.json()
            assert data["detail"] == "Invalid JWT token: Invalid token"
