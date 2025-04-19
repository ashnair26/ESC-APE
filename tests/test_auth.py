#!/usr/bin/env python3
"""
Tests for the authentication middleware.
"""

import os
import json
import time
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

from mcp.server.fastmcp import Context, FastMCP
from core.auth import (
    AuthUser,
    AuthResult,
    AuthMiddleware,
    require_auth,
    setup_auth_middleware,
    create_api_token,
    revoke_api_token,
    create_jwt_token
)


class TestAuthUser:
    """Tests for the AuthUser class."""

    def test_auth_user_creation(self):
        """Test creating an AuthUser object."""
        user = AuthUser(
            id="test-user",
            username="testuser",
            email="test@example.com",
            role="user",
            scopes=["test:read", "test:write"]
        )

        assert user.id == "test-user"
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.role == "user"
        assert user.scopes == ["test:read", "test:write"]

    def test_auth_user_default_scopes(self):
        """Test that AuthUser initializes with empty scopes by default."""
        user = AuthUser(id="test-user")

        assert user.id == "test-user"
        assert user.username is None
        assert user.email is None
        assert user.role is None
        assert user.scopes == []


class TestAuthResult:
    """Tests for the AuthResult class."""

    def test_auth_result_success(self):
        """Test creating a successful AuthResult."""
        user = AuthUser(id="test-user")
        result = AuthResult(success=True, user=user)

        assert result.success is True
        assert result.user is user
        assert result.error is None

    def test_auth_result_failure(self):
        """Test creating a failed AuthResult."""
        result = AuthResult(success=False, error="Authentication failed")

        assert result.success is False
        assert result.user is None
        assert result.error == "Authentication failed"


class TestAuthMiddleware:
    """Tests for the AuthMiddleware class."""

    def test_init(self):
        """Test initializing an AuthMiddleware."""
        middleware = AuthMiddleware(
            jwt_secret="test-secret",
            jwt_algorithm="HS256",
            api_token_header="X-API-Token",
            jwt_token_header="Authorization",
            required_scopes=["test:read"],
            skip_auth=False
        )

        assert middleware.jwt_secret == "test-secret"
        assert middleware.jwt_algorithm == "HS256"
        assert middleware.api_token_header == "X-API-Token"
        assert middleware.jwt_token_header == "Authorization"
        assert middleware.required_scopes == ["test:read"]
        assert middleware.skip_auth is False
        assert middleware.api_token_cache == {}
        assert middleware.api_token_cache_timestamps == {}

    def test_init_defaults(self):
        """Test initializing an AuthMiddleware with default values."""
        middleware = AuthMiddleware()

        assert middleware.jwt_secret is None
        assert middleware.jwt_algorithm == "HS256"
        assert middleware.api_token_header == "X-API-Token"
        assert middleware.jwt_token_header == "Authorization"
        assert middleware.required_scopes == []
        assert middleware.skip_auth is False
        assert middleware.api_token_cache == {}
        assert middleware.api_token_cache_timestamps == {}

    def test_has_required_scopes_no_scopes(self):
        """Test _has_required_scopes when no scopes are required."""
        middleware = AuthMiddleware()
        user = AuthUser(id="test-user", scopes=[])

        assert middleware._has_required_scopes(user) is True

    def test_has_required_scopes_wildcard(self):
        """Test _has_required_scopes when user has wildcard scope."""
        middleware = AuthMiddleware(required_scopes=["test:read", "test:write"])
        user = AuthUser(id="test-user", scopes=["*"])

        assert middleware._has_required_scopes(user) is True

    def test_has_required_scopes_match(self):
        """Test _has_required_scopes when user has all required scopes."""
        middleware = AuthMiddleware(required_scopes=["test:read", "test:write"])
        user = AuthUser(id="test-user", scopes=["test:read", "test:write", "test:delete"])

        assert middleware._has_required_scopes(user) is True

    def test_has_required_scopes_mismatch(self):
        """Test _has_required_scopes when user doesn't have all required scopes."""
        middleware = AuthMiddleware(required_scopes=["test:read", "test:write"])
        user = AuthUser(id="test-user", scopes=["test:read"])

        assert middleware._has_required_scopes(user) is False

    @pytest.mark.asyncio
    async def test_authenticate_skip_auth(self):
        """Test authenticate when skip_auth is True."""
        middleware = AuthMiddleware(skip_auth=True)
        ctx = MagicMock(spec=Context)
        ctx.request_meta = {}

        result = await middleware.authenticate(ctx)

        assert result.success is True
        assert result.user.id == "dev"
        assert result.user.username == "developer"
        assert result.user.role == "admin"
        assert result.user.scopes == ["*"]

    @pytest.mark.asyncio
    async def test_authenticate_no_token(self):
        """Test authenticate when no token is provided."""
        middleware = AuthMiddleware()
        ctx = MagicMock(spec=Context)
        ctx.request_meta = {"headers": {}}

        result = await middleware.authenticate(ctx)

        assert result.success is False
        assert result.error == "Authentication failed. No valid API token or JWT token provided."

    @pytest.mark.asyncio
    async def test_authenticate_api_token(self):
        """Test authenticate with an API token."""
        middleware = AuthMiddleware()
        ctx = MagicMock(spec=Context)
        ctx.request_meta = {"headers": {"X-API-Token": "test-token"}}

        # Mock the _authenticate_api_token method
        expected_result = AuthResult(
            success=True,
            user=AuthUser(id="test-user")
        )
        middleware._authenticate_api_token = AsyncMock(return_value=expected_result)

        result = await middleware.authenticate(ctx)

        middleware._authenticate_api_token.assert_called_once_with("test-token")
        assert result is expected_result

    @pytest.mark.asyncio
    async def test_authenticate_jwt_token(self):
        """Test authenticate with a JWT token."""
        middleware = AuthMiddleware()
        ctx = MagicMock(spec=Context)
        ctx.request_meta = {"headers": {"Authorization": "Bearer test-token"}}

        # Mock the _authenticate_api_token and _authenticate_jwt_token methods
        api_result = AuthResult(success=False, error="Invalid API token")
        jwt_result = AuthResult(success=True, user=AuthUser(id="test-user"))
        middleware._authenticate_api_token = AsyncMock(return_value=api_result)
        middleware._authenticate_jwt_token = AsyncMock(return_value=jwt_result)

        result = await middleware.authenticate(ctx)

        middleware._authenticate_jwt_token.assert_called_once_with("test-token")
        assert result is jwt_result

    @pytest.mark.asyncio
    async def test_authenticate_api_token_from_cache(self):
        """Test authenticate with an API token from cache."""
        middleware = AuthMiddleware()
        ctx = MagicMock(spec=Context)
        ctx.request_meta = {"headers": {"X-API-Token": "test-token"}}

        # Add the token to the cache
        user = AuthUser(id="test-user")
        middleware.api_token_cache["test-token"] = user
        middleware.api_token_cache_timestamps["test-token"] = time.time()

        result = await middleware.authenticate(ctx)

        assert result.success is True
        assert result.user is user

    @pytest.mark.asyncio
    async def test_authenticate_api_token_expired_cache(self):
        """Test authenticate with an API token from expired cache."""
        middleware = AuthMiddleware()
        middleware.api_token_cache_ttl = 0  # Set TTL to 0 to force expiration
        ctx = MagicMock(spec=Context)
        ctx.request_meta = {"headers": {"X-API-Token": "test-token"}}

        # Add the token to the cache
        user = AuthUser(id="test-user")
        middleware.api_token_cache["test-token"] = user
        middleware.api_token_cache_timestamps["test-token"] = time.time() - 1  # 1 second ago

        # Mock the get_secret function
        with patch("core.auth.get_secret", AsyncMock(return_value=None)):
            result = await middleware.authenticate(ctx)

        assert result.success is False
        assert result.error == "Authentication failed. No valid API token or JWT token provided."


@pytest.mark.asyncio
async def test_create_api_token():
    """Test creating an API token."""
    # Mock the set_secret function
    with patch("core.secrets.set_secret", AsyncMock(return_value=True)), \
         patch("secrets.token_urlsafe", return_value="test-token"):

        token = await create_api_token(
            user_id="test-user",
            username="testuser",
            email="test@example.com",
            role="user",
            scopes=["test:read", "test:write"]
        )

        assert token == "test-token"


@pytest.mark.asyncio
async def test_revoke_api_token():
    """Test revoking an API token."""
    # Mock the delete_secret function
    with patch("core.secrets.delete_secret", AsyncMock(return_value=True)):
        result = await revoke_api_token("test-token")

        assert result is True


@pytest.mark.asyncio
async def test_create_jwt_token():
    """Test creating a JWT token."""
    # Mock the jwt.encode function and os.environ
    with patch("core.auth.jwt.encode", return_value="test-jwt-token"), \
         patch("core.auth.os.environ.get", return_value="test-secret"):

        token = await create_jwt_token(
            user_id="test-user",
            username="testuser",
            email="test@example.com",
            role="user",
            scopes=["test:read", "test:write"]
        )

        assert token == "test-jwt-token"


@pytest.mark.asyncio
async def test_require_auth_decorator():
    """Test the require_auth decorator."""
    # Create a mock context
    ctx = MagicMock(spec=Context)
    ctx.fastmcp = MagicMock()
    ctx.fastmcp._auth_middleware = MagicMock()

    # Create a mock auth result
    auth_result = AuthResult(
        success=True,
        user=AuthUser(
            id="test-user",
            username="testuser",
            scopes=["test:read"]
        )
    )

    # Mock the authenticate method
    ctx.fastmcp._auth_middleware.authenticate = AsyncMock(return_value=auth_result)

    # Create a decorated function
    @require_auth(scopes=["test:read"])
    async def test_func(ctx):
        return "success"

    # Call the decorated function
    result = await test_func(ctx)

    # Check that the authenticate method was called
    ctx.fastmcp._auth_middleware.authenticate.assert_called_once_with(ctx)

    # Check that the user was added to the context
    assert ctx.user is auth_result.user

    # Check that the function was called
    assert result == "success"


@pytest.mark.asyncio
async def test_require_auth_decorator_no_auth_middleware():
    """Test the require_auth decorator when no auth middleware is configured."""
    # Create a mock context
    ctx = MagicMock(spec=Context)
    ctx.fastmcp = MagicMock()
    ctx.fastmcp._auth_middleware = None

    # Create a decorated function
    @require_auth(scopes=["test:read"])
    async def test_func(ctx):
        return "success"

    # Call the decorated function
    result = await test_func(ctx)

    # Check that the function was called
    assert result == "success"


@pytest.mark.asyncio
async def test_require_auth_decorator_auth_failed():
    """Test the require_auth decorator when authentication fails."""
    # Create a mock context
    ctx = MagicMock(spec=Context)
    ctx.fastmcp = MagicMock()
    ctx.fastmcp._auth_middleware = MagicMock()

    # Create a mock auth result
    auth_result = AuthResult(
        success=False,
        error="Authentication failed"
    )

    # Mock the authenticate method
    ctx.fastmcp._auth_middleware.authenticate = AsyncMock(return_value=auth_result)

    # Create a decorated function
    @require_auth(scopes=["test:read"])
    async def test_func(ctx):
        return "success"

    # Call the decorated function
    result = await test_func(ctx)

    # Check that the authenticate method was called
    ctx.fastmcp._auth_middleware.authenticate.assert_called_once_with(ctx)

    # Check that the error was logged
    ctx.error.assert_called_once_with("Authentication failed")

    # Check that the function returned an error
    assert json.loads(result)["error"] == "Authentication failed"


@pytest.mark.asyncio
async def test_require_auth_decorator_insufficient_scopes():
    """Test the require_auth decorator when the user has insufficient scopes."""
    # Create a mock context
    ctx = MagicMock(spec=Context)
    ctx.fastmcp = MagicMock()
    ctx.fastmcp._auth_middleware = MagicMock()

    # Create a mock auth result
    auth_result = AuthResult(
        success=True,
        user=AuthUser(
            id="test-user",
            username="testuser",
            scopes=["test:read"]
        )
    )

    # Mock the authenticate method
    ctx.fastmcp._auth_middleware.authenticate = AsyncMock(return_value=auth_result)

    # Create a decorated function
    @require_auth(scopes=["test:write"])
    async def test_func(ctx):
        return "success"

    # Call the decorated function
    result = await test_func(ctx)

    # Check that the authenticate method was called
    ctx.fastmcp._auth_middleware.authenticate.assert_called_once_with(ctx)

    # Check that the error was logged
    ctx.error.assert_called_once_with("Insufficient permissions. Required scope: test:write")

    # Check that the function returned an error
    assert json.loads(result)["error"] == "Insufficient permissions. Required scope: test:write"


def test_setup_auth_middleware():
    """Test setting up the auth middleware."""
    # Create a mock MCP server
    mcp_server = MagicMock(spec=FastMCP)

    # Set up the auth middleware
    setup_auth_middleware(
        mcp_server=mcp_server,
        jwt_secret="test-secret",
        jwt_algorithm="HS256",
        api_token_header="X-API-Token",
        jwt_token_header="Authorization",
        required_scopes=["test:read"],
        skip_auth=False
    )

    # Check that the auth middleware was attached to the MCP server
    assert hasattr(mcp_server, "_auth_middleware")
    assert isinstance(mcp_server._auth_middleware, AuthMiddleware)
    assert mcp_server._auth_middleware.jwt_secret == "test-secret"
    assert mcp_server._auth_middleware.jwt_algorithm == "HS256"
    assert mcp_server._auth_middleware.api_token_header == "X-API-Token"
    assert mcp_server._auth_middleware.jwt_token_header == "Authorization"
    assert mcp_server._auth_middleware.required_scopes == ["test:read"]
    assert mcp_server._auth_middleware.skip_auth is False
