#!/usr/bin/env python3
"""
Tests for the Sanity CMS client.
"""

import json
import pytest
from unittest.mock import patch, AsyncMock

from core.testing import temp_env_vars, MockResponse, mock_async_response
from servers.sanity.client import SanityClient, get_sanity_client


class TestSanityClient:
    """Tests for the SanityClient class."""
    
    def test_from_env(self):
        """Test creating a client from environment variables."""
        with temp_env_vars(
            SANITY_PROJECT_ID="test-project",
            SANITY_DATASET="test-dataset",
            SANITY_API_VERSION="v2021-10-21",
            SANITY_API_TOKEN="test-token",
            SANITY_USE_CDN="false"
        ):
            client = SanityClient.from_env()
            assert client.project_id == "test-project"
            assert client.dataset == "test-dataset"
            assert client.api_version == "v2021-10-21"
            assert client.token == "test-token"
            assert client.use_cdn is False
    
    def test_from_env_defaults(self):
        """Test creating a client with default environment variables."""
        with temp_env_vars(
            SANITY_PROJECT_ID="test-project"
        ):
            client = SanityClient.from_env()
            assert client.project_id == "test-project"
            assert client.dataset == "production"
            assert client.api_version == "v2021-10-21"
            assert client.token is None
            assert client.use_cdn is True
    
    def test_from_env_missing_vars(self):
        """Test creating a client with missing environment variables."""
        with temp_env_vars():
            with pytest.raises(ValueError):
                SanityClient.from_env()
    
    def test_get_base_url_cdn(self):
        """Test getting the base URL with CDN."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=True
        )
        
        assert client._get_base_url() == "https://test-project.apicdn.sanity.io/v2021-10-21"
    
    def test_get_base_url_no_cdn(self):
        """Test getting the base URL without CDN."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=False
        )
        
        assert client._get_base_url() == "https://test-project.api.sanity.io/v2021-10-21"
    
    def test_get_base_url_with_token(self):
        """Test getting the base URL with a token."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token="test-token",
            use_cdn=True
        )
        
        assert client._get_base_url() == "https://test-project.api.sanity.io/v2021-10-21"
    
    @pytest.mark.asyncio
    async def test_request_success(self):
        """Test a successful request."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=True
        )
        
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
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=True
        )
        
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
            assert "Sanity API error: 400 - Bad Request" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_query(self):
        """Test executing a GROQ query."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=True
        )
        
        # Mock the _request method
        expected_data = {"result": [{"_id": "test-id", "title": "Test Document"}]}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.query("*[_type == 'test']")
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="GET",
            path="/data/query/test-dataset",
            params={"query": "*[_type == 'test']"}
        )
    
    @pytest.mark.asyncio
    async def test_query_with_params(self):
        """Test executing a GROQ query with parameters."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=True
        )
        
        # Mock the _request method
        expected_data = {"result": [{"_id": "test-id", "title": "Test Document"}]}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.query("*[_type == $type]", {"type": "test"})
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="GET",
            path="/data/query/test-dataset",
            params={"query": "*[_type == $type]", "$type": '"test"'}
        )
    
    @pytest.mark.asyncio
    async def test_get_document(self):
        """Test getting a document by ID."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=True
        )
        
        # Mock the query method
        expected_data = {"result": {"_id": "test-id", "title": "Test Document"}}
        client.query = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.get_document("test-id")
        
        # Check the result
        assert result == expected_data["result"]
        
        # Check that query was called with the correct arguments
        client.query.assert_called_once_with("*[_id == $id][0]", {"id": "test-id"})
    
    @pytest.mark.asyncio
    async def test_create_document(self):
        """Test creating a document."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token="test-token",
            use_cdn=True
        )
        
        # Mock the _request method
        expected_data = {"results": [{"id": "test-id", "document": {"_id": "test-id", "title": "Test Document"}}]}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        document = {"_type": "test", "title": "Test Document"}
        result = await client.create_document(document)
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="POST",
            path="/data/mutate/test-dataset",
            json_data={"mutations": [{"create": document}]}
        )
    
    @pytest.mark.asyncio
    async def test_create_document_no_token(self):
        """Test creating a document without a token."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=True
        )
        
        # Call the method
        document = {"_type": "test", "title": "Test Document"}
        with pytest.raises(Exception) as excinfo:
            await client.create_document(document)
        
        # Check the error message
        assert "API token is required for mutations" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_update_document(self):
        """Test updating a document."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token="test-token",
            use_cdn=True
        )
        
        # Mock the _request method
        expected_data = {"results": [{"id": "test-id"}]}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        patch = {"title": "Updated Document"}
        result = await client.update_document("test-id", patch)
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="POST",
            path="/data/mutate/test-dataset",
            json_data={"mutations": [{"patch": {"id": "test-id", "set": patch}}]}
        )
    
    @pytest.mark.asyncio
    async def test_update_document_no_token(self):
        """Test updating a document without a token."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=True
        )
        
        # Call the method
        patch = {"title": "Updated Document"}
        with pytest.raises(Exception) as excinfo:
            await client.update_document("test-id", patch)
        
        # Check the error message
        assert "API token is required for mutations" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_delete_document(self):
        """Test deleting a document."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token="test-token",
            use_cdn=True
        )
        
        # Mock the _request method
        expected_data = {"results": [{"id": "test-id"}]}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.delete_document("test-id")
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="POST",
            path="/data/mutate/test-dataset",
            json_data={"mutations": [{"delete": {"id": "test-id"}}]}
        )
    
    @pytest.mark.asyncio
    async def test_delete_document_no_token(self):
        """Test deleting a document without a token."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=True
        )
        
        # Call the method
        with pytest.raises(Exception) as excinfo:
            await client.delete_document("test-id")
        
        # Check the error message
        assert "API token is required for mutations" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_get_assets(self):
        """Test getting assets."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=True
        )
        
        # Mock the query method
        expected_data = {"result": [{"_id": "image-1", "url": "https://cdn.sanity.io/images/test-project/test-dataset/image-1.jpg"}]}
        client.query = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.get_assets(type="image", limit=10, offset=0)
        
        # Check the result
        assert result == expected_data
        
        # Check that query was called with the correct arguments
        client.query.assert_called_once_with("*[_type == 'sanity.imageAsset'][0...10]")
    
    @pytest.mark.asyncio
    async def test_get_schema(self):
        """Test getting the schema."""
        client = SanityClient(
            project_id="test-project",
            dataset="test-dataset",
            api_version="v2021-10-21",
            token=None,
            use_cdn=True
        )
        
        # Mock the _request method
        expected_data = {"types": [{"name": "test", "type": "document"}]}
        client._request = AsyncMock(return_value=expected_data)
        
        # Call the method
        result = await client.get_schema()
        
        # Check the result
        assert result == expected_data
        
        # Check that _request was called with the correct arguments
        client._request.assert_called_once_with(
            method="GET",
            path="/metadata/schema/test-dataset"
        )


def test_get_sanity_client():
    """Test getting a Sanity client."""
    with temp_env_vars(
        SANITY_PROJECT_ID="test-project",
        SANITY_DATASET="test-dataset",
        SANITY_API_VERSION="v2021-10-21",
        SANITY_API_TOKEN="test-token",
        SANITY_USE_CDN="false"
    ):
        client = get_sanity_client()
        assert isinstance(client, SanityClient)
        assert client.project_id == "test-project"
        assert client.dataset == "test-dataset"
        assert client.api_version == "v2021-10-21"
        assert client.token == "test-token"
        assert client.use_cdn is False


def test_get_sanity_client_missing_vars():
    """Test getting a Sanity client with missing environment variables."""
    with temp_env_vars():
        with pytest.raises(ValueError):
            get_sanity_client()
