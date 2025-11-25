"""
Security & Compliance Status Module

This module provides functions to retrieve and manage security and compliance status
for the Nutritional Insights application. It integrates with Azure Key Vault for
secure retrieval of security configuration.
"""

import os
from datetime import datetime
from typing import Dict, Any
from .utils import get_keyvault_client


def get_security_status() -> Dict[str, Any]:
    """
    Get the current security status of the application.
    
    Checks:
    1. Key Vault accessibility (encryption capability)
    2. Storage account configuration (access control)
    3. Required security environment variables (compliance)
    
    Returns a dictionary containing:
    - encryption: Encryption status (Enabled/Disabled)
    - access_control: Access control status (Secure/Compromised)
    - compliance: Compliance status (Compliant/Non-Compliant)
    - timestamp: When the status was checked
    - details: Additional security information
    
    Returns:
        Dict[str, Any]: Security status information
    """
    
    try:
        # Check Key Vault accessibility
        kv_accessible = False
        try:
            client = get_keyvault_client()
            # Try to list secrets to verify access
            list(client.list_properties_of_secrets())
            kv_accessible = True
            print("[SECURITY] Key Vault is accessible")
        except Exception as e:
            print(f"[SECURITY] Key Vault not accessible: {str(e)}")
        
        # Check required environment variables
        keyvault_url = os.getenv("AZURE_KEYVAULT_URL")
        storage_connection = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        
        # Validate that connection string is not a placeholder
        is_storage_valid = (
            storage_connection 
            and storage_connection != "DefaultEndpointsProtocol=https;AccountName=<storage-account>;AccountKey=<account-key>;EndpointSuffix=core.windows.net"
        )
        
        # Determine encryption status (based on Key Vault availability)
        encryption_status = "Enabled" if kv_accessible else "Disabled"
        
        # Determine access control status (based on storage configuration)
        access_control_status = "Secure" if is_storage_valid else "Compromised"
        
        # Determine compliance status: all must be accessible and valid
        compliance_status = "Compliant" if (kv_accessible and keyvault_url and is_storage_valid) else "Non-Compliant"
        
        return {
            "encryption": encryption_status,
            "access_control": access_control_status,
            "compliance": compliance_status,
            "timestamp": datetime.utcnow().isoformat(),
            "details": {
                "keyvault_configured": bool(keyvault_url),
                "keyvault_accessible": kv_accessible,
                "storage_configured": is_storage_valid,
                "security_check": "Completed"
            }
        }
    
    except Exception as e:
        print(f"[SECURITY] Error during security check: {str(e)}")
        return {
            "encryption": "Unknown",
            "access_control": "Unknown",
            "compliance": "Non-Compliant",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e),
            "details": {
                "security_check": "Failed"
            }
        }
