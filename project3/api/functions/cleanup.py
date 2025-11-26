"""
Cloud Resource Cleanup Module

This module provides functions to list and clean up Azure cloud resources
for the Nutritional Insights application using Azure SDK.
"""

import os
from typing import Dict, Any, List
from datetime import datetime
from azure.identity import DefaultAzureCredential
from azure.mgmt.resource import ResourceManagementClient
from .utils import get_secret_with_fallback


def list_resources_in_group() -> Dict[str, Any]:
    """
    List all resources in the resource group.

    Returns:
        Dict[str, Any]: List of resources with their details
    """

    try:
        resource_group = os.getenv("AZURE_RESOURCE_GROUP", "school")

        # Try to get subscription ID from Key Vault first, then env var
        subscription_id = get_secret_with_fallback(
            "AZURE_SUBSCRIPTION_ID", env_var_name="AZURE_SUBSCRIPTION_ID", default=None
        )

        print(f"[CLEANUP] Resource Group: {resource_group}")
        print(f"[CLEANUP] Subscription ID: {subscription_id}")

        # If no subscription ID provided, raise error
        if not subscription_id:
            print("[CLEANUP] No AZURE_SUBSCRIPTION_ID set in Key Vault or environment")
            raise ValueError(
                "AZURE_SUBSCRIPTION_ID not found in Key Vault or environment variable. "
                "Set it in Key Vault as AZURE-SUBSCRIPTION-ID or as AZURE_SUBSCRIPTION_ID env var."
            )

        print(f"[CLEANUP] Listing resources in group: {resource_group}")

        # Use Managed Identity to authenticate
        credential = DefaultAzureCredential()
        client = ResourceManagementClient(credential, subscription_id)

        # Get all resources in the resource group
        resources = client.resources.list_by_resource_group(resource_group)

        resource_list = []
        for resource in resources:
            resource_list.append(
                {
                    "id": resource.id,
                    "name": resource.name,
                    "type": resource.type,
                    "kind": resource.kind or "N/A",
                }
            )

        print(f"[CLEANUP] Found {len(resource_list)} resources")

        return {
            "status": "success",
            "resource_group": resource_group,
            "resources": resource_list,
            "count": len(resource_list),
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        error_msg = str(e)
        print(f"[CLEANUP] Error listing resources: {error_msg}")
        return {
            "status": "error",
            "message": f"Failed to list resources: {error_msg}",
            "timestamp": datetime.utcnow().isoformat(),
        }


def delete_resources(resource_ids: List[str]) -> Dict[str, Any]:
    """
    Delete specific resources by their IDs.

    Args:
        resource_ids: List of resource IDs to delete

    Returns:
        Dict[str, Any]: Deletion status with results
    """

    try:
        if not resource_ids:
            raise ValueError("No resources selected for deletion")

        # Try to get subscription ID from Key Vault first, then env var
        subscription_id = get_secret_with_fallback(
            "AZURE_SUBSCRIPTION_ID", env_var_name="AZURE_SUBSCRIPTION_ID", default=None
        )

        if not subscription_id:
            raise ValueError(
                "AZURE_SUBSCRIPTION_ID not found in Key Vault or environment variable"
            )

        print(f"[CLEANUP] Starting deletion of {len(resource_ids)} resources")

        # Use Managed Identity to authenticate
        credential = DefaultAzureCredential()
        client = ResourceManagementClient(credential, subscription_id)

        deleted_resources = []
        failed_resources = []

        for resource_id in resource_ids:
            try:
                print(f"[CLEANUP] Deleting: {resource_id}")
                # Try with latest API versions first (2025, 2024), fall back to older versions
                api_versions = [
                    "2025-05-01",
                    "2024-12-01-preview",
                    "2024-11-01",
                    "2024-04-01-preview",
                    "2023-07-01",
                    "2021-04-01-preview",
                    "2021-04-01",
                ]
                poller = None

                for api_version in api_versions:
                    try:
                        poller = client.resources.begin_delete_by_id(
                            resource_id, api_version=api_version
                        )
                        print(f"[CLEANUP] Using API version: {api_version}")
                        break
                    except Exception as e:
                        if api_version == api_versions[-1]:
                            raise
                        continue

                if poller:
                    poller.wait()
                    deleted_resources.append(resource_id)
                    print(f"[CLEANUP] Successfully deleted: {resource_id}")
            except Exception as e:
                error = str(e)
                print(f"[CLEANUP] Failed to delete {resource_id}: {error}")
                failed_resources.append({"resource_id": resource_id, "error": error})

        return {
            "status": "success" if not failed_resources else "partial",
            "deleted_count": len(deleted_resources),
            "failed_count": len(failed_resources),
            "deleted_resources": deleted_resources,
            "failed_resources": failed_resources,
            "timestamp": datetime.utcnow().isoformat(),
            "message": f"Deleted {len(deleted_resources)} of {len(resource_ids)} resources",
        }

    except Exception as e:
        error_msg = str(e)
        print(f"[CLEANUP] Error during deletion: {error_msg}")
        return {
            "status": "error",
            "message": f"Error during deletion: {error_msg}",
            "timestamp": datetime.utcnow().isoformat(),
        }
