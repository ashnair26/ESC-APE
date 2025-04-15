#!/usr/bin/env python3
"""
BASE blockchain MCP server implementation for the ESCAPE Creator Engine.
"""

import json
from typing import Dict, List, Optional, Any, Union
from decimal import Decimal

from mcp.server.fastmcp import FastMCP, Context

from core.utils import format_error_message, chunk_data, reassemble_chunks
from servers.base.client import get_base_client

# Initialize the MCP server
mcp = FastMCP("ESCAPE BASE Blockchain Server")


@mcp.tool()
async def base_get_balance(
    ctx: Context,
    address: str,
    network: str = "mainnet",
    creator_id: Optional[str] = None
) -> str:
    """
    Get the ETH balance of an address on the BASE blockchain.

    Args:
        address: The Ethereum address to check
        network: The BASE network to use (mainnet, sepolia, goerli)
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the balance in ETH
    """
    client = await get_base_client(ctx, network, creator_id)

    try:
        balance = client.get_balance(address)
        return json.dumps({"address": address, "balance": str(balance), "network": network})
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error getting balance: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def base_get_transaction(
    ctx: Context,
    tx_hash: str,
    network: str = "mainnet",
    creator_id: Optional[str] = None
) -> str:
    """
    Get transaction details by hash from the BASE blockchain.

    Args:
        tx_hash: The transaction hash
        network: The BASE network to use (mainnet, sepolia, goerli)
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the transaction details
    """
    client = await get_base_client(ctx, network, creator_id)

    try:
        tx_data = client.get_transaction(tx_hash)

        # Convert Decimal objects to strings for JSON serialization
        for key, value in tx_data.items():
            if isinstance(value, Decimal):
                tx_data[key] = str(value)

        return json.dumps(tx_data, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error getting transaction: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def base_get_block(
    ctx: Context,
    block_identifier: Union[int, str],
    network: str = "mainnet",
    creator_id: Optional[str] = None,
    chunk_index: Optional[int] = None,
    total_chunks: Optional[int] = None
) -> str:
    """
    Get block details by number or hash from the BASE blockchain.

    Args:
        block_identifier: The block number or hash
        network: The BASE network to use (mainnet, sepolia, goerli)
        creator_id: The ID of the creator to get secrets for
        chunk_index: The index of the chunk to return (for large responses)
        total_chunks: The total number of chunks (for large responses)

    Returns:
        JSON string containing the block details or a chunk of the details
    """
    # If chunk_index and total_chunks are provided, we're in chunked mode
    chunked_mode = chunk_index is not None and total_chunks is not None

    # If we're not in chunked mode and not requesting a specific chunk,
    # process the request normally
    if not chunked_mode or chunk_index == 0:
        client = await get_base_client(ctx, network, creator_id)

        try:
            # Convert string to int if it's a number
            if isinstance(block_identifier, str) and block_identifier.isdigit():
                block_identifier = int(block_identifier)

            block_data = client.get_block(block_identifier)

            # Convert Decimal objects to strings for JSON serialization
            for key, value in block_data.items():
                if isinstance(value, Decimal):
                    block_data[key] = str(value)

            # If we're not in chunked mode, return the full response
            if not chunked_mode:
                # Check if the response is too large and should be chunked
                json_data = json.dumps(block_data, indent=2)
                if len(json_data) > 100000:  # 100KB threshold
                    chunks = chunk_data(json_data)
                    return json.dumps({
                        "chunked": True,
                        "total_chunks": len(chunks),
                        "message": f"Response is too large ({len(json_data)} bytes). Use chunk_index and total_chunks parameters to retrieve in chunks."
                    })
                else:
                    return json_data
            else:
                # We're in chunked mode and this is the first chunk
                chunks = chunk_data(block_data)
                if chunk_index < len(chunks):
                    return json.dumps({
                        "chunked": True,
                        "chunk_index": chunk_index,
                        "total_chunks": len(chunks),
                        "data": chunks[chunk_index]
                    })
                else:
                    return json.dumps({
                        "error": f"Chunk index {chunk_index} is out of range. Total chunks: {len(chunks)}"
                    })
        except Exception as e:
            error_message = format_error_message(e)
            ctx.error(f"Error getting block: {error_message}")
            return json.dumps({"error": error_message})
    else:
        # We're in chunked mode and requesting a specific chunk
        # We need to get the data first to chunk it
        client = await get_base_client(ctx, network, creator_id)

        try:
            # Convert string to int if it's a number
            if isinstance(block_identifier, str) and block_identifier.isdigit():
                block_identifier = int(block_identifier)

            block_data = client.get_block(block_identifier)

            # Convert Decimal objects to strings for JSON serialization
            for key, value in block_data.items():
                if isinstance(value, Decimal):
                    block_data[key] = str(value)

            # Chunk the data
            chunks = chunk_data(block_data)

            # Return the requested chunk
            if chunk_index < len(chunks):
                return json.dumps({
                    "chunked": True,
                    "chunk_index": chunk_index,
                    "total_chunks": len(chunks),
                    "data": chunks[chunk_index]
                })
            else:
                return json.dumps({
                    "error": f"Chunk index {chunk_index} is out of range. Total chunks: {len(chunks)}"
                })
        except Exception as e:
            error_message = format_error_message(e)
            ctx.error(f"Error getting block: {error_message}")
            return json.dumps({"error": error_message})


@mcp.tool()
async def base_call_contract_function(
    ctx: Context,
    contract_address: str,
    abi: str,
    function_name: str,
    function_args: Optional[str] = None,
    network: str = "mainnet",
    creator_id: Optional[str] = None,
    chunk_index: Optional[int] = None,
    total_chunks: Optional[int] = None,
    abi_chunk_index: Optional[int] = None,
    abi_total_chunks: Optional[int] = None
) -> str:
    """
    Call a contract function on the BASE blockchain.

    Args:
        contract_address: The contract address
        abi: JSON string containing the contract ABI (or a chunk of it)
        function_name: The function name
        function_args: JSON string containing the function arguments
        network: The BASE network to use (mainnet, sepolia, goerli)
        creator_id: The ID of the creator to get secrets for
        chunk_index: The index of the chunk to return (for large responses)
        total_chunks: The total number of chunks (for large responses)
        abi_chunk_index: The index of the ABI chunk (for large ABIs)
        abi_total_chunks: The total number of ABI chunks (for large ABIs)

    Returns:
        JSON string containing the function result or a chunk of the result
    """
    # Check if we're in chunked mode for the ABI
    abi_chunked_mode = abi_chunk_index is not None and abi_total_chunks is not None

    # If we're in chunked mode for the ABI, we need to reassemble it first
    if abi_chunked_mode:
        # Store the ABI chunk in the context
        if not hasattr(ctx, "abi_chunks"):
            ctx.abi_chunks = {}

        # Generate a unique key for this ABI based on contract and function
        abi_key = f"{contract_address}_{function_name}"

        # Initialize the chunks list if it doesn't exist
        if abi_key not in ctx.abi_chunks:
            ctx.abi_chunks[abi_key] = [None] * abi_total_chunks

        # Store the current chunk
        ctx.abi_chunks[abi_key][abi_chunk_index] = abi

        # Check if we have all the chunks
        if None not in ctx.abi_chunks[abi_key]:
            # Reassemble the ABI
            abi = reassemble_chunks(ctx.abi_chunks[abi_key])

            # Clear the chunks to free memory
            del ctx.abi_chunks[abi_key]
        else:
            # We don't have all the chunks yet
            return json.dumps({
                "chunked_abi": True,
                "abi_chunk_index": abi_chunk_index,
                "abi_total_chunks": abi_total_chunks,
                "message": f"Received ABI chunk {abi_chunk_index + 1} of {abi_total_chunks}. Waiting for remaining chunks."
            })

    # Check if we're in chunked mode for the response
    response_chunked_mode = chunk_index is not None and total_chunks is not None

    # If we're not in chunked mode for the response or we're requesting the first chunk,
    # process the request normally
    if not response_chunked_mode or chunk_index == 0:
        client = await get_base_client(ctx, network, creator_id)

        try:
            # Parse the ABI
            try:
                if isinstance(abi, str):
                    parsed_abi = json.loads(abi)
                else:
                    parsed_abi = abi
            except json.JSONDecodeError:
                ctx.error(f"Invalid JSON in ABI: {abi}")
                return json.dumps({"error": "Invalid ABI format"})

            # Parse the function arguments if provided
            parsed_args = None
            if function_args:
                try:
                    parsed_args = json.loads(function_args)
                    if not isinstance(parsed_args, list):
                        parsed_args = [parsed_args]
                except json.JSONDecodeError:
                    ctx.error(f"Invalid JSON in function_args: {function_args}")
                    return json.dumps({"error": "Invalid function_args format"})

            # Call the function
            result = client.call_contract_function(
                contract_address=contract_address,
                abi=parsed_abi,
                function_name=function_name,
                function_args=parsed_args
            )

            # Convert result to JSON-serializable format
            if isinstance(result, (bytes, bytearray)):
                result = "0x" + result.hex()
            elif isinstance(result, Decimal):
                result = str(result)
            elif isinstance(result, (list, tuple)):
                result = [
                    "0x" + item.hex() if isinstance(item, (bytes, bytearray)) else
                    str(item) if isinstance(item, Decimal) else
                    item
                    for item in result
                ]

            # Prepare the response
            response_data = {"result": result}

            # If we're not in chunked mode for the response, check if the response is too large
            if not response_chunked_mode:
                json_data = json.dumps(response_data, indent=2)
                if len(json_data) > 100000:  # 100KB threshold
                    chunks = chunk_data(json_data)
                    return json.dumps({
                        "chunked": True,
                        "total_chunks": len(chunks),
                        "message": f"Response is too large ({len(json_data)} bytes). Use chunk_index and total_chunks parameters to retrieve in chunks."
                    })
                else:
                    return json_data
            else:
                # We're in chunked mode and this is the first chunk
                chunks = chunk_data(response_data)
                if chunk_index < len(chunks):
                    return json.dumps({
                        "chunked": True,
                        "chunk_index": chunk_index,
                        "total_chunks": len(chunks),
                        "data": chunks[chunk_index]
                    })
                else:
                    return json.dumps({
                        "error": f"Chunk index {chunk_index} is out of range. Total chunks: {len(chunks)}"
                    })
        except Exception as e:
            error_message = format_error_message(e)
            ctx.error(f"Error calling contract function: {error_message}")
            return json.dumps({"error": error_message})
    else:
        # We're in chunked mode for the response and requesting a specific chunk
        # We need to get the data first to chunk it
        client = await get_base_client(ctx, network, creator_id)

        try:
            # Parse the ABI
            try:
                if isinstance(abi, str):
                    parsed_abi = json.loads(abi)
                else:
                    parsed_abi = abi
            except json.JSONDecodeError:
                ctx.error(f"Invalid JSON in ABI: {abi}")
                return json.dumps({"error": "Invalid ABI format"})

            # Parse the function arguments if provided
            parsed_args = None
            if function_args:
                try:
                    parsed_args = json.loads(function_args)
                    if not isinstance(parsed_args, list):
                        parsed_args = [parsed_args]
                except json.JSONDecodeError:
                    ctx.error(f"Invalid JSON in function_args: {function_args}")
                    return json.dumps({"error": "Invalid function_args format"})

            # Call the function
            result = client.call_contract_function(
                contract_address=contract_address,
                abi=parsed_abi,
                function_name=function_name,
                function_args=parsed_args
            )

            # Convert result to JSON-serializable format
            if isinstance(result, (bytes, bytearray)):
                result = "0x" + result.hex()
            elif isinstance(result, Decimal):
                result = str(result)
            elif isinstance(result, (list, tuple)):
                result = [
                    "0x" + item.hex() if isinstance(item, (bytes, bytearray)) else
                    str(item) if isinstance(item, Decimal) else
                    item
                    for item in result
                ]

            # Prepare the response
            response_data = {"result": result}

            # Chunk the data
            chunks = chunk_data(response_data)

            # Return the requested chunk
            if chunk_index < len(chunks):
                return json.dumps({
                    "chunked": True,
                    "chunk_index": chunk_index,
                    "total_chunks": len(chunks),
                    "data": chunks[chunk_index]
                })
            else:
                return json.dumps({
                    "error": f"Chunk index {chunk_index} is out of range. Total chunks: {len(chunks)}"
                })
        except Exception as e:
            error_message = format_error_message(e)
            ctx.error(f"Error calling contract function: {error_message}")
            return json.dumps({"error": error_message})


@mcp.tool()
async def base_send_transaction(
    ctx: Context,
    to_address: str,
    value_eth: str,
    gas_limit: Optional[int] = None,
    gas_price_gwei: Optional[str] = None,
    data: Optional[str] = None,
    network: str = "mainnet",
    creator_id: Optional[str] = None
) -> str:
    """
    Send a transaction on the BASE blockchain.

    Args:
        to_address: The recipient address
        value_eth: The amount to send in ETH
        gas_limit: The gas limit
        gas_price_gwei: The gas price in Gwei
        data: The transaction data
        network: The BASE network to use (mainnet, sepolia, goerli)
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the transaction hash
    """
    client = await get_base_client(ctx, network, creator_id)

    try:
        # Convert value_eth to Decimal
        value_eth_decimal = Decimal(value_eth)

        # Convert gas_price_gwei to Decimal if provided
        gas_price_gwei_decimal = None
        if gas_price_gwei:
            gas_price_gwei_decimal = Decimal(gas_price_gwei)

        # Send the transaction
        tx_hash = client.send_transaction(
            to_address=to_address,
            value_eth=value_eth_decimal,
            gas_limit=gas_limit,
            gas_price_gwei=gas_price_gwei_decimal,
            data=data
        )

        return json.dumps({
            "transaction_hash": tx_hash,
            "explorer_url": f"{client.explorer_url}/tx/{tx_hash}"
        }, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error sending transaction: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def base_send_contract_transaction(
    ctx: Context,
    contract_address: str,
    abi: str,
    function_name: str,
    function_args: Optional[str] = None,
    value_eth: str = "0",
    gas_limit: Optional[int] = None,
    gas_price_gwei: Optional[str] = None,
    network: str = "mainnet",
    creator_id: Optional[str] = None
) -> str:
    """
    Send a contract transaction on the BASE blockchain.

    Args:
        contract_address: The contract address
        abi: JSON string containing the contract ABI
        function_name: The function name
        function_args: JSON string containing the function arguments
        value_eth: The amount to send in ETH
        gas_limit: The gas limit
        gas_price_gwei: The gas price in Gwei
        network: The BASE network to use (mainnet, sepolia, goerli)
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the transaction hash
    """
    client = await get_base_client(ctx, network, creator_id)

    try:
        # Parse the ABI
        try:
            parsed_abi = json.loads(abi)
        except json.JSONDecodeError:
            ctx.error(f"Invalid JSON in ABI: {abi}")
            return json.dumps({"error": "Invalid ABI format"})

        # Parse the function arguments if provided
        parsed_args = None
        if function_args:
            try:
                parsed_args = json.loads(function_args)
                if not isinstance(parsed_args, list):
                    parsed_args = [parsed_args]
            except json.JSONDecodeError:
                ctx.error(f"Invalid JSON in function_args: {function_args}")
                return json.dumps({"error": "Invalid function_args format"})

        # Convert value_eth to Decimal
        value_eth_decimal = Decimal(value_eth)

        # Convert gas_price_gwei to Decimal if provided
        gas_price_gwei_decimal = None
        if gas_price_gwei:
            gas_price_gwei_decimal = Decimal(gas_price_gwei)

        # Send the transaction
        tx_hash = client.send_contract_transaction(
            contract_address=contract_address,
            abi=parsed_abi,
            function_name=function_name,
            function_args=parsed_args,
            value_eth=value_eth_decimal,
            gas_limit=gas_limit,
            gas_price_gwei=gas_price_gwei_decimal
        )

        return json.dumps({
            "transaction_hash": tx_hash,
            "explorer_url": f"{client.explorer_url}/tx/{tx_hash}"
        }, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error sending contract transaction: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def base_get_gas_price(
    ctx: Context,
    network: str = "mainnet",
    creator_id: Optional[str] = None
) -> str:
    """
    Get the current gas price on the BASE blockchain.

    Args:
        network: The BASE network to use (mainnet, sepolia, goerli)
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the gas prices in Gwei
    """
    client = await get_base_client(ctx, network, creator_id)

    try:
        slow, average, fast = client.get_gas_price()

        return json.dumps({
            "slow": str(slow),
            "average": str(average),
            "fast": str(fast),
            "unit": "gwei"
        }, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error getting gas price: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def base_is_contract(
    ctx: Context,
    address: str,
    network: str = "mainnet",
    creator_id: Optional[str] = None
) -> str:
    """
    Check if an address is a contract on the BASE blockchain.

    Args:
        address: The Ethereum address to check
        network: The BASE network to use (mainnet, sepolia, goerli)
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the result
    """
    client = await get_base_client(ctx, network, creator_id)

    try:
        is_contract = client.is_contract(address)

        return json.dumps({
            "address": address,
            "is_contract": is_contract
        }, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error checking if address is contract: {error_message}")
        return json.dumps({"error": error_message})


@mcp.tool()
async def base_get_logs(
    ctx: Context,
    address: Optional[str] = None,
    topics: Optional[str] = None,
    from_block: Optional[int] = None,
    to_block: Optional[int] = None,
    network: str = "mainnet",
    creator_id: Optional[str] = None
) -> str:
    """
    Get logs from the BASE blockchain.

    Args:
        address: The contract address
        topics: JSON string containing the log topics
        from_block: The starting block
        to_block: The ending block
        network: The BASE network to use (mainnet, sepolia, goerli)
        creator_id: The ID of the creator to get secrets for

    Returns:
        JSON string containing the logs
    """
    client = await get_base_client(ctx, network, creator_id)

    try:
        # Parse the topics if provided
        parsed_topics = None
        if topics:
            try:
                parsed_topics = json.loads(topics)
            except json.JSONDecodeError:
                ctx.error(f"Invalid JSON in topics: {topics}")
                return json.dumps({"error": "Invalid topics format"})

        # Get the logs
        logs = client.get_logs(
            address=address,
            topics=parsed_topics,
            from_block=from_block,
            to_block=to_block
        )

        return json.dumps({"logs": logs}, indent=2)
    except Exception as e:
        error_message = format_error_message(e)
        ctx.error(f"Error getting logs: {error_message}")
        return json.dumps({"error": error_message})


if __name__ == "__main__":
    # Run the server with stdio transport
    mcp.run()
