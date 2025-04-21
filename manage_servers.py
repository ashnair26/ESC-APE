#!/usr/bin/env python3
"""
MCP Server Management Script for ESC-APE

This script helps manage (start, stop, check status) the MCP servers for the ESC-APE project.
"""

import os
import sys
import time
import signal
import argparse
import subprocess
import requests
from typing import Dict, List, Optional, Tuple
import psutil

# Define the MCP servers
MCP_SERVERS = {
    "unified": {
        "name": "Unified MCP",
        "module": "servers.unified.server",
        "port": 8000,
        "depends_on": []
    },
    "git": {
        "name": "Git MCP",
        "module": "servers.git.server",
        "port": 8004,
        "depends_on": []
    },
    "privy": {
        "name": "Privy MCP",
        "module": "servers.privy.server",
        "port": 8005,
        "depends_on": []
    },
    "supabase": {
        "name": "Supabase MCP",
        "module": "servers.supabase.server",
        "port": 8006,
        "depends_on": []
    },
    "sanity": {
        "name": "Sanity MCP",
        "module": "servers.sanity.server",
        "port": 8007,
        "depends_on": []
    },
    "base": {
        "name": "BASE MCP",
        "module": "servers.base.server",
        "port": 8008,
        "depends_on": []
    },
    "context7": {
        "name": "Context7 MCP",
        "module": "servers.context7.server",
        "port": 8009,
        "depends_on": []
    }
}

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def check_server_status(server_id: str) -> Tuple[bool, Optional[int]]:
    """
    Check if a server is running.

    Args:
        server_id: The ID of the server to check

    Returns:
        A tuple of (is_running, pid)
    """
    server_info = MCP_SERVERS.get(server_id)
    if not server_info:
        return False, None

    # Check if the server is running on its port
    url = f"http://localhost:{server_info['port']}/health"
    try:
        response = requests.get(url, timeout=1)
        if response.status_code == 200:
            # Try to find the PID
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    cmdline = proc.info.get('cmdline', [])
                    if cmdline and 'python' in cmdline[0] and server_info['module'] in ' '.join(cmdline):
                        return True, proc.info['pid']
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass
            return True, None
    except requests.RequestException:
        pass

    return False, None


def start_server(server_id: str, env: Optional[Dict[str, str]] = None) -> Optional[subprocess.Popen]:
    """
    Start a server.

    Args:
        server_id: The ID of the server to start
        env: Optional environment variables to pass to the server

    Returns:
        The subprocess.Popen object if the server was started, None otherwise
    """
    server_info = MCP_SERVERS.get(server_id)
    if not server_info:
        print(f"{Colors.RED}Error: Unknown server ID: {server_id}{Colors.ENDC}")
        return None

    # Check if the server is already running
    is_running, _ = check_server_status(server_id)
    if is_running:
        print(f"{Colors.YELLOW}Server {server_info['name']} is already running{Colors.ENDC}")
        return None

    # Start the server
    print(f"{Colors.BLUE}Starting {server_info['name']}...{Colors.ENDC}")

    # Prepare environment variables
    server_env = os.environ.copy()
    if env:
        server_env.update(env)

    # Start the server as a subprocess
    try:
        process = subprocess.Popen(
            [sys.executable, "-m", server_info["module"]],
            env=server_env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )

        # Wait a moment to see if the server starts successfully
        time.sleep(2)

        # Check if the server is running
        is_running, _ = check_server_status(server_id)
        if is_running:
            print(f"{Colors.GREEN}Server {server_info['name']} started successfully{Colors.ENDC}")
            return process
        else:
            print(f"{Colors.RED}Failed to start {server_info['name']}{Colors.ENDC}")

            # Check if there's any error output
            stderr_output = ""
            while True:
                stderr_line = process.stderr.readline()
                if not stderr_line and process.poll() is not None:
                    break
                if stderr_line:
                    stderr_output += stderr_line

            if stderr_output:
                print(f"{Colors.RED}Error: {stderr_output}{Colors.ENDC}")
            else:
                # If no stderr, try to get stdout
                stdout_output = ""
                while True:
                    stdout_line = process.stdout.readline()
                    if not stdout_line and process.poll() is not None:
                        break
                    if stdout_line:
                        stdout_output += stdout_line

                if stdout_output:
                    print(f"{Colors.YELLOW}Output: {stdout_output}{Colors.ENDC}")

            process.terminate()
            return None
    except Exception as e:
        print(f"{Colors.RED}Error starting {server_info['name']}: {str(e)}{Colors.ENDC}")
        return None


def stop_server(server_id: str) -> bool:
    """
    Stop a server.

    Args:
        server_id: The ID of the server to stop

    Returns:
        True if the server was stopped, False otherwise
    """
    server_info = MCP_SERVERS.get(server_id)
    if not server_info:
        print(f"{Colors.RED}Error: Unknown server ID: {server_id}{Colors.ENDC}")
        return False

    # Check if the server is running
    is_running, pid = check_server_status(server_id)
    if not is_running:
        print(f"{Colors.YELLOW}Server {server_info['name']} is not running{Colors.ENDC}")
        return False

    # Stop the server
    print(f"{Colors.BLUE}Stopping {server_info['name']}...{Colors.ENDC}")

    if pid:
        try:
            # Try to terminate the process gracefully
            os.kill(pid, signal.SIGTERM)

            # Wait for the process to terminate
            for _ in range(5):
                if not psutil.pid_exists(pid):
                    break
                time.sleep(1)

            # If the process is still running, force kill it
            if psutil.pid_exists(pid):
                os.kill(pid, signal.SIGKILL)

            print(f"{Colors.GREEN}Server {server_info['name']} stopped successfully{Colors.ENDC}")
            return True
        except Exception as e:
            print(f"{Colors.RED}Error stopping {server_info['name']}: {str(e)}{Colors.ENDC}")
            return False
    else:
        print(f"{Colors.YELLOW}Could not find PID for {server_info['name']}, trying to kill by port{Colors.ENDC}")
        try:
            # Try to find and kill the process by port
            for proc in psutil.process_iter(['pid', 'connections']):
                try:
                    for conn in proc.connections():
                        if conn.laddr.port == server_info['port']:
                            proc.terminate()
                            proc.wait(5)
                            print(f"{Colors.GREEN}Server {server_info['name']} stopped successfully{Colors.ENDC}")
                            return True
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass

            print(f"{Colors.RED}Could not find process for {server_info['name']}{Colors.ENDC}")
            return False
        except Exception as e:
            print(f"{Colors.RED}Error stopping {server_info['name']}: {str(e)}{Colors.ENDC}")
            return False


def list_servers() -> None:
    """
    List all servers and their status.
    """
    print(f"\n{Colors.BOLD}MCP Servers:{Colors.ENDC}")
    print(f"{Colors.BOLD}{'ID':<10} {'Name':<20} {'Status':<10} {'Port':<10}{Colors.ENDC}")
    print("-" * 50)

    for server_id, server_info in MCP_SERVERS.items():
        is_running, pid = check_server_status(server_id)
        status = f"{Colors.GREEN}Running{Colors.ENDC}" if is_running else f"{Colors.RED}Stopped{Colors.ENDC}"
        pid_info = f" (PID: {pid})" if is_running and pid else ""

        print(f"{server_id:<10} {server_info['name']:<20} {status:<10} {server_info['port']:<10}{pid_info}")


def start_all_servers(env: Optional[Dict[str, str]] = None) -> Dict[str, subprocess.Popen]:
    """
    Start all servers.

    Args:
        env: Optional environment variables to pass to the servers

    Returns:
        A dictionary of server IDs to subprocess.Popen objects
    """
    processes = {}

    # Start servers in order of dependencies
    for server_id, server_info in MCP_SERVERS.items():
        # Start dependencies first
        for dep_id in server_info.get("depends_on", []):
            if dep_id not in processes:
                process = start_server(dep_id, env)
                if process:
                    processes[dep_id] = process

        # Start the server
        process = start_server(server_id, env)
        if process:
            processes[server_id] = process

    return processes


def stop_all_servers() -> None:
    """
    Stop all running servers.
    """
    # Stop servers in reverse order of dependencies
    for server_id in reversed(list(MCP_SERVERS.keys())):
        stop_server(server_id)


def main() -> None:
    """
    Main entry point.
    """
    parser = argparse.ArgumentParser(description="Manage MCP servers for ESC-APE")

    # Create subparsers for different commands
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Start command
    start_parser = subparsers.add_parser("start", help="Start servers")
    start_parser.add_argument("server_id", nargs="?", help="ID of the server to start (omit to start all)")

    # Stop command
    stop_parser = subparsers.add_parser("stop", help="Stop servers")
    stop_parser.add_argument("server_id", nargs="?", help="ID of the server to stop (omit to stop all)")

    # Status command
    subparsers.add_parser("status", help="Check server status")

    # Parse arguments
    args = parser.parse_args()

    # Handle commands
    if args.command == "start":
        if args.server_id:
            start_server(args.server_id)
        else:
            start_all_servers()
    elif args.command == "stop":
        if args.server_id:
            stop_server(args.server_id)
        else:
            stop_all_servers()
    elif args.command == "status":
        list_servers()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
