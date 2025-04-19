#!/usr/bin/env python3
"""
Tests for the Sanity CMS MCP server.
"""

import json
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

from mcp.server.fastmcp import Context
from servers.sanity.server import (
    sanity_query,
    sanity_get_document,
    sanity_create_document,
    sanity_update_document,
    sanity_delete_document,
    sanity_get_assets,
    sanity_get_schema
)
from servers.sanity.client import SanityClient


@pytest.fixture
def mock_context():
    """Create a mock MCP Context."""
    context = MagicMock(spec=Context)
    return context


@pytest.fixture
def mock_client():
    """Create a mock SanityClient."""
    client = MagicMock(spec=SanityClient)
    return client


class TestSanityMCPServer:
    """Tests for the Sanity MCP server tools."""
    
    @pytest.mark.asyncio
    async def test_sanity_query_success(self, mock_context, mock_client):
        """Test executing a GROQ query successfully."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.query method
            expected_data = {"result": [{"_id": "test-id", "title": "Test Document"}]}
            mock_client.query = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await sanity_query(
                ctx=mock_context,
                query="*[_type == 'test']"
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that query was called with the correct arguments
            mock_client.query.assert_called_once_with("*[_type == 'test']", None)
    
    @pytest.mark.asyncio
    async def test_sanity_query_with_params(self, mock_context, mock_client):
        """Test executing a GROQ query with parameters."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.query method
            expected_data = {"result": [{"_id": "test-id", "title": "Test Document"}]}
            mock_client.query = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await sanity_query(
                ctx=mock_context,
                query="*[_type == $type]",
                params='{"type": "test"}'
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that query was called with the correct arguments
            mock_client.query.assert_called_once_with("*[_type == $type]", {"type": "test"})
    
    @pytest.mark.asyncio
    async def test_sanity_query_invalid_params(self, mock_context, mock_client):
        """Test executing a GROQ query with invalid parameters."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Call the tool
            result = await sanity_query(
                ctx=mock_context,
                query="*[_type == $type]",
                params='invalid json'
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid params format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_sanity_query_error(self, mock_context, mock_client):
        """Test executing a GROQ query with an error."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.query method to raise an exception
            mock_client.query = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await sanity_query(
                ctx=mock_context,
                query="*[_type == 'test']"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_sanity_get_document_success(self, mock_context, mock_client):
        """Test getting a document successfully."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.get_document method
            expected_data = {"_id": "test-id", "title": "Test Document"}
            mock_client.get_document = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await sanity_get_document(
                ctx=mock_context,
                id="test-id"
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that get_document was called with the correct arguments
            mock_client.get_document.assert_called_once_with("test-id")
    
    @pytest.mark.asyncio
    async def test_sanity_get_document_error(self, mock_context, mock_client):
        """Test getting a document with an error."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.get_document method to raise an exception
            mock_client.get_document = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await sanity_get_document(
                ctx=mock_context,
                id="test-id"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_sanity_create_document_success(self, mock_context, mock_client):
        """Test creating a document successfully."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.create_document method
            expected_data = {"results": [{"id": "test-id", "document": {"_id": "test-id", "title": "Test Document"}}]}
            mock_client.create_document = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await sanity_create_document(
                ctx=mock_context,
                document='{"_type": "test", "title": "Test Document"}'
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that create_document was called with the correct arguments
            mock_client.create_document.assert_called_once_with({"_type": "test", "title": "Test Document"})
    
    @pytest.mark.asyncio
    async def test_sanity_create_document_invalid_document(self, mock_context, mock_client):
        """Test creating a document with invalid JSON."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Call the tool
            result = await sanity_create_document(
                ctx=mock_context,
                document='invalid json'
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid document format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_sanity_create_document_error(self, mock_context, mock_client):
        """Test creating a document with an error."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.create_document method to raise an exception
            mock_client.create_document = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await sanity_create_document(
                ctx=mock_context,
                document='{"_type": "test", "title": "Test Document"}'
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_sanity_update_document_success(self, mock_context, mock_client):
        """Test updating a document successfully."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.update_document method
            expected_data = {"results": [{"id": "test-id"}]}
            mock_client.update_document = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await sanity_update_document(
                ctx=mock_context,
                id="test-id",
                patch='{"title": "Updated Document"}'
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that update_document was called with the correct arguments
            mock_client.update_document.assert_called_once_with("test-id", {"title": "Updated Document"})
    
    @pytest.mark.asyncio
    async def test_sanity_update_document_invalid_patch(self, mock_context, mock_client):
        """Test updating a document with invalid JSON."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Call the tool
            result = await sanity_update_document(
                ctx=mock_context,
                id="test-id",
                patch='invalid json'
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid patch format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_sanity_update_document_error(self, mock_context, mock_client):
        """Test updating a document with an error."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.update_document method to raise an exception
            mock_client.update_document = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await sanity_update_document(
                ctx=mock_context,
                id="test-id",
                patch='{"title": "Updated Document"}'
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_sanity_delete_document_success(self, mock_context, mock_client):
        """Test deleting a document successfully."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.delete_document method
            expected_data = {"results": [{"id": "test-id"}]}
            mock_client.delete_document = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await sanity_delete_document(
                ctx=mock_context,
                id="test-id"
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that delete_document was called with the correct arguments
            mock_client.delete_document.assert_called_once_with("test-id")
    
    @pytest.mark.asyncio
    async def test_sanity_delete_document_error(self, mock_context, mock_client):
        """Test deleting a document with an error."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.delete_document method to raise an exception
            mock_client.delete_document = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await sanity_delete_document(
                ctx=mock_context,
                id="test-id"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_sanity_get_assets_success(self, mock_context, mock_client):
        """Test getting assets successfully."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.get_assets method
            expected_data = {"result": [{"_id": "image-1", "url": "https://cdn.sanity.io/images/test-project/test-dataset/image-1.jpg"}]}
            mock_client.get_assets = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await sanity_get_assets(
                ctx=mock_context,
                type="image",
                limit=10,
                offset=0
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that get_assets was called with the correct arguments
            mock_client.get_assets.assert_called_once_with("image", 10, 0)
    
    @pytest.mark.asyncio
    async def test_sanity_get_assets_error(self, mock_context, mock_client):
        """Test getting assets with an error."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.get_assets method to raise an exception
            mock_client.get_assets = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await sanity_get_assets(
                ctx=mock_context
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_sanity_get_schema_success(self, mock_context, mock_client):
        """Test getting the schema successfully."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.get_schema method
            expected_data = {"types": [{"name": "test", "type": "document"}]}
            mock_client.get_schema = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await sanity_get_schema(
                ctx=mock_context
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that get_schema was called with the correct arguments
            mock_client.get_schema.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_sanity_get_schema_error(self, mock_context, mock_client):
        """Test getting the schema with an error."""
        # Mock the get_sanity_client function
        with patch("servers.sanity.server.get_sanity_client", return_value=mock_client):
            # Mock the client.get_schema method to raise an exception
            mock_client.get_schema = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await sanity_get_schema(
                ctx=mock_context
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
