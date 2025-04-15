#!/usr/bin/env python3
"""
Git command implementations for the ESCAPE Creator Engine.

This module provides functions for interacting with Git repositories.
"""

import os
import subprocess
from typing import Dict, List, Optional, Any, Union
from pathlib import Path

import logging

logger = logging.getLogger(__name__)


def run_git_command(
    args: List[str], 
    cwd: Optional[Union[str, Path]] = None,
    check: bool = False
) -> Dict[str, Any]:
    """
    Run a Git command and return the result.
    
    Args:
        args: List of command arguments (e.g. ['status', '--porcelain'])
        cwd: Working directory to run the command in (default: current directory)
        check: Whether to raise an exception on non-zero return code
        
    Returns:
        Dictionary with stdout, stderr, and return code
        
    Raises:
        subprocess.CalledProcessError: If check=True and the command returns a non-zero exit code
    """
    try:
        # Prepend 'git' to the command arguments
        cmd = ['git'] + args
        
        # Log the command being executed
        logger.debug(f"Executing Git command: {' '.join(cmd)}")
        
        # Run the command
        process = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=check
        )
        
        # Return the result
        return {
            'stdout': process.stdout,
            'stderr': process.stderr,
            'returncode': process.returncode
        }
    except subprocess.CalledProcessError as e:
        logger.error(f"Git command failed: {e}")
        return {
            'stdout': e.stdout if hasattr(e, 'stdout') else '',
            'stderr': e.stderr if hasattr(e, 'stderr') else str(e),
            'returncode': e.returncode if hasattr(e, 'returncode') else 1
        }
    except Exception as e:
        logger.error(f"Error executing Git command: {e}")
        return {
            'stdout': '',
            'stderr': str(e),
            'returncode': 1
        }


def git_status(porcelain: bool = False, cwd: Optional[Union[str, Path]] = None) -> Dict[str, Any]:
    """
    Get the current status of the Git repository.
    
    Args:
        porcelain: If True, return machine-readable output
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        Dictionary with stdout, stderr, and return code
    """
    args = ['status']
    if porcelain:
        args.append('--porcelain')
    
    return run_git_command(args, cwd=cwd)


def git_add(
    paths: Union[str, List[str]], 
    cwd: Optional[Union[str, Path]] = None
) -> Dict[str, Any]:
    """
    Add file(s) to the Git staging area.
    
    Args:
        paths: File path(s) to add. Can be a single path or a list of paths.
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        Dictionary with stdout, stderr, and return code
    """
    # Convert single path to list
    if isinstance(paths, str):
        paths = [paths]
    
    # Run git add for each path
    results = []
    for path in paths:
        result = run_git_command(['add', path], cwd=cwd)
        results.append(result)
    
    # If any command failed, return the first failure
    for result in results:
        if result['returncode'] != 0:
            return result
    
    # All commands succeeded, return the status
    return git_status(cwd=cwd)


def git_commit(
    message: str, 
    author: Optional[str] = None,
    cwd: Optional[Union[str, Path]] = None
) -> Dict[str, Any]:
    """
    Commit staged changes to the Git repository.
    
    Args:
        message: Commit message
        author: Optional author name and email (format: "Name <email@example.com>")
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        Dictionary with stdout, stderr, and return code
    """
    args = ['commit', '-m', message]
    
    # Add author if provided
    if author:
        args.extend(['--author', author])
    
    return run_git_command(args, cwd=cwd)


def git_log(
    n: int = 5, 
    oneline: bool = False, 
    all_branches: bool = False,
    cwd: Optional[Union[str, Path]] = None
) -> Dict[str, Any]:
    """
    View the commit history of the Git repository.
    
    Args:
        n: Number of commits to show
        oneline: If True, show each commit on a single line
        all_branches: If True, show commits from all branches
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        Dictionary with stdout, stderr, and return code
    """
    args = ['log', f'-n{n}']
    
    if oneline:
        args.append('--oneline')
    
    if all_branches:
        args.append('--all')
    
    return run_git_command(args, cwd=cwd)


def git_diff(
    staged: bool = False, 
    file_path: Optional[str] = None,
    cwd: Optional[Union[str, Path]] = None
) -> Dict[str, Any]:
    """
    Show differences between working directory and staging area or HEAD.
    
    Args:
        staged: If True, show differences between staging area and HEAD
        file_path: Optional path to a specific file
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        Dictionary with stdout, stderr, and return code
    """
    args = ['diff']
    
    if staged:
        args.append('--staged')
    
    if file_path:
        args.append(file_path)
    
    return run_git_command(args, cwd=cwd)


def branch_exists(
    branch_name: str,
    cwd: Optional[Union[str, Path]] = None
) -> bool:
    """
    Check if a branch exists.
    
    Args:
        branch_name: Name of the branch to check
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        True if the branch exists, False otherwise
    """
    result = run_git_command(['branch'], cwd=cwd)
    if result['returncode'] != 0:
        return False
    
    branches = [b.strip() for b in result['stdout'].split('\n') if b.strip()]
    # Remove the asterisk from the current branch
    branches = [b[2:] if b.startswith('* ') else b for b in branches]
    
    return branch_name in branches


def git_branch(
    name: Optional[str] = None, 
    checkout: bool = False, 
    list_all: bool = False,
    cwd: Optional[Union[str, Path]] = None
) -> Dict[str, Any]:
    """
    Create, list, or switch branches.
    
    Args:
        name: Name of the branch to create or checkout
        checkout: If True and name is provided, checkout the branch
        list_all: If True, list all branches including remotes
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        Dictionary with stdout, stderr, and return code
    """
    if name and checkout:
        # Checkout or create and checkout a branch
        args = ['checkout']
        if not branch_exists(name, cwd=cwd):
            args.append('-b')
        args.append(name)
        
        return run_git_command(args, cwd=cwd)
    
    elif name:
        # Create a new branch
        args = ['branch', name]
        
        return run_git_command(args, cwd=cwd)
    
    else:
        # List branches
        args = ['branch']
        
        if list_all:
            args.append('-a')
        
        return run_git_command(args, cwd=cwd)


def git_push(
    remote: str = "origin", 
    branch: Optional[str] = None, 
    force: bool = False,
    cwd: Optional[Union[str, Path]] = None
) -> Dict[str, Any]:
    """
    Push commits to a remote repository.
    
    Args:
        remote: Name of the remote repository
        branch: Name of the branch to push (default: current branch)
        force: If True, force push even if it results in a non-fast-forward update
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        Dictionary with stdout, stderr, and return code
    """
    args = ['push', remote]
    
    if branch:
        args.append(branch)
    
    if force:
        args.append('--force')
    
    return run_git_command(args, cwd=cwd)


def git_init(cwd: Optional[Union[str, Path]] = None) -> Dict[str, Any]:
    """
    Initialize a new Git repository in the current directory.
    
    Args:
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        Dictionary with stdout, stderr, and return code
    """
    return run_git_command(['init'], cwd=cwd)


def git_config(
    name: str, 
    value: str, 
    global_config: bool = False,
    cwd: Optional[Union[str, Path]] = None
) -> Dict[str, Any]:
    """
    Set Git configuration values.
    
    Args:
        name: Configuration name (e.g., "user.name")
        value: Configuration value
        global_config: If True, set the configuration globally
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        Dictionary with stdout, stderr, and return code
    """
    args = ['config']
    
    if global_config:
        args.append('--global')
    
    args.extend([name, value])
    
    return run_git_command(args, cwd=cwd)


def git_clone(
    repository: str,
    directory: Optional[str] = None,
    branch: Optional[str] = None,
    cwd: Optional[Union[str, Path]] = None
) -> Dict[str, Any]:
    """
    Clone a repository into a new directory.
    
    Args:
        repository: The repository to clone
        directory: The directory to clone into (default: repository name)
        branch: The branch to clone (default: default branch)
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        Dictionary with stdout, stderr, and return code
    """
    args = ['clone', repository]
    
    if directory:
        args.append(directory)
    
    if branch:
        args.extend(['--branch', branch])
    
    return run_git_command(args, cwd=cwd)


def git_pull(
    remote: str = "origin",
    branch: Optional[str] = None,
    cwd: Optional[Union[str, Path]] = None
) -> Dict[str, Any]:
    """
    Fetch from and integrate with another repository or a local branch.
    
    Args:
        remote: Name of the remote repository
        branch: Name of the branch to pull (default: current branch)
        cwd: Working directory to run the command in (default: current directory)
        
    Returns:
        Dictionary with stdout, stderr, and return code
    """
    args = ['pull', remote]
    
    if branch:
        args.append(branch)
    
    return run_git_command(args, cwd=cwd)
