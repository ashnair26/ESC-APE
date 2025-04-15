#!/usr/bin/env python3
"""
Tests for the Git MCP server.
"""

import json
import pytest
from unittest.mock import patch, MagicMock

from mcp.server.fastmcp import Context
from servers.git.server import (
    git_status_tool,
    git_add_tool,
    git_commit_tool,
    git_log_tool,
    git_diff_tool,
    git_branch_tool,
    git_push_tool,
    git_init_tool,
    git_config_tool,
    git_clone_tool,
    git_pull_tool
)


@pytest.fixture
def mock_context():
    """Create a mock MCP Context."""
    context = MagicMock(spec=Context)
    return context


class TestGitMCPServer:
    """Tests for the Git MCP server tools."""
    
    def test_git_status_tool_success(self, mock_context):
        """Test getting the status successfully."""
        # Mock git_status
        expected_result = {
            "stdout": "On branch main\nnothing to commit, working tree clean",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_status", return_value=expected_result):
            # Call the tool
            result = git_status_tool(mock_context)
            
            # Check the result
            assert result == expected_result["stdout"]
    
    def test_git_status_tool_error(self, mock_context):
        """Test getting the status with an error."""
        # Mock git_status
        expected_result = {
            "stdout": "",
            "stderr": "fatal: not a git repository",
            "returncode": 128
        }
        
        with patch("servers.git.server.git_status", return_value=expected_result):
            # Call the tool
            result = git_status_tool(mock_context)
            
            # Check the result
            assert json.loads(result)["error"] == expected_result["stderr"]
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    def test_git_status_tool_exception(self, mock_context):
        """Test getting the status with an exception."""
        # Mock git_status to raise an exception
        with patch("servers.git.server.git_status", side_effect=Exception("test error")):
            # Call the tool
            result = git_status_tool(mock_context)
            
            # Check the result
            assert "error" in json.loads(result)
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    def test_git_add_tool_success(self, mock_context):
        """Test adding files successfully."""
        # Mock git_add
        expected_result = {
            "stdout": "On branch main\nChanges to be committed:\n  (use \"git restore --staged <file>...\" to unstage)\n\tnew file:   test.txt",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_add", return_value=expected_result):
            # Call the tool
            result = git_add_tool(mock_context, "test.txt")
            
            # Check the result
            assert "Added 1 path(s) to staging area" in result
            assert expected_result["stdout"] in result
    
    def test_git_add_tool_error(self, mock_context):
        """Test adding files with an error."""
        # Mock git_add
        expected_result = {
            "stdout": "",
            "stderr": "fatal: pathspec 'nonexistent.txt' did not match any files",
            "returncode": 1
        }
        
        with patch("servers.git.server.git_add", return_value=expected_result):
            # Call the tool
            result = git_add_tool(mock_context, "nonexistent.txt")
            
            # Check the result
            assert json.loads(result)["error"] == expected_result["stderr"]
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    def test_git_commit_tool_success(self, mock_context):
        """Test committing changes successfully."""
        # Mock git_commit
        expected_result = {
            "stdout": "[main 1234567] Test commit\n 1 file changed, 1 insertion(+)",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_commit", return_value=expected_result):
            # Call the tool
            result = git_commit_tool(mock_context, "Test commit")
            
            # Check the result
            assert result == expected_result["stdout"]
    
    def test_git_commit_tool_error(self, mock_context):
        """Test committing changes with an error."""
        # Mock git_commit
        expected_result = {
            "stdout": "",
            "stderr": "fatal: no changes added to commit",
            "returncode": 1
        }
        
        with patch("servers.git.server.git_commit", return_value=expected_result):
            # Call the tool
            result = git_commit_tool(mock_context, "Test commit")
            
            # Check the result
            assert json.loads(result)["error"] == expected_result["stderr"]
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    def test_git_log_tool_success(self, mock_context):
        """Test viewing the commit history successfully."""
        # Mock git_log
        expected_result = {
            "stdout": "commit 1234567890abcdef\nAuthor: Test User <test@example.com>\nDate:   Mon Apr 15 12:00:00 2024 -0700\n\n    Test commit",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_log", return_value=expected_result):
            # Call the tool
            result = git_log_tool(mock_context)
            
            # Check the result
            assert result == expected_result["stdout"]
    
    def test_git_log_tool_error(self, mock_context):
        """Test viewing the commit history with an error."""
        # Mock git_log
        expected_result = {
            "stdout": "",
            "stderr": "fatal: not a git repository",
            "returncode": 128
        }
        
        with patch("servers.git.server.git_log", return_value=expected_result):
            # Call the tool
            result = git_log_tool(mock_context)
            
            # Check the result
            assert json.loads(result)["error"] == expected_result["stderr"]
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    def test_git_diff_tool_success(self, mock_context):
        """Test showing differences successfully."""
        # Mock git_diff
        expected_result = {
            "stdout": "diff --git a/test.txt b/test.txt\nindex 1234567..abcdef0 100644\n--- a/test.txt\n+++ b/test.txt\n@@ -1 +1 @@\n-old content\n+new content",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_diff", return_value=expected_result):
            # Call the tool
            result = git_diff_tool(mock_context)
            
            # Check the result
            assert result == expected_result["stdout"]
    
    def test_git_diff_tool_no_differences(self, mock_context):
        """Test showing differences when there are none."""
        # Mock git_diff
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_diff", return_value=expected_result):
            # Call the tool
            result = git_diff_tool(mock_context)
            
            # Check the result
            assert result == "No differences found"
    
    def test_git_diff_tool_error(self, mock_context):
        """Test showing differences with an error."""
        # Mock git_diff
        expected_result = {
            "stdout": "",
            "stderr": "fatal: not a git repository",
            "returncode": 128
        }
        
        with patch("servers.git.server.git_diff", return_value=expected_result):
            # Call the tool
            result = git_diff_tool(mock_context)
            
            # Check the result
            assert json.loads(result)["error"] == expected_result["stderr"]
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    def test_git_branch_tool_list_success(self, mock_context):
        """Test listing branches successfully."""
        # Mock git_branch
        expected_result = {
            "stdout": "* main\n  feature",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_branch", return_value=expected_result):
            # Call the tool
            result = git_branch_tool(mock_context)
            
            # Check the result
            assert result == expected_result["stdout"]
    
    def test_git_branch_tool_create_success(self, mock_context):
        """Test creating a branch successfully."""
        # Mock git_branch
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_branch", return_value=expected_result):
            # Call the tool
            result = git_branch_tool(mock_context, name="feature")
            
            # Check the result
            assert "Created branch 'feature'" in result
    
    def test_git_branch_tool_checkout_success(self, mock_context):
        """Test checking out a branch successfully."""
        # Mock git_branch
        expected_result = {
            "stdout": "Switched to branch 'feature'",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_branch", return_value=expected_result):
            # Call the tool
            result = git_branch_tool(mock_context, name="feature", checkout=True)
            
            # Check the result
            assert "Switched to branch 'feature'" in result
    
    def test_git_branch_tool_error(self, mock_context):
        """Test branch operations with an error."""
        # Mock git_branch
        expected_result = {
            "stdout": "",
            "stderr": "fatal: not a git repository",
            "returncode": 128
        }
        
        with patch("servers.git.server.git_branch", return_value=expected_result):
            # Call the tool
            result = git_branch_tool(mock_context)
            
            # Check the result
            assert json.loads(result)["error"] == expected_result["stderr"]
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    def test_git_push_tool_success(self, mock_context):
        """Test pushing commits successfully."""
        # Mock git_push
        expected_result = {
            "stdout": "To github.com:user/repo.git\n   1234567..abcdef0  main -> main",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_push", return_value=expected_result):
            # Call the tool
            result = git_push_tool(mock_context)
            
            # Check the result
            assert result == expected_result["stdout"]
    
    def test_git_push_tool_no_output(self, mock_context):
        """Test pushing commits with no output."""
        # Mock git_push
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_push", return_value=expected_result):
            # Call the tool
            result = git_push_tool(mock_context)
            
            # Check the result
            assert "Successfully pushed to origin" in result
    
    def test_git_push_tool_error(self, mock_context):
        """Test pushing commits with an error."""
        # Mock git_push
        expected_result = {
            "stdout": "",
            "stderr": "fatal: not a git repository",
            "returncode": 128
        }
        
        with patch("servers.git.server.git_push", return_value=expected_result):
            # Call the tool
            result = git_push_tool(mock_context)
            
            # Check the result
            assert json.loads(result)["error"] == expected_result["stderr"]
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    def test_git_init_tool_success(self, mock_context):
        """Test initializing a repository successfully."""
        # Mock git_init
        expected_result = {
            "stdout": "Initialized empty Git repository in /path/to/repo/.git/",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_init", return_value=expected_result):
            # Call the tool
            result = git_init_tool(mock_context)
            
            # Check the result
            assert result == expected_result["stdout"]
    
    def test_git_init_tool_no_output(self, mock_context):
        """Test initializing a repository with no output."""
        # Mock git_init
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_init", return_value=expected_result):
            # Call the tool
            result = git_init_tool(mock_context)
            
            # Check the result
            assert result == "Initialized empty Git repository"
    
    def test_git_init_tool_error(self, mock_context):
        """Test initializing a repository with an error."""
        # Mock git_init
        expected_result = {
            "stdout": "",
            "stderr": "fatal: already a git repository",
            "returncode": 128
        }
        
        with patch("servers.git.server.git_init", return_value=expected_result):
            # Call the tool
            result = git_init_tool(mock_context)
            
            # Check the result
            assert json.loads(result)["error"] == expected_result["stderr"]
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    def test_git_config_tool_success(self, mock_context):
        """Test setting a configuration value successfully."""
        # Mock git_config
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_config", return_value=expected_result):
            # Call the tool
            result = git_config_tool(mock_context, "user.name", "Test User")
            
            # Check the result
            assert "Set user.name to 'Test User' locally" in result
    
    def test_git_config_tool_global(self, mock_context):
        """Test setting a global configuration value."""
        # Mock git_config
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_config", return_value=expected_result):
            # Call the tool
            result = git_config_tool(mock_context, "user.name", "Test User", global_config=True)
            
            # Check the result
            assert "Set user.name to 'Test User' globally" in result
    
    def test_git_config_tool_error(self, mock_context):
        """Test setting a configuration value with an error."""
        # Mock git_config
        expected_result = {
            "stdout": "",
            "stderr": "fatal: not a git repository",
            "returncode": 128
        }
        
        with patch("servers.git.server.git_config", return_value=expected_result):
            # Call the tool
            result = git_config_tool(mock_context, "user.name", "Test User")
            
            # Check the result
            assert json.loads(result)["error"] == expected_result["stderr"]
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    def test_git_clone_tool_success(self, mock_context):
        """Test cloning a repository successfully."""
        # Mock git_clone
        expected_result = {
            "stdout": "Cloning into 'repo'...\ndone.",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_clone", return_value=expected_result):
            # Call the tool
            result = git_clone_tool(mock_context, "https://github.com/user/repo.git")
            
            # Check the result
            assert result == expected_result["stdout"]
    
    def test_git_clone_tool_no_output(self, mock_context):
        """Test cloning a repository with no output."""
        # Mock git_clone
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_clone", return_value=expected_result):
            # Call the tool
            result = git_clone_tool(mock_context, "https://github.com/user/repo.git")
            
            # Check the result
            assert "Successfully cloned https://github.com/user/repo.git" in result
    
    def test_git_clone_tool_error(self, mock_context):
        """Test cloning a repository with an error."""
        # Mock git_clone
        expected_result = {
            "stdout": "",
            "stderr": "fatal: destination path 'repo' already exists and is not an empty directory",
            "returncode": 128
        }
        
        with patch("servers.git.server.git_clone", return_value=expected_result):
            # Call the tool
            result = git_clone_tool(mock_context, "https://github.com/user/repo.git")
            
            # Check the result
            assert json.loads(result)["error"] == expected_result["stderr"]
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
    
    def test_git_pull_tool_success(self, mock_context):
        """Test pulling changes successfully."""
        # Mock git_pull
        expected_result = {
            "stdout": "Updating 1234567..abcdef0\nFast-forward\n 1 file changed, 1 insertion(+)",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_pull", return_value=expected_result):
            # Call the tool
            result = git_pull_tool(mock_context)
            
            # Check the result
            assert result == expected_result["stdout"]
    
    def test_git_pull_tool_no_output(self, mock_context):
        """Test pulling changes with no output."""
        # Mock git_pull
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.server.git_pull", return_value=expected_result):
            # Call the tool
            result = git_pull_tool(mock_context)
            
            # Check the result
            assert "Successfully pulled from origin" in result
    
    def test_git_pull_tool_error(self, mock_context):
        """Test pulling changes with an error."""
        # Mock git_pull
        expected_result = {
            "stdout": "",
            "stderr": "fatal: not a git repository",
            "returncode": 128
        }
        
        with patch("servers.git.server.git_pull", return_value=expected_result):
            # Call the tool
            result = git_pull_tool(mock_context)
            
            # Check the result
            assert json.loads(result)["error"] == expected_result["stderr"]
            
            # Check that the error was logged
            mock_context.error.assert_called_once()
