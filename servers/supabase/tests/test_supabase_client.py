#!/usr/bin/env python3
"""
Tests for the Supabase client.
"""

import json
import pytest
from unittest.mock import patch, AsyncMock

from core.testing import temp_env_vars, MockResponse, mock_async_response
from servers.supabase.client import SupabaseClient, get_supabase_client


class TestSupabaseClient:
    """Tests for the SupabaseClient class."""
    
    def test_from_env(self):
        """Test creating a client from environment variables."""
        with temp_env_vars(
            SUPABASE_URL="https://test.supabase.co",
            SUPABASE_SERVICE_ROLE_KEY="test-key"
        ):
            client = SupabaseClient.from_env()
            assert client.url == "https://test.supabase.co"
            assert client.key == "test-key"
    
    def test_from_env_missing_vars(self):
        """Test creating a client with missing environment variables."""
        with temp_env_vars():
            with pytest.raises(ValueError):
                SupabaseClient.from_env()
    
    @pytest.mark.asyncio
    async def test_read_rows(self):
        """Test reading rows from a table."""
        client = SupabaseClient(url="https://test.supabase.co", key="test-key")
        
        # Mock the _request method
        expected_data = [{"id": 1, "name": "Test"}]
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.read_rows(
            table="test_table",
            select="id,name",
            filters={"name": "eq.Test"},
            order="id.asc",
            limit=10,
            offset=0
        )
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            "GET",
            "/rest/v1/test_table",
            params={
                "select": "id,name",
                "name": "eq.Test",
                "order": "id.asc",
                "limit": "10",
                "offset": "0"
            }
        )
    
    @pytest.mark.asyncio
    async def test_create_records_single(self):
        """Test creating a single record."""
        client = SupabaseClient(url="https://test.supabase.co", key="test-key")
        
        # Mock the _request method
        expected_data = [{"id": 1, "name": "Test"}]
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.create_records(
            table="test_table",
            records={"name": "Test"}
        )
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            "POST",
            "/rest/v1/test_table",
            json_data=[{"name": "Test"}]
        )
    
    @pytest.mark.asyncio
    async def test_create_records_multiple(self):
        """Test creating multiple records."""
        client = SupabaseClient(url="https://test.supabase.co", key="test-key")
        
        # Mock the _request method
        expected_data = [{"id": 1, "name": "Test1"}, {"id": 2, "name": "Test2"}]
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.create_records(
            table="test_table",
            records=[{"name": "Test1"}, {"name": "Test2"}]
        )
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            "POST",
            "/rest/v1/test_table",
            json_data=[{"name": "Test1"}, {"name": "Test2"}]
        )
    
    @pytest.mark.asyncio
    async def test_update_records(self):
        """Test updating records."""
        client = SupabaseClient(url="https://test.supabase.co", key="test-key")
        
        # Mock the _request method
        expected_data = [{"id": 1, "name": "Updated"}]
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.update_records(
            table="test_table",
            records={"id": 1, "name": "Updated"},
            match_column="id"
        )
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            "PATCH",
            "/rest/v1/test_table?id=eq.1",
            json_data={"name": "Updated"}
        )
    
    @pytest.mark.asyncio
    async def test_update_records_missing_match_column(self):
        """Test updating records with a missing match column."""
        client = SupabaseClient(url="https://test.supabase.co", key="test-key")
        
        # Call the method
        with pytest.raises(ValueError):
            await client.update_records(
                table="test_table",
                records={"name": "Updated"},
                match_column="id"
            )
    
    @pytest.mark.asyncio
    async def test_delete_records(self):
        """Test deleting records."""
        client = SupabaseClient(url="https://test.supabase.co", key="test-key")
        
        # Mock the _request method
        expected_data = {"count": 1}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.delete_records(
            table="test_table",
            filters={"id": 1}
        )
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            "DELETE",
            "/rest/v1/test_table?id=eq.1"
        )
    
    @pytest.mark.asyncio
    async def test_execute_rpc(self):
        """Test executing an RPC function."""
        client = SupabaseClient(url="https://test.supabase.co", key="test-key")
        
        # Mock the _request method
        expected_data = {"result": "success"}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.execute_rpc(
            function_name="test_function",
            params={"param1": "value1"}
        )
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            "POST",
            "/rest/v1/rpc/test_function",
            json_data={"param1": "value1"}
        )
    
    @pytest.mark.asyncio
    async def test_request_success(self):
        """Test a successful request."""
        client = SupabaseClient(url="https://test.supabase.co", key="test-key")
        
        # Mock the httpx.AsyncClient.request method
        expected_data = {"result": "success"}
        mock_response = MockResponse(
            status_code=200,
            json_data=expected_data
        )
        
        with patch("httpx.AsyncClient.request", AsyncMock(return_value=mock_response)):
            # Call the method
            result = await client._request(
                method="GET",
                path="/test"
            )
            
            # Check the result
            assert result == expected_data
    
    @pytest.mark.asyncio
    async def test_request_error(self):
        """Test a request that returns an error."""
        client = SupabaseClient(url="https://test.supabase.co", key="test-key")
        
        # Mock the httpx.AsyncClient.request method
        mock_response = MockResponse(
            status_code=400,
            text="Bad Request"
        )
        
        with patch("httpx.AsyncClient.request", AsyncMock(return_value=mock_response)):
            # Call the method
            with pytest.raises(Exception) as excinfo:
                await client._request(
                    method="GET",
                    path="/test"
                )
            
            # Check the error message
            assert "Supabase API error: 400 - Bad Request" in str(excinfo.value)


def test_get_supabase_client():
    """Test getting a Supabase client."""
    with temp_env_vars(
        SUPABASE_URL="https://test.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="test-key"
    ):
        client = get_supabase_client()
        assert isinstance(client, SupabaseClient)
        assert client.url == "https://test.supabase.co"
        assert client.key == "test-key"


def test_get_supabase_client_missing_vars():
    """Test getting a Supabase client with missing environment variables."""
    with temp_env_vars():
        with pytest.raises(ValueError):
            get_supabase_client()
