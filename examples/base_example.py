#!/usr/bin/env python3
"""
Example usage of the BASE blockchain MCP server.
"""

import asyncio
import json
from typing import Dict, Any, List

from core.utils import chunk_data, reassemble_chunks

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

            # Check if the response is chunked
            block_result_json = json.loads(block_result)
            if block_result_json.get("chunked"):
                print(f"Block data is too large, split into {block_result_json['total_chunks']} chunks")
                print(block_result_json["message"])

                # Retrieve all chunks
                chunks = []
                for i in range(block_result_json["total_chunks"]):
                    print(f"Retrieving chunk {i+1} of {block_result_json['total_chunks']}...")
                    chunk_result = await session.call_tool(
                        "base_get_block",
                        arguments={
                            "block_identifier": "latest",
                            "network": "sepolia",
                            "chunk_index": i,
                            "total_chunks": block_result_json["total_chunks"]
                        }
                    )
                    chunk_data = json.loads(chunk_result)["data"]
                    chunks.append(chunk_data)

                # Reassemble the chunks
                complete_data = reassemble_chunks(chunks)
                print("Reassembled block data:")
                print_json(json.dumps(complete_data))
            else:
                print_json(block_result)

            # Example: Call a contract function
            print("\n--- Calling a contract function ---")
            # ERC-20 token ABI (partial)
            erc20_abi = json.dumps([
                {
                    "constant": True,
                    "inputs": [],
                    "name": "name",
                    "outputs": [{"name": "", "type": "string"}],
                    "payable": False,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": True,
                    "inputs": [],
                    "name": "symbol",
                    "outputs": [{"name": "", "type": "string"}],
                    "payable": False,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": True,
                    "inputs": [],
                    "name": "decimals",
                    "outputs": [{"name": "", "type": "uint8"}],
                    "payable": False,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": True,
                    "inputs": [{"name": "_owner", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"name": "balance", "type": "uint256"}],
                    "payable": False,
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

            # Example: Call a contract function with a large ABI (chunked)
            print("\n--- Calling a contract function with a large ABI (chunked) ---")
            # Generate a large ABI for demonstration purposes
            large_abi = []
            for i in range(1000):  # Create a large ABI with 1000 functions
                large_abi.append({
                    "constant": True,
                    "inputs": [],
                    "name": f"function{i}",
                    "outputs": [{"name": "", "type": "uint256"}],
                    "payable": False,
                    "stateMutability": "view",
                    "type": "function"
                })

            # Add the actual function we want to call
            large_abi.append({
                "constant": True,
                "inputs": [],
                "name": "symbol",
                "outputs": [{"name": "", "type": "string"}],
                "payable": False,
                "stateMutability": "view",
                "type": "function"
            })

            # Convert to JSON string
            large_abi_json = json.dumps(large_abi)

            # Chunk the ABI
            abi_chunks = chunk_data(large_abi_json, chunk_size=10000)  # 10KB chunks
            print(f"Large ABI size: {len(large_abi_json)} bytes, split into {len(abi_chunks)} chunks")

            # Send each chunk
            for i, chunk in enumerate(abi_chunks):
                print(f"Sending ABI chunk {i+1} of {len(abi_chunks)}...")
                chunk_result = await session.call_tool(
                    "base_call_contract_function",
                    arguments={
                        "contract_address": "0x1234567890123456789012345678901234567890",
                        "abi": chunk,
                        "function_name": "symbol",
                        "network": "sepolia",
                        "abi_chunk_index": i,
                        "abi_total_chunks": len(abi_chunks)
                    }
                )
                print_json(chunk_result)

                # If this is the last chunk, the result should be available
                if i == len(abi_chunks) - 1:
                    print("All ABI chunks sent, final result:")
                    print_json(chunk_result)

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
