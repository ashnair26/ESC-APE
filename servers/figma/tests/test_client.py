#!/usr/bin/env python3
"""
Tests for the Figma client.
"""

import os
import json
import pytest
import asyncio
from unittest.mock import patch, MagicMock

from servers.figma.client import FigmaClient

@pytest.mark.asyncio
async def test_get_file():
    """Test the get_file method."""
    # Mock the aiohttp.ClientSession.post method
    with patch("aiohttp.ClientSession.post") as mock_post:
        # Set up the mock response
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "document": {"id": "0:0", "name": "Document"},
            "name": "ESC-APE Design System"
        }
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Create a client and call the method
        async with FigmaClient() as client:
            file_data = await client.get_file("esc-ape-design")
            
            # Check that the method was called with the correct arguments
            mock_post.assert_called_once_with(
                "http://localhost:8010/tools/get-file",
                json={"fileKey": "esc-ape-design"}
            )
            
            # Check that the method returned the correct value
            assert file_data["name"] == "ESC-APE Design System"
            assert file_data["document"]["id"] == "0:0"

@pytest.mark.asyncio
async def test_get_components():
    """Test the get_components method."""
    # Mock the aiohttp.ClientSession.post method
    with patch("aiohttp.ClientSession.post") as mock_post:
        # Set up the mock response
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "components": [
                {"id": "2:1", "name": "Button"},
                {"id": "2:2", "name": "Card"},
                {"id": "2:3", "name": "Input"}
            ]
        }
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Create a client and call the method
        async with FigmaClient() as client:
            components = await client.get_components("esc-ape-components")
            
            # Check that the method was called with the correct arguments
            mock_post.assert_called_once_with(
                "http://localhost:8010/tools/get-components",
                json={"fileKey": "esc-ape-components"}
            )
            
            # Check that the method returned the correct value
            assert len(components) == 3
            assert components[0]["name"] == "Button"
            assert components[1]["name"] == "Card"
            assert components[2]["name"] == "Input"

@pytest.mark.asyncio
async def test_get_styles():
    """Test the get_styles method."""
    # Mock the aiohttp.ClientSession.post method
    with patch("aiohttp.ClientSession.post") as mock_post:
        # Set up the mock response
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "styles": [
                {"id": "S:1", "name": "Primary"},
                {"id": "S:2", "name": "Secondary"},
                {"id": "S:3", "name": "Accent"}
            ]
        }
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Create a client and call the method
        async with FigmaClient() as client:
            styles = await client.get_styles("esc-ape-styles")
            
            # Check that the method was called with the correct arguments
            mock_post.assert_called_once_with(
                "http://localhost:8010/tools/get-styles",
                json={"fileKey": "esc-ape-styles"}
            )
            
            # Check that the method returned the correct value
            assert len(styles) == 3
            assert styles[0]["name"] == "Primary"
            assert styles[1]["name"] == "Secondary"
            assert styles[2]["name"] == "Accent"
