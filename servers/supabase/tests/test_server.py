#!/usr/bin/env python3
"""
Tests for the Supabase MCP server.
"""

import json
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

from mcp.server.fastmcp import Context
from servers.supabase.server import (
    supabase_read,
    supabase_create,
    supabase_update,
    supabase_delete,
    supabase_rpc
)
from servers.supabase.client import SupabaseClient


@pytest.fixture
def mock_context():
    """Create a mock MCP Context."""
    context = MagicMock(spec=Context)
    return context


@pytest.fixture
def mock_client():
    """Create a mock SupabaseClient."""
    client = MagicMock(spec=SupabaseClient)
    return client


class TestSupabaseMCPServer:
    """Tests for the Supabase MCP server tools."""
    
    @pytest.mark.asyncio
    async def test_supabase_read_success(self, mock_context, mock_client):
        """Test reading rows successfully."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Mock the client.read_rows method
            expected_data = [{"id": 1, "name": "Test"}]
            mock_client.read_rows = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await supabase_read(
                ctx=mock_context,
                table="test_table",
                select="id,name",
                filters='{"name": "eq.Test"}',
                order="id.asc",
                limit=10,
                offset=0
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that read_rows was called with the correct arguments
            mock_client.read_rows.assert_called_once_with(
                table="test_table",
                select="id,name",
                filters={"name": "eq.Test"},
                order="id.asc",
                limit=10,
                offset=0
            )
    
    @pytest.mark.asyncio
    async def test_supabase_read_invalid_filters(self, mock_context, mock_client):
        """Test reading rows with invalid filters."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Call the tool
            result = await supabase_read(
                ctx=mock_context,
                table="test_table",
                filters='invalid json'
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid filters format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_supabase_read_error(self, mock_context, mock_client):
        """Test reading rows with an error."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Mock the client.read_rows method to raise an exception
            mock_client.read_rows = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await supabase_read(
                ctx=mock_context,
                table="test_table"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_supabase_create_success(self, mock_context, mock_client):
        """Test creating records successfully."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Mock the client.create_records method
            expected_data = [{"id": 1, "name": "Test"}]
            mock_client.create_records = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await supabase_create(
                ctx=mock_context,
                table="test_table",
                records='{"name": "Test"}'
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that create_records was called with the correct arguments
            mock_client.create_records.assert_called_once_with(
                "test_table",
                {"name": "Test"}
            )
    
    @pytest.mark.asyncio
    async def test_supabase_create_invalid_records(self, mock_context, mock_client):
        """Test creating records with invalid JSON."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Call the tool
            result = await supabase_create(
                ctx=mock_context,
                table="test_table",
                records='invalid json'
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid records format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_supabase_create_error(self, mock_context, mock_client):
        """Test creating records with an error."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Mock the client.create_records method to raise an exception
            mock_client.create_records = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await supabase_create(
                ctx=mock_context,
                table="test_table",
                records='{"name": "Test"}'
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_supabase_update_success(self, mock_context, mock_client):
        """Test updating records successfully."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Mock the client.update_records method
            expected_data = [{"id": 1, "name": "Updated"}]
            mock_client.update_records = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await supabase_update(
                ctx=mock_context,
                table="test_table",
                records='{"id": 1, "name": "Updated"}',
                match_column="id"
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that update_records was called with the correct arguments
            mock_client.update_records.assert_called_once_with(
                "test_table",
                {"id": 1, "name": "Updated"},
                "id"
            )
    
    @pytest.mark.asyncio
    async def test_supabase_update_invalid_records(self, mock_context, mock_client):
        """Test updating records with invalid JSON."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Call the tool
            result = await supabase_update(
                ctx=mock_context,
                table="test_table",
                records='invalid json',
                match_column="id"
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid records format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_supabase_update_error(self, mock_context, mock_client):
        """Test updating records with an error."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Mock the client.update_records method to raise an exception
            mock_client.update_records = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await supabase_update(
                ctx=mock_context,
                table="test_table",
                records='{"id": 1, "name": "Updated"}',
                match_column="id"
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_supabase_delete_success(self, mock_context, mock_client):
        """Test deleting records successfully."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Mock the client.delete_records method
            expected_data = {"count": 1}
            mock_client.delete_records = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await supabase_delete(
                ctx=mock_context,
                table="test_table",
                filters='{"id": 1}'
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that delete_records was called with the correct arguments
            mock_client.delete_records.assert_called_once_with(
                "test_table",
                {"id": 1}
            )
    
    @pytest.mark.asyncio
    async def test_supabase_delete_invalid_filters(self, mock_context, mock_client):
        """Test deleting records with invalid filters."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Call the tool
            result = await supabase_delete(
                ctx=mock_context,
                table="test_table",
                filters='invalid json'
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid filters format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_supabase_delete_error(self, mock_context, mock_client):
        """Test deleting records with an error."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Mock the client.delete_records method to raise an exception
            mock_client.delete_records = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await supabase_delete(
                ctx=mock_context,
                table="test_table",
                filters='{"id": 1}'
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_supabase_rpc_success(self, mock_context, mock_client):
        """Test executing an RPC function successfully."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Mock the client.execute_rpc method
            expected_data = {"result": "success"}
            mock_client.execute_rpc = AsyncMock(return_value=expected_data)
            
            # Call the tool
            result = await supabase_rpc(
                ctx=mock_context,
                function_name="test_function",
                params='{"param1": "value1"}'
            )
            
            # Check the result
            assert json.loads(result) == expected_data
            
            # Check that execute_rpc was called with the correct arguments
            mock_client.execute_rpc.assert_called_once_with(
                "test_function",
                {"param1": "value1"}
            )
    
    @pytest.mark.asyncio
    async def test_supabase_rpc_invalid_params(self, mock_context, mock_client):
        """Test executing an RPC function with invalid params."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Call the tool
            result = await supabase_rpc(
                ctx=mock_context,
                function_name="test_function",
                params='invalid json'
            )
            
            # Check the result
            assert json.loads(result) == {"error": "Invalid params format"}
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_supabase_rpc_error(self, mock_context, mock_client):
        """Test executing an RPC function with an error."""
        # Mock the get_supabase_client function
        with patch("servers.supabase.server.get_supabase_client", return_value=mock_client):
            # Mock the client.execute_rpc method to raise an exception
            mock_client.execute_rpc = AsyncMock(side_effect=Exception("Test error"))
            
            # Call the tool
            result = await supabase_rpc(
                ctx=mock_context,
                function_name="test_function",
                params='{"param1": "value1"}'
            )
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
