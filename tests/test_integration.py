#!/usr/bin/env python3
"""
Integration tests for the ESCAPE Creator Engine.
"""

import pytest
import asyncio
import json
from unittest.mock import patch, AsyncMock

from mcp import ClientSession, StdioServerParameters
from core.testing import temp_env_vars, MockResponse, mock_async_response


@pytest.mark.integration
class TestSupabaseIntegration:
    """Integration tests for the Supabase MCP server."""

    @pytest.mark.asyncio
    async def test_supabase_server_initialization(self):
        """Test that the Supabase MCP server initializes correctly."""
        # Mock the stdio_client to avoid actually starting the server
        mock_read = AsyncMock()
        mock_write = AsyncMock()

        # Mock the ClientSession.initialize method
        with patch("mcp.client.stdio.stdio_client", AsyncMock(return_value=(mock_read, mock_write))), \
             patch.object(ClientSession, "initialize", AsyncMock()), \
             patch.object(ClientSession, "list_tools", AsyncMock(return_value=[
                 {"name": "supabase_read"},
                 {"name": "supabase_create"},
                 {"name": "supabase_update"},
                 {"name": "supabase_delete"},
                 {"name": "supabase_rpc"}
             ])):

            # Create server parameters for stdio connection
            server_params = StdioServerParameters(
                command="python",
                args=["-m", "servers.supabase.server"],
                env=None,
            )

            async with ClientSession(mock_read, mock_write) as session:
                # Initialize the connection
                await session.initialize()

                # List available tools
                tools = await session.list_tools()

                # Check that the expected tools are available
                tool_names = [tool["name"] for tool in tools]
                assert "supabase_read" in tool_names
                assert "supabase_create" in tool_names
                assert "supabase_update" in tool_names
                assert "supabase_delete" in tool_names
                assert "supabase_rpc" in tool_names


@pytest.mark.integration
class TestGitIntegration:
    """Integration tests for the Git MCP server."""

    @pytest.mark.asyncio
    async def test_git_server_initialization(self):
        """Test that the Git MCP server initializes correctly."""
        # Mock the stdio_client to avoid actually starting the server
        mock_read = AsyncMock()
        mock_write = AsyncMock()

        # Mock the ClientSession.initialize method
        with patch("mcp.client.stdio.stdio_client", AsyncMock(return_value=(mock_read, mock_write))), \
             patch.object(ClientSession, "initialize", AsyncMock()), \
             patch.object(ClientSession, "list_tools", AsyncMock(return_value=[
                 {"name": "git_status_tool"},
                 {"name": "git_add_tool"},
                 {"name": "git_commit_tool"},
                 {"name": "git_log_tool"},
                 {"name": "git_diff_tool"},
                 {"name": "git_branch_tool"},
                 {"name": "git_push_tool"},
                 {"name": "git_init_tool"},
                 {"name": "git_config_tool"},
                 {"name": "git_clone_tool"},
                 {"name": "git_pull_tool"}
             ])):

            # Create server parameters for stdio connection
            server_params = StdioServerParameters(
                command="python",
                args=["-m", "servers.git.server"],
                env=None,
            )

            async with ClientSession(mock_read, mock_write) as session:
                # Initialize the connection
                await session.initialize()

                # List available tools
                tools = await session.list_tools()

                # Check that the expected tools are available
                tool_names = [tool["name"] for tool in tools]
                assert "git_status_tool" in tool_names
                assert "git_add_tool" in tool_names
                assert "git_commit_tool" in tool_names
                assert "git_log_tool" in tool_names
                assert "git_diff_tool" in tool_names
                assert "git_branch_tool" in tool_names
                assert "git_push_tool" in tool_names
                assert "git_init_tool" in tool_names
                assert "git_config_tool" in tool_names
                assert "git_clone_tool" in tool_names
                assert "git_pull_tool" in tool_names


@pytest.mark.integration
class TestSanityIntegration:
    """Integration tests for the Sanity CMS MCP server."""

    @pytest.mark.asyncio
    async def test_sanity_server_initialization(self):
        """Test that the Sanity CMS MCP server initializes correctly."""
        # Mock the stdio_client to avoid actually starting the server
        mock_read = AsyncMock()
        mock_write = AsyncMock()

        # Mock the ClientSession.initialize method
        with patch("mcp.client.stdio.stdio_client", AsyncMock(return_value=(mock_read, mock_write))), \
             patch.object(ClientSession, "initialize", AsyncMock()), \
             patch.object(ClientSession, "list_tools", AsyncMock(return_value=[
                 {"name": "sanity_query"},
                 {"name": "sanity_get_document"},
                 {"name": "sanity_create_document"},
                 {"name": "sanity_update_document"},
                 {"name": "sanity_delete_document"},
                 {"name": "sanity_get_assets"},
                 {"name": "sanity_get_schema"}
             ])):

            # Create server parameters for stdio connection
            server_params = StdioServerParameters(
                command="python",
                args=["-m", "servers.sanity.server"],
                env=None,
            )

            async with ClientSession(mock_read, mock_write) as session:
                # Initialize the connection
                await session.initialize()

                # List available tools
                tools = await session.list_tools()

                # Check that the expected tools are available
                tool_names = [tool["name"] for tool in tools]
                assert "sanity_query" in tool_names
                assert "sanity_get_document" in tool_names
                assert "sanity_create_document" in tool_names
                assert "sanity_update_document" in tool_names
                assert "sanity_delete_document" in tool_names
                assert "sanity_get_assets" in tool_names
                assert "sanity_get_schema" in tool_names


@pytest.mark.integration
class TestPrivyIntegration:
    """Integration tests for the Privy authentication MCP server."""

    @pytest.mark.asyncio
    async def test_privy_server_initialization(self):
        """Test that the Privy authentication MCP server initializes correctly."""
        # Mock the stdio_client to avoid actually starting the server
        mock_read = AsyncMock()
        mock_write = AsyncMock()

        # Mock the ClientSession.initialize method
        with patch("mcp.client.stdio.stdio_client", AsyncMock(return_value=(mock_read, mock_write))), \
             patch.object(ClientSession, "initialize", AsyncMock()), \
             patch.object(ClientSession, "list_tools", AsyncMock(return_value=[
                 {"name": "privy_verify_token"},
                 {"name": "privy_get_user"},
                 {"name": "privy_list_users"},
                 {"name": "privy_create_user"},
                 {"name": "privy_update_user"},
                 {"name": "privy_delete_user"},
                 {"name": "privy_create_auth_token"},
                 {"name": "privy_revoke_auth_token"}
             ])):

            # Create server parameters for stdio connection
            server_params = StdioServerParameters(
                command="python",
                args=["-m", "servers.privy.server"],
                env=None,
            )

            async with ClientSession(mock_read, mock_write) as session:
                # Initialize the connection
                await session.initialize()

                # List available tools
                tools = await session.list_tools()

                # Check that the expected tools are available
                tool_names = [tool["name"] for tool in tools]
                assert "privy_verify_token" in tool_names
                assert "privy_get_user" in tool_names
                assert "privy_list_users" in tool_names
                assert "privy_create_user" in tool_names
                assert "privy_update_user" in tool_names
                assert "privy_delete_user" in tool_names
                assert "privy_create_auth_token" in tool_names
                assert "privy_revoke_auth_token" in tool_names


@pytest.mark.integration
class TestBaseIntegration:
    """Integration tests for the BASE blockchain MCP server."""

    @pytest.mark.asyncio
    async def test_base_server_initialization(self):
        """Test that the BASE blockchain MCP server initializes correctly."""
        # Mock the stdio_client to avoid actually starting the server
        mock_read = AsyncMock()
        mock_write = AsyncMock()

        # Mock the ClientSession.initialize method
        with patch("mcp.client.stdio.stdio_client", AsyncMock(return_value=(mock_read, mock_write))), \
             patch.object(ClientSession, "initialize", AsyncMock()), \
             patch.object(ClientSession, "list_tools", AsyncMock(return_value=[
                 {"name": "base_get_balance"},
                 {"name": "base_get_transaction"},
                 {"name": "base_get_block"},
                 {"name": "base_call_contract_function"},
                 {"name": "base_send_transaction"},
                 {"name": "base_send_contract_transaction"},
                 {"name": "base_get_gas_price"},
                 {"name": "base_is_contract"},
                 {"name": "base_get_logs"}
             ])):

            # Create server parameters for stdio connection
            server_params = StdioServerParameters(
                command="python",
                args=["-m", "servers.base.server"],
                env=None,
            )

            async with ClientSession(mock_read, mock_write) as session:
                # Initialize the connection
                await session.initialize()

                # List available tools
                tools = await session.list_tools()

                # Check that the expected tools are available
                tool_names = [tool["name"] for tool in tools]
                assert "base_get_balance" in tool_names
                assert "base_get_transaction" in tool_names
                assert "base_get_block" in tool_names
                assert "base_call_contract_function" in tool_names
                assert "base_send_transaction" in tool_names
                assert "base_send_contract_transaction" in tool_names
                assert "base_get_gas_price" in tool_names
                assert "base_is_contract" in tool_names
                assert "base_get_logs" in tool_names


@pytest.mark.integration
class TestUnifiedIntegration:
    """Integration tests for the unified MCP server."""

    @pytest.mark.asyncio
    async def test_unified_server_initialization(self):
        """Test that the unified MCP server initializes correctly."""
        # Mock the stdio_client to avoid actually starting the server
        mock_read = AsyncMock()
        mock_write = AsyncMock()

        # Create a list of all expected tools from all servers
        expected_tools = [
            # Supabase tools
            {"name": "supabase_list_tables"},
            {"name": "supabase_execute_query"},

            # Git tools
            {"name": "git_status_tool"},
            {"name": "git_add_tool"},
            {"name": "git_commit_tool"},
            {"name": "git_log_tool"},
            {"name": "git_diff_tool"},
            {"name": "git_branch_tool"},
            {"name": "git_push_tool"},
            {"name": "git_init_tool"},
            {"name": "git_config_tool"},
            {"name": "git_clone_tool"},
            {"name": "git_pull_tool"},

            # Sanity tools
            {"name": "sanity_query"},
            {"name": "sanity_get_document"},
            {"name": "sanity_create_document"},
            {"name": "sanity_update_document"},
            {"name": "sanity_delete_document"},
            {"name": "sanity_get_assets"},
            {"name": "sanity_get_schema"},

            # Privy tools
            {"name": "privy_verify_token"},
            {"name": "privy_get_user"},
            {"name": "privy_list_users"},
            {"name": "privy_create_user"},
            {"name": "privy_update_user"},
            {"name": "privy_delete_user"},
            {"name": "privy_create_auth_token"},
            {"name": "privy_revoke_auth_token"},

            # BASE tools
            {"name": "base_get_balance"},
            {"name": "base_get_transaction"},
            {"name": "base_get_block"},
            {"name": "base_call_contract_function"},
            {"name": "base_send_transaction"},
            {"name": "base_send_contract_transaction"},
            {"name": "base_get_gas_price"},
            {"name": "base_is_contract"},
            {"name": "base_get_logs"}
        ]

        # Mock the ClientSession.initialize method
        with patch("mcp.client.stdio.stdio_client", AsyncMock(return_value=(mock_read, mock_write))), \
             patch.object(ClientSession, "initialize", AsyncMock()), \
             patch.object(ClientSession, "list_tools", AsyncMock(return_value=expected_tools)):

            # Create server parameters for stdio connection
            server_params = StdioServerParameters(
                command="python",
                args=["-m", "servers.unified.server"],
                env=None,
            )

            async with ClientSession(mock_read, mock_write) as session:
                # Initialize the connection
                await session.initialize()

                # List available tools
                tools = await session.list_tools()

                # Check that all the expected tools are available
                tool_names = [tool["name"] for tool in tools]

                # Check for Supabase tools
                assert "supabase_list_tables" in tool_names
                assert "supabase_execute_query" in tool_names

                # Check for Git tools
                assert "git_status_tool" in tool_names
                assert "git_add_tool" in tool_names
                assert "git_commit_tool" in tool_names
                assert "git_log_tool" in tool_names
                assert "git_diff_tool" in tool_names
                assert "git_branch_tool" in tool_names
                assert "git_push_tool" in tool_names
                assert "git_init_tool" in tool_names
                assert "git_config_tool" in tool_names
                assert "git_clone_tool" in tool_names
                assert "git_pull_tool" in tool_names

                # Check for Sanity tools
                assert "sanity_query" in tool_names
                assert "sanity_get_document" in tool_names
                assert "sanity_create_document" in tool_names
                assert "sanity_update_document" in tool_names
                assert "sanity_delete_document" in tool_names
                assert "sanity_get_assets" in tool_names
                assert "sanity_get_schema" in tool_names

                # Check for Privy tools
                assert "privy_verify_token" in tool_names
                assert "privy_get_user" in tool_names
                assert "privy_list_users" in tool_names
                assert "privy_create_user" in tool_names
                assert "privy_update_user" in tool_names
                assert "privy_delete_user" in tool_names
                assert "privy_create_auth_token" in tool_names
                assert "privy_revoke_auth_token" in tool_names

                # Check for BASE tools
                assert "base_get_balance" in tool_names
                assert "base_get_transaction" in tool_names
                assert "base_get_block" in tool_names
                assert "base_call_contract_function" in tool_names
                assert "base_send_transaction" in tool_names
                assert "base_send_contract_transaction" in tool_names
                assert "base_get_gas_price" in tool_names
                assert "base_is_contract" in tool_names
                assert "base_get_logs" in tool_names
