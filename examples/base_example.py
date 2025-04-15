#!/usr/bin/env python3
"""
Example usage of the BASE blockchain MCP server.
"""

import asyncio
import json
from typing import Dict, Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def run_example():
    """Run the example."""
    # Create server parameters for stdio connection
    server_params = StdioServerParameters(
        command="python",  # Executable
        args=["-m", "servers.base.server"],  # Module to run
        env=None,  # Use current environment variables
    )
    
    print("Connecting to BASE Blockchain MCP server...")
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            
            print("Connected to BASE Blockchain MCP server!")
            
            # List available tools
            tools = await session.list_tools()
            print(f"\nAvailable tools: {[tool.name for tool in tools]}")
            
            # Example: Get ETH balance
            print("\n--- Getting ETH balance ---")
            balance_result = await session.call_tool(
                "base_get_balance",
                arguments={
                    "address": "0x1234567890123456789012345678901234567890",
                    "network": "sepolia"  # Use testnet for examples
                }
            )
            print_json(balance_result)
            
            # Example: Get transaction details
            print("\n--- Getting transaction details ---")
            tx_result = await session.call_tool(
                "base_get_transaction",
                arguments={
                    "tx_hash": "0x1234567890123456789012345678901234567890123456789012345678901234",
                    "network": "sepolia"
                }
            )
            print_json(tx_result)
            
            # Example: Get block details
            print("\n--- Getting block details ---")
            block_result = await session.call_tool(
                "base_get_block",
                arguments={
                    "block_identifier": "latest",
                    "network": "sepolia"
                }
            )
            print_json(block_result)
            
            # Example: Call a contract function
            print("\n--- Calling a contract function ---")
            # ERC-20 token ABI (partial)
            erc20_abi = json.dumps([
                {
                    "constant": true,
                    "inputs": [],
                    "name": "name",
                    "outputs": [{"name": "", "type": "string"}],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "symbol",
                    "outputs": [{"name": "", "type": "string"}],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "decimals",
                    "outputs": [{"name": "", "type": "uint8"}],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [{"name": "_owner", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"name": "balance", "type": "uint256"}],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                }
            ])
            
            call_result = await session.call_tool(
                "base_call_contract_function",
                arguments={
                    "contract_address": "0x1234567890123456789012345678901234567890",
                    "abi": erc20_abi,
                    "function_name": "symbol",
                    "network": "sepolia"
                }
            )
            print_json(call_result)
            
            # Example: Get gas price
            print("\n--- Getting gas price ---")
            gas_result = await session.call_tool(
                "base_get_gas_price",
                arguments={
                    "network": "sepolia"
                }
            )
            print_json(gas_result)
            
            # Example: Check if address is a contract
            print("\n--- Checking if address is a contract ---")
            contract_result = await session.call_tool(
                "base_is_contract",
                arguments={
                    "address": "0x1234567890123456789012345678901234567890",
                    "network": "sepolia"
                }
            )
            print_json(contract_result)
            
            # Example: Get logs
            print("\n--- Getting logs ---")
            logs_result = await session.call_tool(
                "base_get_logs",
                arguments={
                    "address": "0x1234567890123456789012345678901234567890",
                    "from_block": 1000000,
                    "to_block": 1000100,
                    "network": "sepolia"
                }
            )
            print_json(logs_result)
            
            # Note: The following examples require a private key and would send actual transactions
            # They are commented out for safety
            
            """
            # Example: Send a transaction
            print("\n--- Sending a transaction ---")
            send_result = await session.call_tool(
                "base_send_transaction",
                arguments={
                    "to_address": "0x1234567890123456789012345678901234567890",
                    "value_eth": "0.001",
                    "network": "sepolia"
                }
            )
            print_json(send_result)
            
            # Example: Send a contract transaction
            print("\n--- Sending a contract transaction ---")
            contract_tx_result = await session.call_tool(
                "base_send_contract_transaction",
                arguments={
                    "contract_address": "0x1234567890123456789012345678901234567890",
                    "abi": erc20_abi,
                    "function_name": "transfer",
                    "function_args": json.dumps(["0x1234567890123456789012345678901234567890", "1000000000000000000"]),
                    "network": "sepolia"
                }
            )
            print_json(contract_tx_result)
            """


def print_json(data: str):
    """Print JSON data in a readable format."""
    try:
        parsed = json.loads(data)
        print(json.dumps(parsed, indent=2))
    except json.JSONDecodeError:
        print(data)


if __name__ == "__main__":
    asyncio.run(run_example())
