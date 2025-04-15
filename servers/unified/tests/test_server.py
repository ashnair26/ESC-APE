#!/usr/bin/env python3
"""
Tests for the unified MCP server.
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock

from mcp.server.fastmcp import FastMCP
from servers.unified.server import import_tools_from_server, register_tools_from_server


# Mock Tool class for testing
class MockTool:
    """Mock Tool class for testing."""

    def __init__(self, name, description, func):
        self.name = name
        self.description = description
        self.func = func


class TestUnifiedServer:
    """Tests for the unified MCP server."""

    def test_import_tools_from_server(self):
        """Test importing tools from a source MCP server."""
        # Create a mock MCP server
        source_mcp = MagicMock(spec=FastMCP)

        # Create mock tools
        tool1 = MagicMock(spec=MockTool)
        tool1.name = "tool1"
        tool1.description = "Tool 1 description"

        tool2 = MagicMock(spec=MockTool)
        tool2.name = "tool2"
        tool2.description = "Tool 2 description"

        # Set up the mock server to return the mock tools
        source_mcp._tools = [tool1, tool2]

        # Call the function
        tools = import_tools_from_server(source_mcp)

        # Check the result
        assert len(tools) == 2
        assert tools[0] == tool1
        assert tools[1] == tool2

    def test_register_tools_from_server(self):
        """Test registering tools from a source MCP server."""
        # Create a mock MCP server
        source_mcp = MagicMock(spec=FastMCP)

        # Create mock tools
        tool1 = MagicMock(spec=MockTool)
        tool1.name = "tool1"
        tool1.description = "Tool 1 description"
        tool1.func = lambda: None

        tool2 = MagicMock(spec=MockTool)
        tool2.name = "tool2"
        tool2.description = "Tool 2 description"
        tool2.func = lambda: None

        # Set up the mock server to return the mock tools
        source_mcp._tools = [tool1, tool2]

        # Create a mock unified MCP server
        unified_mcp = MagicMock()
        unified_mcp.register_tool = MagicMock()

        # Call the function
        with patch("servers.unified.server.mcp", unified_mcp):
            register_tools_from_server(source_mcp)

        # Check that register_tool was called for each tool
        assert unified_mcp.register_tool.call_count == 2

        # Check the first call
        _, kwargs1 = unified_mcp.register_tool.call_args_list[0]
        assert kwargs1["name"] == "tool1"
        assert kwargs1["func"] == tool1.func
        assert kwargs1["description"] == tool1.description

        # Check the second call
        _, kwargs2 = unified_mcp.register_tool.call_args_list[1]
        assert kwargs2["name"] == "tool2"
        assert kwargs2["func"] == tool2.func
        assert kwargs2["description"] == tool2.description

    def test_register_tools_from_server_with_prefix(self):
        """Test registering tools from a source MCP server with a prefix."""
        # Create a mock MCP server
        source_mcp = MagicMock(spec=FastMCP)

        # Create mock tools
        tool1 = MagicMock(spec=MockTool)
        tool1.name = "tool1"
        tool1.description = "Tool 1 description"
        tool1.func = lambda: None

        tool2 = MagicMock(spec=MockTool)
        tool2.name = "tool2"
        tool2.description = "Tool 2 description"
        tool2.func = lambda: None

        # Set up the mock server to return the mock tools
        source_mcp._tools = [tool1, tool2]

        # Create a mock unified MCP server
        unified_mcp = MagicMock()
        unified_mcp.register_tool = MagicMock()

        # Call the function with a prefix
        with patch("servers.unified.server.mcp", unified_mcp):
            register_tools_from_server(source_mcp, prefix="test")

        # Check that register_tool was called for each tool
        assert unified_mcp.register_tool.call_count == 2

        # Check the first call
        _, kwargs1 = unified_mcp.register_tool.call_args_list[0]
        assert kwargs1["name"] == "test_tool1"
        assert kwargs1["func"] == tool1.func
        assert kwargs1["description"] == tool1.description

        # Check the second call
        _, kwargs2 = unified_mcp.register_tool.call_args_list[1]
        assert kwargs2["name"] == "test_tool2"
        assert kwargs2["func"] == tool2.func
        assert kwargs2["description"] == tool2.description
