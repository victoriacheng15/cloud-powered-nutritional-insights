"""
Security & Compliance Status Module

This module provides functions to retrieve and manage security and compliance status
for the Nutritional Insights application. It integrates with Azure Key Vault for
secure retrieval of security configuration.
"""

import os
from datetime import datetime
from typing import Dict, Any, Optional
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.core.exceptions import AzureError


def get_key_vault_client() -> Optional[SecretClient]:
    """
    Initialize and return Azure Key Vault client.
    
    Returns:
        Optional[SecretClient]: Key Vault client if configured, None otherwise
    """
    key_vault_name = os.getenv("KEY_VAULT_NAME")
    
    if not key_vault_name:
        return None
    
    try:
        vault_url = f"https://{key_vault_name}.vault.azure.net/"
        credential = DefaultAzureCredential()
        return SecretClient(vault_url=vault_url, credential=credential)
    except AzureError as e:
        print(f"Error connecting to Key Vault: {str(e)}")
        return None


def get_secret_from_vault(client: Optional[SecretClient], secret_name: str) -> Optional[str]:
    """
    Retrieve a secret from Azure Key Vault without fallback.
    
    Args:
        client: SecretClient instance
        secret_name: Name of the secret to retrieve
        
    Returns:
        Optional[str]: Secret value or None if not found or client is None
    """
    if client is None:
        return None
    
    try:
        secret = client.get_secret(secret_name)
        return secret.value
    except AzureError as e:
        print(f"Error retrieving secret {secret_name} from Key Vault: {str(e)}")
        return None




def get_security_status() -> Dict[str, Any]:
    """
    Get the current security status of the application from Azure Key Vault.
    
    Returns a dictionary containing:
    - encryption: Encryption status (Enabled/Disabled)
    - access_control: Access control status (Secure/Compromised)
    - compliance: Compliance status (Compliant/Non-Compliant)
    
    Returns:
        Dict[str, Any]: Security status information
    """
    
    # Initialize Key Vault client
    kv_client = get_key_vault_client()
    
    # If Key Vault not configured, all statuses are "Disabled"
    if kv_client is None:
        return {
            "encryption": "Disabled",
            "access_control": "Disabled",
            "compliance": "Disabled"
        }
    
    # Retrieve security settings from Key Vault
    encryption_enabled_value = get_secret_from_vault(kv_client, "ENCRYPTION_ENABLED")
    https_enforced_value = get_secret_from_vault(kv_client, "HTTPS_ENFORCED")
    gdpr_compliant_value = get_secret_from_vault(kv_client, "GDPR_COMPLIANT")
    
    # If any critical setting is missing, treat as "Disabled"
    encryption_status = (
        "Enabled" if encryption_enabled_value and encryption_enabled_value.lower() == "true"
        else "Disabled"
    )
    
    access_control_status = (
        "Secure" if https_enforced_value and https_enforced_value.lower() == "true"
        else "Compromised" if https_enforced_value
        else "Disabled"
    )
    
    compliance_status = (
        "Compliant" if gdpr_compliant_value and gdpr_compliant_value.lower() == "true"
        else "Non-Compliant" if gdpr_compliant_value
        else "Disabled"
    )
    
    return {
        "encryption": encryption_status,
        "access_control": access_control_status,
        "compliance": compliance_status
    }
