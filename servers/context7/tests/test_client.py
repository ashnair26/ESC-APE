#!/usr/bin/env python3
"""
Tests for the Context7 client.
"""

import os
import json
import pytest
import asyncio
from unittest.mock import patch, MagicMock

from servers.context7.client import Context7Client

@pytest.mark.asyncio
async def test_resolve_library_id():
    """Test the resolve_library_id method."""
    # Mock the aiohttp.ClientSession.post method
    with patch("aiohttp.ClientSession.post") as mock_post:
        # Set up the mock response
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.json.return_value = {"libraryId": "react@18.2.0"}
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Create a client and call the method
        async with Context7Client() as client:
            library_id = await client.resolve_library_id("react")
            
            # Check that the method was called with the correct arguments
            mock_post.assert_called_once_with(
                "http://localhost:8009/tools/resolve-library-id",
                json={"libraryName": "react"}
            )
            
            # Check that the method returned the correct value
            assert library_id == "react@18.2.0"

@pytest.mark.asyncio
async def test_get_library_docs():
    """Test the get_library_docs method."""
    # Mock the aiohttp.ClientSession.post method
    with patch("aiohttp.ClientSession.post") as mock_post:
        # Set up the mock response
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.json.return_value = {"documentation": "# React Documentation"}
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Create a client and call the method
        async with Context7Client() as client:
            docs = await client.get_library_docs("react@18.2.0", "hooks", 1000)
            
            # Check that the method was called with the correct arguments
            mock_post.assert_called_once_with(
                "http://localhost:8009/tools/get-library-docs",
                json={
                    "context7CompatibleLibraryID": "react@18.2.0",
                    "topic": "hooks",
                    "tokens": 1000
                }
            )
            
            # Check that the method returned the correct value
            assert docs == "# React Documentation"
