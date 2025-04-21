#!/usr/bin/env python3
"""
Tests for the Context7 MCP server.
"""

import os
import json
import pytest
import asyncio
from fastapi.testclient import TestClient

from servers.context7.server import app

client = TestClient(app)

def test_root():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Context7 MCP Server"}

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
    assert len(tools) == 2
    assert tools[0]["name"] == "resolve-library-id"
    assert tools[1]["name"] == "get-library-docs"

def test_resolve_library_id():
    """Test the resolve-library-id endpoint."""
    # Test with React
    response = client.post("/tools/resolve-library-id", json={"libraryName": "react"})
    assert response.status_code == 200
    assert response.json() == {"libraryId": "react@18.2.0"}
    
    # Test with Next.js
    response = client.post("/tools/resolve-library-id", json={"libraryName": "next.js"})
    assert response.status_code == 200
    assert response.json() == {"libraryId": "next@14.0.0"}
    
    # Test with Tailwind CSS
    response = client.post("/tools/resolve-library-id", json={"libraryName": "tailwindcss"})
    assert response.status_code == 200
    assert response.json() == {"libraryId": "tailwindcss@3.3.0"}
    
    # Test with unknown library (should default to React)
    response = client.post("/tools/resolve-library-id", json={"libraryName": "unknown"})
    assert response.status_code == 200
    assert response.json() == {"libraryId": "react@18.2.0"}

def test_get_library_docs():
    """Test the get-library-docs endpoint."""
    # Test with React
    response = client.post("/tools/get-library-docs", json={"context7CompatibleLibraryID": "react@18.2.0"})
    assert response.status_code == 200
    assert "React Documentation" in response.json()["documentation"]
    
    # Test with Next.js
    response = client.post("/tools/get-library-docs", json={"context7CompatibleLibraryID": "next@14.0.0"})
    assert response.status_code == 200
    assert "Next.js Documentation" in response.json()["documentation"]
    
    # Test with Tailwind CSS
    response = client.post("/tools/get-library-docs", json={"context7CompatibleLibraryID": "tailwindcss@3.3.0"})
    assert response.status_code == 200
    assert "Tailwind CSS Documentation" in response.json()["documentation"]
    
    # Test with topic filtering
    response = client.post("/tools/get-library-docs", json={
        "context7CompatibleLibraryID": "react@18.2.0",
        "topic": "hooks"
    })
    assert response.status_code == 200
    assert "useState" in response.json()["documentation"]
    
    # Test with unknown library
    response = client.post("/tools/get-library-docs", json={"context7CompatibleLibraryID": "unknown"})
    assert response.status_code == 404
