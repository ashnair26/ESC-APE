#!/usr/bin/env python3
"""
Git MCP server implementation for the ESCAPE Creator Engine.

This server provides tools for interacting with Git repositories through the Model Context Protocol.
"""

import json
from typing import Dict, List, Optional, Any, Union
from pathlib import Path

from mcp.server.fastmcp import FastMCP, Context

from core.utils import format_error_message
from servers.git.commands import (
    git_status,
    git_add,
    git_commit,
    git_log,
    git_diff,
    git_branch,
    git_push,
    git_init,
    git_config,
    git_clone,
    git_pull
)

# Initialize the MCP server
mcp = FastMCP("ESCAPE Git Server")


@mcp.tool()
def git_status_tool(
    ctx: Context,
    porcelain: bool = False,
    working_dir: Optional[str] = None
) -> str:
    """
    Get the current status of the Git repository.
    
    Args:
        porcelain: If True, return machine-readable output
        working_dir: Working directory to run the command in (default: current directory)
        
    Returns:
        String containing the status of the repository
    """
    try:
        result = git_status(porcelain=porcelain, cwd=working_dir)
        
        if result['returncode'] != 0:
            ctx.error(f"Error getting git status: {result['stderr']}")
            return json.dumps({"error": result['stderr']})
        
        return result['stdout'] or "No changes (clean working directory)"
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error in git_status_tool: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
def git_add_tool(
    ctx: Context,
    paths: str,
    working_dir: Optional[str] = None
) -> str:
    """
    Add file(s) to the Git staging area.
    
    Args:
        paths: File paths to add, separated by commas, or '.' for all files
        working_dir: Working directory to run the command in (default: current directory)
        
    Returns:
        Result of the git add operation
    """
    try:
        # Split the paths by comma and strip whitespace
        path_list = [p.strip() for p in paths.split(',')]
        
        # Run git add
        result = git_add(path_list, cwd=working_dir)
        
        if result['returncode'] != 0:
            ctx.error(f"Error adding files: {result['stderr']}")
            return json.dumps({"error": result['stderr']})
        
        return f"Added {len(path_list)} path(s) to staging area.\n\nCurrent status:\n{result['stdout']}"
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error in git_add_tool: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
def git_commit_tool(
    ctx: Context,
    message: str,
    author: Optional[str] = None,
    working_dir: Optional[str] = None
) -> str:
    """
    Commit staged changes to the Git repository.
    
    Args:
        message: Commit message
        author: Optional author name and email (format: "Name <email@example.com>")
        working_dir: Working directory to run the command in (default: current directory)
        
    Returns:
        Result of the git commit operation
    """
    try:
        result = git_commit(message=message, author=author, cwd=working_dir)
        
        if result['returncode'] != 0:
            ctx.error(f"Error committing changes: {result['stderr']}")
            return json.dumps({"error": result['stderr']})
        
        return result['stdout']
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error in git_commit_tool: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
def git_log_tool(
    ctx: Context,
    n: int = 5,
    oneline: bool = False,
    all_branches: bool = False,
    working_dir: Optional[str] = None
) -> str:
    """
    View the commit history of the Git repository.
    
    Args:
        n: Number of commits to show
        oneline: If True, show each commit on a single line
        all_branches: If True, show commits from all branches
        working_dir: Working directory to run the command in (default: current directory)
        
    Returns:
        String containing the commit history
    """
    try:
        result = git_log(n=n, oneline=oneline, all_branches=all_branches, cwd=working_dir)
        
        if result['returncode'] != 0:
            ctx.error(f"Error getting git log: {result['stderr']}")
            return json.dumps({"error": result['stderr']})
        
        return result['stdout'] or "No commits found"
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error in git_log_tool: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
def git_diff_tool(
    ctx: Context,
    staged: bool = False,
    file_path: Optional[str] = None,
    working_dir: Optional[str] = None
) -> str:
    """
    Show differences between working directory and staging area or HEAD.
    
    Args:
        staged: If True, show differences between staging area and HEAD
        file_path: Optional path to a specific file
        working_dir: Working directory to run the command in (default: current directory)
        
    Returns:
        String containing the diff output
    """
    try:
        result = git_diff(staged=staged, file_path=file_path, cwd=working_dir)
        
        if result['returncode'] != 0:
            ctx.error(f"Error getting git diff: {result['stderr']}")
            return json.dumps({"error": result['stderr']})
        
        return result['stdout'] or "No differences found"
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error in git_diff_tool: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
def git_branch_tool(
    ctx: Context,
    name: Optional[str] = None,
    checkout: bool = False,
    list_all: bool = False,
    working_dir: Optional[str] = None
) -> str:
    """
    Create, list, or switch branches.
    
    Args:
        name: Name of the branch to create or checkout
        checkout: If True and name is provided, checkout the branch
        list_all: If True, list all branches including remotes
        working_dir: Working directory to run the command in (default: current directory)
        
    Returns:
        String containing the result of the branch operation
    """
    try:
        result = git_branch(name=name, checkout=checkout, list_all=list_all, cwd=working_dir)
        
        if result['returncode'] != 0:
            ctx.error(f"Error with git branch operation: {result['stderr']}")
            return json.dumps({"error": result['stderr']})
        
        if name and checkout:
            return f"Switched to branch '{name}'\n{result['stdout']}"
        elif name:
            return f"Created branch '{name}'\n{result['stdout']}"
        else:
            return result['stdout'] or "No branches found"
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error in git_branch_tool: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
def git_push_tool(
    ctx: Context,
    remote: str = "origin",
    branch: Optional[str] = None,
    force: bool = False,
    working_dir: Optional[str] = None
) -> str:
    """
    Push commits to a remote repository.
    
    Args:
        remote: Name of the remote repository
        branch: Name of the branch to push (default: current branch)
        force: If True, force push even if it results in a non-fast-forward update
        working_dir: Working directory to run the command in (default: current directory)
        
    Returns:
        String containing the result of the push operation
    """
    try:
        result = git_push(remote=remote, branch=branch, force=force, cwd=working_dir)
        
        if result['returncode'] != 0:
            ctx.error(f"Error pushing to remote: {result['stderr']}")
            return json.dumps({"error": result['stderr']})
        
        return result['stdout'] or f"Successfully pushed to {remote}" + (f"/{branch}" if branch else "")
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error in git_push_tool: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
def git_init_tool(
    ctx: Context,
    working_dir: Optional[str] = None
) -> str:
    """
    Initialize a new Git repository in the current directory.
    
    Args:
        working_dir: Working directory to run the command in (default: current directory)
        
    Returns:
        String containing the result of the init operation
    """
    try:
        result = git_init(cwd=working_dir)
        
        if result['returncode'] != 0:
            ctx.error(f"Error initializing repository: {result['stderr']}")
            return json.dumps({"error": result['stderr']})
        
        return result['stdout'] or "Initialized empty Git repository"
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error in git_init_tool: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
def git_config_tool(
    ctx: Context,
    name: str,
    value: str,
    global_config: bool = False,
    working_dir: Optional[str] = None
) -> str:
    """
    Set Git configuration values.
    
    Args:
        name: Configuration name (e.g., "user.name")
        value: Configuration value
        global_config: If True, set the configuration globally
        working_dir: Working directory to run the command in (default: current directory)
        
    Returns:
        String containing the result of the config operation
    """
    try:
        result = git_config(name=name, value=value, global_config=global_config, cwd=working_dir)
        
        if result['returncode'] != 0:
            ctx.error(f"Error setting git config: {result['stderr']}")
            return json.dumps({"error": result['stderr']})
        
        scope = "globally" if global_config else "locally"
        return f"Set {name} to '{value}' {scope}"
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error in git_config_tool: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
def git_clone_tool(
    ctx: Context,
    repository: str,
    directory: Optional[str] = None,
    branch: Optional[str] = None,
    working_dir: Optional[str] = None
) -> str:
    """
    Clone a repository into a new directory.
    
    Args:
        repository: The repository to clone
        directory: The directory to clone into (default: repository name)
        branch: The branch to clone (default: default branch)
        working_dir: Working directory to run the command in (default: current directory)
        
    Returns:
        String containing the result of the clone operation
    """
    try:
        result = git_clone(
            repository=repository,
            directory=directory,
            branch=branch,
            cwd=working_dir
        )
        
        if result['returncode'] != 0:
            ctx.error(f"Error cloning repository: {result['stderr']}")
            return json.dumps({"error": result['stderr']})
        
        return result['stdout'] or f"Successfully cloned {repository}" + (f" into {directory}" if directory else "")
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error in git_clone_tool: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
def git_pull_tool(
    ctx: Context,
    remote: str = "origin",
    branch: Optional[str] = None,
    working_dir: Optional[str] = None
) -> str:
    """
    Fetch from and integrate with another repository or a local branch.
    
    Args:
        remote: Name of the remote repository
        branch: Name of the branch to pull (default: current branch)
        working_dir: Working directory to run the command in (default: current directory)
        
    Returns:
        String containing the result of the pull operation
    """
    try:
        result = git_pull(remote=remote, branch=branch, cwd=working_dir)
        
        if result['returncode'] != 0:
            ctx.error(f"Error pulling from remote: {result['stderr']}")
            return json.dumps({"error": result['stderr']})
        
        return result['stdout'] or f"Successfully pulled from {remote}" + (f"/{branch}" if branch else "")
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error in git_pull_tool: {error_message}")
        return json.dumps({"error": error_message})


if __name__ == "__main__":
    # Run the server with stdio transport
    mcp.run()
