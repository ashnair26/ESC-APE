"""
Test configuration for pytest.
"""
import os
import sys
import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient
from core.auth import AuthUser

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import the API server
from api.server import app


@pytest.fixture
def client():
    """
    Create a test client for the API server.
    """
    # Mock the get_current_user dependency
    from api.server import get_current_user
    
    # Create a mock user
    mock_user = AuthUser(
        id="test-user",
        username="testuser",
        email="test@example.com",
        role="user",
        scopes=["mcp:access"]
    )
    
    # Override the get_current_user dependency
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    # Create the test client
    with TestClient(app) as client:
        yield client
    
    # Clean up
    app.dependency_overrides = {}
