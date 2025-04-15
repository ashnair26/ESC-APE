#!/usr/bin/env python3
"""
BASE blockchain client implementation for the ESCAPE Creator Engine.
"""

import json
import logging
from typing import Any, Dict, List, Optional, Union, Tuple
from dataclasses import dataclass
from decimal import Decimal

from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_account import Account
from eth_account.signers.local import LocalAccount
from mcp.server.fastmcp import Context

from core.utils import get_env_var, format_error_message
from core.secrets import get_secret

# Configure logging
logger = logging.getLogger(__name__)

# BASE blockchain network configurations
NETWORK_CONFIGS = {
    "mainnet": {
        "rpc_url": "https://mainnet.base.org",
        "chain_id": 8453,
        "explorer_url": "https://basescan.org"
    },
    "sepolia": {
        "rpc_url": "https://sepolia.base.org",
        "chain_id": 84532,
        "explorer_url": "https://sepolia.basescan.org"
    },
    "goerli": {
        "rpc_url": "https://goerli.base.org",
        "chain_id": 84531,
        "explorer_url": "https://goerli.basescan.org"
    }
}


@dataclass
class BaseClient:
    """
    Client for interacting with the BASE blockchain.
    """
    
    rpc_url: str
    chain_id: int
    explorer_url: str
    private_key: Optional[str] = None
    account: Optional[LocalAccount] = None
    
    def __post_init__(self):
        """
        Initialize the Web3 provider and account.
        """
        # Initialize Web3 provider
        self.web3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Add PoA middleware for BASE
        self.web3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        # Initialize account if private key is provided
        if self.private_key:
            self.account = Account.from_key(self.private_key)
    
    @classmethod
    async def from_env(cls, network: str = "mainnet", creator_id: Optional[str] = None) -> "BaseClient":
        """
        Create a BaseClient from environment variables and secrets manager.
        
        Args:
            network: The BASE network to connect to (mainnet, sepolia, goerli).
            creator_id: The ID of the creator to get secrets for.
            
        Returns:
            A BaseClient instance.
            
        Raises:
            ValueError: If the network is not supported or required environment variables are not set.
        """
        # Check if the network is supported
        if network not in NETWORK_CONFIGS:
            raise ValueError(f"Unsupported network: {network}. Supported networks: {', '.join(NETWORK_CONFIGS.keys())}")
        
        # Get network configuration
        network_config = NETWORK_CONFIGS[network]
        
        # Get RPC URL from environment variables or use default
        rpc_url_env_var = f"BASE_{network.upper()}_RPC_URL"
        rpc_url = get_env_var(rpc_url_env_var, network_config["rpc_url"])
        
        # Try to get the private key from the secrets manager first
        private_key_name = f"BASE_{network.upper()}_PRIVATE_KEY"
        private_key = await get_secret(private_key_name, creator_id)
        
        # If the private key is not in the secrets manager, try to get it from environment variables
        if private_key is None:
            private_key = get_env_var(private_key_name, None)
        
        return cls(
            rpc_url=rpc_url,
            chain_id=network_config["chain_id"],
            explorer_url=network_config["explorer_url"],
            private_key=private_key
        )
    
    def get_balance(self, address: str) -> Decimal:
        """
        Get the ETH balance of an address.
        
        Args:
            address: The Ethereum address to check.
            
        Returns:
            The ETH balance in Ether.
            
        Raises:
            ValueError: If the address is invalid.
        """
        # Check if the address is valid
        if not self.web3.is_address(address):
            raise ValueError(f"Invalid Ethereum address: {address}")
        
        # Get the balance in Wei
        balance_wei = self.web3.eth.get_balance(address)
        
        # Convert Wei to Ether
        balance_eth = self.web3.from_wei(balance_wei, "ether")
        
        return Decimal(str(balance_eth))
    
    def get_transaction(self, tx_hash: str) -> Dict[str, Any]:
        """
        Get transaction details by hash.
        
        Args:
            tx_hash: The transaction hash.
            
        Returns:
            The transaction details.
            
        Raises:
            ValueError: If the transaction hash is invalid.
            Exception: If the transaction is not found.
        """
        # Check if the transaction hash is valid
        if not tx_hash.startswith("0x") or len(tx_hash) != 66:
            raise ValueError(f"Invalid transaction hash: {tx_hash}")
        
        # Get the transaction
        tx = self.web3.eth.get_transaction(tx_hash)
        
        if tx is None:
            raise Exception(f"Transaction not found: {tx_hash}")
        
        # Get the transaction receipt
        receipt = self.web3.eth.get_transaction_receipt(tx_hash)
        
        # Combine transaction and receipt data
        tx_data = {
            "hash": tx_hash,
            "from": tx["from"],
            "to": tx["to"],
            "value": self.web3.from_wei(tx["value"], "ether"),
            "gas": tx["gas"],
            "gas_price": self.web3.from_wei(tx["gasPrice"], "gwei"),
            "nonce": tx["nonce"],
            "block_number": tx["blockNumber"],
            "block_hash": tx["blockHash"].hex() if tx["blockHash"] else None,
            "status": receipt["status"] if receipt else None,
            "gas_used": receipt["gasUsed"] if receipt else None,
            "effective_gas_price": self.web3.from_wei(receipt["effectiveGasPrice"], "gwei") if receipt and "effectiveGasPrice" in receipt else None,
            "logs": receipt["logs"] if receipt else [],
            "transaction_index": tx["transactionIndex"],
            "explorer_url": f"{self.explorer_url}/tx/{tx_hash}"
        }
        
        return tx_data
    
    def get_block(self, block_identifier: Union[int, str]) -> Dict[str, Any]:
        """
        Get block details by number or hash.
        
        Args:
            block_identifier: The block number or hash.
            
        Returns:
            The block details.
            
        Raises:
            ValueError: If the block identifier is invalid.
            Exception: If the block is not found.
        """
        try:
            # Get the block
            block = self.web3.eth.get_block(block_identifier, full_transactions=True)
            
            if block is None:
                raise Exception(f"Block not found: {block_identifier}")
            
            # Format the block data
            block_data = {
                "number": block["number"],
                "hash": block["hash"].hex(),
                "parent_hash": block["parentHash"].hex(),
                "nonce": block["nonce"].hex() if block["nonce"] else None,
                "sha3_uncles": block["sha3Uncles"].hex(),
                "logs_bloom": block["logsBloom"].hex(),
                "transactions_root": block["transactionsRoot"].hex(),
                "state_root": block["stateRoot"].hex(),
                "receipts_root": block["receiptsRoot"].hex(),
                "miner": block["miner"],
                "difficulty": block["difficulty"],
                "total_difficulty": block["totalDifficulty"],
                "size": block["size"],
                "extra_data": block["extraData"].hex(),
                "gas_limit": block["gasLimit"],
                "gas_used": block["gasUsed"],
                "timestamp": block["timestamp"],
                "transaction_count": len(block["transactions"]),
                "transactions": [tx["hash"].hex() for tx in block["transactions"]],
                "explorer_url": f"{self.explorer_url}/block/{block['number']}"
            }
            
            return block_data
        except ValueError as e:
            raise ValueError(f"Invalid block identifier: {block_identifier}. Error: {str(e)}")
        except Exception as e:
            raise Exception(f"Error getting block {block_identifier}: {str(e)}")
    
    def get_contract_abi(self, contract_address: str) -> List[Dict[str, Any]]:
        """
        Get the ABI for a contract.
        
        This is a placeholder method. In a real implementation, you would
        fetch the ABI from a service like Etherscan or a local database.
        
        Args:
            contract_address: The contract address.
            
        Returns:
            The contract ABI.
            
        Raises:
            NotImplementedError: This method is not implemented.
        """
        # This is a placeholder. In a real implementation, you would
        # fetch the ABI from a service like Etherscan or a local database.
        raise NotImplementedError("Contract ABI retrieval is not implemented")
    
    def get_contract(self, contract_address: str, abi: List[Dict[str, Any]]) -> Any:
        """
        Get a contract instance.
        
        Args:
            contract_address: The contract address.
            abi: The contract ABI.
            
        Returns:
            The contract instance.
            
        Raises:
            ValueError: If the contract address is invalid.
        """
        # Check if the address is valid
        if not self.web3.is_address(contract_address):
            raise ValueError(f"Invalid contract address: {contract_address}")
        
        # Create the contract instance
        contract = self.web3.eth.contract(address=contract_address, abi=abi)
        
        return contract
    
    def call_contract_function(
        self, 
        contract_address: str, 
        abi: List[Dict[str, Any]], 
        function_name: str, 
        function_args: List[Any] = None
    ) -> Any:
        """
        Call a contract function.
        
        Args:
            contract_address: The contract address.
            abi: The contract ABI.
            function_name: The function name.
            function_args: The function arguments.
            
        Returns:
            The function result.
            
        Raises:
            ValueError: If the contract address is invalid.
            Exception: If the function call fails.
        """
        # Get the contract instance
        contract = self.get_contract(contract_address, abi)
        
        # Get the function
        function = getattr(contract.functions, function_name)
        
        if function is None:
            raise ValueError(f"Function {function_name} not found in contract {contract_address}")
        
        # Call the function
        try:
            if function_args:
                result = function(*function_args).call()
            else:
                result = function().call()
            
            return result
        except Exception as e:
            raise Exception(f"Error calling function {function_name}: {str(e)}")
    
    def send_transaction(
        self, 
        to_address: str, 
        value_eth: Union[float, Decimal], 
        gas_limit: Optional[int] = None,
        gas_price_gwei: Optional[Union[float, Decimal]] = None,
        nonce: Optional[int] = None,
        data: Optional[str] = None
    ) -> str:
        """
        Send a transaction.
        
        Args:
            to_address: The recipient address.
            value_eth: The amount to send in Ether.
            gas_limit: The gas limit.
            gas_price_gwei: The gas price in Gwei.
            nonce: The nonce.
            data: The transaction data.
            
        Returns:
            The transaction hash.
            
        Raises:
            ValueError: If the address is invalid or the account is not initialized.
            Exception: If the transaction fails.
        """
        # Check if the account is initialized
        if not self.account:
            raise ValueError("Account not initialized. Private key is required for sending transactions.")
        
        # Check if the address is valid
        if not self.web3.is_address(to_address):
            raise ValueError(f"Invalid Ethereum address: {to_address}")
        
        # Convert Ether to Wei
        value_wei = self.web3.to_wei(value_eth, "ether")
        
        # Get the gas price if not provided
        if gas_price_gwei is None:
            gas_price_wei = self.web3.eth.gas_price
        else:
            gas_price_wei = self.web3.to_wei(gas_price_gwei, "gwei")
        
        # Get the nonce if not provided
        if nonce is None:
            nonce = self.web3.eth.get_transaction_count(self.account.address)
        
        # Build the transaction
        tx = {
            "from": self.account.address,
            "to": to_address,
            "value": value_wei,
            "gasPrice": gas_price_wei,
            "nonce": nonce,
            "chainId": self.chain_id
        }
        
        # Add gas limit if provided
        if gas_limit:
            tx["gas"] = gas_limit
        else:
            # Estimate gas
            tx["gas"] = self.web3.eth.estimate_gas(tx)
        
        # Add data if provided
        if data:
            tx["data"] = data
        
        # Sign the transaction
        signed_tx = self.account.sign_transaction(tx)
        
        # Send the transaction
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        return tx_hash.hex()
    
    def send_contract_transaction(
        self, 
        contract_address: str, 
        abi: List[Dict[str, Any]], 
        function_name: str, 
        function_args: List[Any] = None,
        value_eth: Union[float, Decimal] = 0, 
        gas_limit: Optional[int] = None,
        gas_price_gwei: Optional[Union[float, Decimal]] = None,
        nonce: Optional[int] = None
    ) -> str:
        """
        Send a contract transaction.
        
        Args:
            contract_address: The contract address.
            abi: The contract ABI.
            function_name: The function name.
            function_args: The function arguments.
            value_eth: The amount to send in Ether.
            gas_limit: The gas limit.
            gas_price_gwei: The gas price in Gwei.
            nonce: The nonce.
            
        Returns:
            The transaction hash.
            
        Raises:
            ValueError: If the contract address is invalid or the account is not initialized.
            Exception: If the transaction fails.
        """
        # Check if the account is initialized
        if not self.account:
            raise ValueError("Account not initialized. Private key is required for sending transactions.")
        
        # Get the contract instance
        contract = self.get_contract(contract_address, abi)
        
        # Get the function
        function = getattr(contract.functions, function_name)
        
        if function is None:
            raise ValueError(f"Function {function_name} not found in contract {contract_address}")
        
        # Build the function call
        if function_args:
            function_call = function(*function_args)
        else:
            function_call = function()
        
        # Convert Ether to Wei
        value_wei = self.web3.to_wei(value_eth, "ether")
        
        # Get the gas price if not provided
        if gas_price_gwei is None:
            gas_price_wei = self.web3.eth.gas_price
        else:
            gas_price_wei = self.web3.to_wei(gas_price_gwei, "gwei")
        
        # Get the nonce if not provided
        if nonce is None:
            nonce = self.web3.eth.get_transaction_count(self.account.address)
        
        # Build the transaction
        tx = {
            "from": self.account.address,
            "value": value_wei,
            "gasPrice": gas_price_wei,
            "nonce": nonce,
            "chainId": self.chain_id
        }
        
        # Add gas limit if provided
        if gas_limit:
            tx["gas"] = gas_limit
        
        # Build the transaction
        tx_data = function_call.build_transaction(tx)
        
        # Sign the transaction
        signed_tx = self.account.sign_transaction(tx_data)
        
        # Send the transaction
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        return tx_hash.hex()
    
    def get_gas_price(self) -> Tuple[Decimal, Decimal, Decimal]:
        """
        Get the current gas price.
        
        Returns:
            A tuple of (slow, average, fast) gas prices in Gwei.
        """
        # Get the current gas price
        gas_price_wei = self.web3.eth.gas_price
        
        # Convert Wei to Gwei
        gas_price_gwei = Decimal(str(self.web3.from_wei(gas_price_wei, "gwei")))
        
        # Calculate slow, average, and fast gas prices
        slow = gas_price_gwei * Decimal("0.8")
        average = gas_price_gwei
        fast = gas_price_gwei * Decimal("1.2")
        
        return (slow, average, fast)
    
    def get_transaction_count(self, address: str) -> int:
        """
        Get the transaction count (nonce) for an address.
        
        Args:
            address: The Ethereum address.
            
        Returns:
            The transaction count.
            
        Raises:
            ValueError: If the address is invalid.
        """
        # Check if the address is valid
        if not self.web3.is_address(address):
            raise ValueError(f"Invalid Ethereum address: {address}")
        
        # Get the transaction count
        return self.web3.eth.get_transaction_count(address)
    
    def is_contract(self, address: str) -> bool:
        """
        Check if an address is a contract.
        
        Args:
            address: The Ethereum address.
            
        Returns:
            True if the address is a contract, False otherwise.
            
        Raises:
            ValueError: If the address is invalid.
        """
        # Check if the address is valid
        if not self.web3.is_address(address):
            raise ValueError(f"Invalid Ethereum address: {address}")
        
        # Get the code at the address
        code = self.web3.eth.get_code(address)
        
        # If the code is empty, it's not a contract
        return code != b"0x" and code != b""
    
    def get_logs(
        self, 
        address: Optional[str] = None, 
        topics: Optional[List[str]] = None, 
        from_block: Optional[int] = None, 
        to_block: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get logs from the blockchain.
        
        Args:
            address: The contract address.
            topics: The log topics.
            from_block: The starting block.
            to_block: The ending block.
            
        Returns:
            The logs.
            
        Raises:
            ValueError: If the address is invalid.
        """
        # Check if the address is valid
        if address and not self.web3.is_address(address):
            raise ValueError(f"Invalid Ethereum address: {address}")
        
        # Build the filter
        filter_params = {}
        
        if address:
            filter_params["address"] = address
        
        if topics:
            filter_params["topics"] = topics
        
        if from_block:
            filter_params["fromBlock"] = from_block
        
        if to_block:
            filter_params["toBlock"] = to_block
        
        # Get the logs
        logs = self.web3.eth.get_logs(filter_params)
        
        # Format the logs
        formatted_logs = []
        for log in logs:
            formatted_log = {
                "address": log["address"],
                "topics": [topic.hex() for topic in log["topics"]],
                "data": log["data"],
                "block_number": log["blockNumber"],
                "transaction_hash": log["transactionHash"].hex(),
                "transaction_index": log["transactionIndex"],
                "block_hash": log["blockHash"].hex(),
                "log_index": log["logIndex"],
                "removed": log["removed"]
            }
            formatted_logs.append(formatted_log)
        
        return formatted_logs


async def get_base_client(
    ctx: Optional[Context] = None, 
    network: str = "mainnet", 
    creator_id: Optional[str] = None
) -> BaseClient:
    """
    Get a BASE blockchain client from environment variables and secrets manager.
    
    Args:
        ctx: Optional MCP Context for logging.
        network: The BASE network to connect to (mainnet, sepolia, goerli).
        creator_id: The ID of the creator to get secrets for.
        
    Returns:
        A BaseClient instance.
        
    Raises:
        ValueError: If the network is not supported or required environment variables are not set.
    """
    try:
        return await BaseClient.from_env(network, creator_id)
    except ValueError as e:
        if ctx:
            ctx.error(str(e))
        raise
