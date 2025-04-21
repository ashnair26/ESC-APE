#!/usr/bin/env python3
"""
Tests for the Figma MCP server.
"""

import os
import json
import pytest
import asyncio
from fastapi.testclient import TestClient

from servers.figma.server import app

client = TestClient(app)

def test_root():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Figma MCP Server"}

def test_health():
    """Test the health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_get_tools():
    """Test the tools endpoint."""
    response = client.get("/tools")
    assert response.status_code == 200
    tools = response.json()["tools"]
    assert len(tools) == 3
    assert tools[0]["name"] == "get-file"
    assert tools[1]["name"] == "get-components"
    assert tools[2]["name"] == "get-styles"

def test_get_file():
    """Test the get-file endpoint."""
    # Test with a valid file key
    response = client.post("/tools/get-file", json={"fileKey": "esc-ape-design"})
    assert response.status_code == 200
    assert response.json()["name"] == "ESC-APE Design System"
    
    # Test with a partial file key
    response = client.post("/tools/get-file", json={"fileKey": "design"})
    assert response.status_code == 200
    assert response.json()["name"] == "ESC-APE Design System"
    
    # Test with an invalid file key
    response = client.post("/tools/get-file", json={"fileKey": "invalid"})
    assert response.status_code == 404

def test_get_components():
    """Test the get-components endpoint."""
    # Test with a valid file key
    response = client.post("/tools/get-components", json={"fileKey": "esc-ape-components"})
    assert response.status_code == 200
    components = response.json()["components"]
    assert len(components) == 3
    assert components[0]["name"] == "Button"
    
    # Test with a partial file key
    response = client.post("/tools/get-components", json={"fileKey": "components"})
    assert response.status_code == 200
    components = response.json()["components"]
    assert len(components) == 3
    
    # Test with an invalid file key
    response = client.post("/tools/get-components", json={"fileKey": "invalid"})
    assert response.status_code == 404

def test_get_styles():
    """Test the get-styles endpoint."""
    # Test with a valid file key
    response = client.post("/tools/get-styles", json={"fileKey": "esc-ape-styles"})
    assert response.status_code == 200
    styles = response.json()["styles"]
    assert len(styles) == 5
    assert styles[0]["name"] == "Primary"
    
    # Test with a partial file key
    response = client.post("/tools/get-styles", json={"fileKey": "styles"})
    assert response.status_code == 200
    styles = response.json()["styles"]
    assert len(styles) == 5
    
    # Test with an invalid file key
    response = client.post("/tools/get-styles", json={"fileKey": "invalid"})
    assert response.status_code == 404
