"""
Azure Key Vault utility for retrieving secrets securely
"""

import os
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient


def get_keyvault_client():
    """
    Get Azure Key Vault Secret Client using DefaultAzureCredential

    Returns:
        SecretClient: Authenticated Key Vault client

    Raises:
        ValueError: If AZURE_KEYVAULT_URL environment variable is not set
    """
    keyvault_url = os.getenv("AZURE_KEYVAULT_URL")
    if not keyvault_url:
        raise ValueError("AZURE_KEYVAULT_URL environment variable not set")

    credential = DefaultAzureCredential()
    return SecretClient(vault_url=keyvault_url, credential=credential)


def get_secret(secret_name: str) -> str:
    """
    Retrieve a secret from Azure Key Vault

    Converts underscores to hyphens for Key Vault naming convention
    (e.g., AZURE_STORAGE_CONNECTION_STRING -> AZURE-STORAGE-CONNECTION-STRING)

    Args:
        secret_name: Name of the secret to retrieve (can use underscores or hyphens)

    Returns:
        str: The secret value

    Raises:
        ValueError: If Key Vault URL is not configured
        Exception: If secret retrieval fails
    """
    try:
        client = get_keyvault_client()
        # Convert underscores to hyphens for Key Vault naming convention
        keyvault_secret_name = secret_name.replace("_", "-")
        secret = client.get_secret(keyvault_secret_name)
        return secret.value
    except Exception as e:
        raise Exception(
            f"Failed to retrieve secret '{secret_name}' from Key Vault: {str(e)}"
        )


def get_secret_with_fallback(
    secret_name: str, env_var_name: str = None, default: str = None
) -> str:
    """
    Retrieve a secret from Key Vault with fallback to environment variable or default value

    Converts underscores to hyphens for Key Vault naming convention

    Priority order:
    1. Azure Key Vault secret (with underscore->hyphen conversion)
    2. Environment variable (if env_var_name provided)
    3. Default value (if provided)
    4. Raise exception

    Args:
        secret_name: Name of the secret in Key Vault (can use underscores)
        env_var_name: Optional environment variable name for fallback
        default: Optional default value

    Returns:
        str: The secret value
    """
    try:
        # Try Key Vault first
        return get_secret(secret_name)
    except Exception as e:
        keyvault_secret_name = secret_name.replace("_", "-")
        print(
            f"[KEY VAULT] Warning: Could not retrieve '{keyvault_secret_name}' from Key Vault: {str(e)}"
        )

        # Fallback to environment variable
        if env_var_name:
            env_value = os.getenv(env_var_name)
            if env_value:
                print(
                    f"[KEY VAULT] Using fallback environment variable: {env_var_name}"
                )
                return env_value

        # Fallback to default
        if default is not None:
            print(f"[KEY VAULT] Using default value for '{secret_name}'")
            return default

        # No fallback available
        raise ValueError(
            f"Could not retrieve secret '{secret_name}' from Key Vault or environment"
        )
