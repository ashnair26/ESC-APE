#!/usr/bin/env python3
"""
Tests for the Git commands module.
"""

import os
import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path

from servers.git.commands import (
    run_git_command,
    git_status,
    git_add,
    git_commit,
    git_log,
    git_diff,
    branch_exists,
    git_branch,
    git_push,
    git_init,
    git_config,
    git_clone,
    git_pull
)


class TestGitCommands:
    """Tests for the Git commands module."""
    
    def test_run_git_command_success(self):
        """Test running a Git command successfully."""
        # Mock subprocess.run
        mock_process = MagicMock()
        mock_process.stdout = "test output"
        mock_process.stderr = ""
        mock_process.returncode = 0
        
        with patch("subprocess.run", return_value=mock_process):
            # Call the function
            result = run_git_command(["status"])
            
            # Check the result
            assert result["stdout"] == "test output"
            assert result["stderr"] == ""
            assert result["returncode"] == 0
    
    def test_run_git_command_error(self):
        """Test running a Git command that fails."""
        # Mock subprocess.run to raise an exception
        with patch("subprocess.run", side_effect=Exception("test error")):
            # Call the function
            result = run_git_command(["status"])
            
            # Check the result
            assert result["stdout"] == ""
            assert "test error" in result["stderr"]
            assert result["returncode"] == 1
    
    def test_git_status(self):
        """Test getting the status of a Git repository."""
        # Mock run_git_command
        expected_result = {
            "stdout": "On branch main\nnothing to commit, working tree clean",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_status()
            
            # Check the result
            assert result == expected_result
    
    def test_git_status_porcelain(self):
        """Test getting the status of a Git repository in porcelain format."""
        # Mock run_git_command
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_status(porcelain=True)
            
            # Check the result
            assert result == expected_result
    
    def test_git_add_single_path(self):
        """Test adding a single file to the staging area."""
        # Mock run_git_command
        expected_result = {
            "stdout": "On branch main\nChanges to be committed:\n  (use \"git restore --staged <file>...\" to unstage)\n\tnew file:   test.txt",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_add("test.txt")
            
            # Check the result
            assert result == expected_result
    
    def test_git_add_multiple_paths(self):
        """Test adding multiple files to the staging area."""
        # Mock run_git_command
        expected_result = {
            "stdout": "On branch main\nChanges to be committed:\n  (use \"git restore --staged <file>...\" to unstage)\n\tnew file:   test1.txt\n\tnew file:   test2.txt",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_add(["test1.txt", "test2.txt"])
            
            # Check the result
            assert result == expected_result
    
    def test_git_add_error(self):
        """Test adding a file that doesn't exist."""
        # Mock run_git_command to return an error for the first call
        error_result = {
            "stdout": "",
            "stderr": "fatal: pathspec 'nonexistent.txt' did not match any files",
            "returncode": 1
        }
        
        with patch("servers.git.commands.run_git_command", return_value=error_result):
            # Call the function
            result = git_add("nonexistent.txt")
            
            # Check the result
            assert result == error_result
    
    def test_git_commit(self):
        """Test committing changes."""
        # Mock run_git_command
        expected_result = {
            "stdout": "[main 1234567] Test commit\n 1 file changed, 1 insertion(+)",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_commit("Test commit")
            
            # Check the result
            assert result == expected_result
    
    def test_git_commit_with_author(self):
        """Test committing changes with a specific author."""
        # Mock run_git_command
        expected_result = {
            "stdout": "[main 1234567] Test commit\n 1 file changed, 1 insertion(+)",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_commit("Test commit", author="Test User <test@example.com>")
            
            # Check the result
            assert result == expected_result
    
    def test_git_log(self):
        """Test viewing the commit history."""
        # Mock run_git_command
        expected_result = {
            "stdout": "commit 1234567890abcdef\nAuthor: Test User <test@example.com>\nDate:   Mon Apr 15 12:00:00 2024 -0700\n\n    Test commit",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_log()
            
            # Check the result
            assert result == expected_result
    
    def test_git_log_oneline(self):
        """Test viewing the commit history in oneline format."""
        # Mock run_git_command
        expected_result = {
            "stdout": "1234567 Test commit",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_log(oneline=True)
            
            # Check the result
            assert result == expected_result
    
    def test_git_diff(self):
        """Test showing differences."""
        # Mock run_git_command
        expected_result = {
            "stdout": "diff --git a/test.txt b/test.txt\nindex 1234567..abcdef0 100644\n--- a/test.txt\n+++ b/test.txt\n@@ -1 +1 @@\n-old content\n+new content",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_diff()
            
            # Check the result
            assert result == expected_result
    
    def test_git_diff_staged(self):
        """Test showing differences for staged changes."""
        # Mock run_git_command
        expected_result = {
            "stdout": "diff --git a/test.txt b/test.txt\nindex 1234567..abcdef0 100644\n--- a/test.txt\n+++ b/test.txt\n@@ -1 +1 @@\n-old content\n+new content",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_diff(staged=True)
            
            # Check the result
            assert result == expected_result
    
    def test_branch_exists_true(self):
        """Test checking if a branch exists when it does."""
        # Mock run_git_command
        expected_result = {
            "stdout": "* main\n  feature",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = branch_exists("main")
            
            # Check the result
            assert result is True
    
    def test_branch_exists_false(self):
        """Test checking if a branch exists when it doesn't."""
        # Mock run_git_command
        expected_result = {
            "stdout": "* main",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = branch_exists("feature")
            
            # Check the result
            assert result is False
    
    def test_git_branch_list(self):
        """Test listing branches."""
        # Mock run_git_command
        expected_result = {
            "stdout": "* main\n  feature",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_branch()
            
            # Check the result
            assert result == expected_result
    
    def test_git_branch_create(self):
        """Test creating a branch."""
        # Mock run_git_command
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_branch("feature")
            
            # Check the result
            assert result == expected_result
    
    def test_git_branch_checkout_existing(self):
        """Test checking out an existing branch."""
        # Mock branch_exists to return True
        with patch("servers.git.commands.branch_exists", return_value=True):
            # Mock run_git_command
            expected_result = {
                "stdout": "Switched to branch 'feature'",
                "stderr": "",
                "returncode": 0
            }
            
            with patch("servers.git.commands.run_git_command", return_value=expected_result):
                # Call the function
                result = git_branch("feature", checkout=True)
                
                # Check the result
                assert result == expected_result
    
    def test_git_branch_checkout_new(self):
        """Test checking out a new branch."""
        # Mock branch_exists to return False
        with patch("servers.git.commands.branch_exists", return_value=False):
            # Mock run_git_command
            expected_result = {
                "stdout": "Switched to a new branch 'feature'",
                "stderr": "",
                "returncode": 0
            }
            
            with patch("servers.git.commands.run_git_command", return_value=expected_result):
                # Call the function
                result = git_branch("feature", checkout=True)
                
                # Check the result
                assert result == expected_result
    
    def test_git_push(self):
        """Test pushing commits."""
        # Mock run_git_command
        expected_result = {
            "stdout": "To github.com:user/repo.git\n   1234567..abcdef0  main -> main",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_push()
            
            # Check the result
            assert result == expected_result
    
    def test_git_push_with_branch(self):
        """Test pushing commits to a specific branch."""
        # Mock run_git_command
        expected_result = {
            "stdout": "To github.com:user/repo.git\n   1234567..abcdef0  feature -> feature",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_push(branch="feature")
            
            # Check the result
            assert result == expected_result
    
    def test_git_init(self):
        """Test initializing a repository."""
        # Mock run_git_command
        expected_result = {
            "stdout": "Initialized empty Git repository in /path/to/repo/.git/",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_init()
            
            # Check the result
            assert result == expected_result
    
    def test_git_config(self):
        """Test setting a configuration value."""
        # Mock run_git_command
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_config("user.name", "Test User")
            
            # Check the result
            assert result == expected_result
    
    def test_git_config_global(self):
        """Test setting a global configuration value."""
        # Mock run_git_command
        expected_result = {
            "stdout": "",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_config("user.name", "Test User", global_config=True)
            
            # Check the result
            assert result == expected_result
    
    def test_git_clone(self):
        """Test cloning a repository."""
        # Mock run_git_command
        expected_result = {
            "stdout": "Cloning into 'repo'...\ndone.",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_clone("https://github.com/user/repo.git")
            
            # Check the result
            assert result == expected_result
    
    def test_git_clone_with_directory(self):
        """Test cloning a repository into a specific directory."""
        # Mock run_git_command
        expected_result = {
            "stdout": "Cloning into 'custom-dir'...\ndone.",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_clone("https://github.com/user/repo.git", directory="custom-dir")
            
            # Check the result
            assert result == expected_result
    
    def test_git_pull(self):
        """Test pulling changes."""
        # Mock run_git_command
        expected_result = {
            "stdout": "Updating 1234567..abcdef0\nFast-forward\n 1 file changed, 1 insertion(+)",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_pull()
            
            # Check the result
            assert result == expected_result
    
    def test_git_pull_with_branch(self):
        """Test pulling changes from a specific branch."""
        # Mock run_git_command
        expected_result = {
            "stdout": "Updating 1234567..abcdef0\nFast-forward\n 1 file changed, 1 insertion(+)",
            "stderr": "",
            "returncode": 0
        }
        
        with patch("servers.git.commands.run_git_command", return_value=expected_result):
            # Call the function
            result = git_pull(branch="feature")
            
            # Check the result
            assert result == expected_result
