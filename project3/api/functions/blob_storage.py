"""
Azure Blob Storage utility for reading CSV datasets
"""

import os
import io
import pandas as pd
from azure.storage.blob import BlobServiceClient
from utils.keyvault_utils import get_secret_with_fallback


def get_blob_service_client():
    """
    Get Azure Blob Service Client using connection string from Key Vault or environment

    Priority:
    1. Azure Key Vault (AZURE_STORAGE_CONNECTION_STRING secret)
    2. Environment variable (AZURE_STORAGE_CONNECTION_STRING)
    3. Raise error
    """
    # Try to get connection string from Key Vault with fallback to environment variable
    try:
        connection_string = get_secret_with_fallback(
            "AZURE_STORAGE_CONNECTION_STRING",
            env_var_name="AZURE_STORAGE_CONNECTION_STRING",
        )
    except ValueError:
        raise ValueError(
            "AZURE_STORAGE_CONNECTION_STRING not found in Key Vault or environment variable"
        )

    print("[BLOB STORAGE] Connection string found, connecting to Azure...")
    return BlobServiceClient.from_connection_string(connection_string)


def read_csv_from_blob(
    blob_name: str, container_name: str = "datasets"
) -> pd.DataFrame:
    """
    Read a CSV file from Azure Blob Storage and return as pandas DataFrame

    Args:
        blob_name: Name of the blob file (e.g., "All_Diets.csv")
        container_name: Name of the container (default: "datasets")

    Returns:
        pandas.DataFrame: The CSV data

    Raises:
        ValueError: If connection string is not set
        Exception: If blob download fails
    """
    try:
        blob_service_client = get_blob_service_client()
        blob_client = blob_service_client.get_blob_client(
            container=container_name, blob=blob_name
        )

        # Download blob as bytes
        blob_data = blob_client.download_blob().readall()

        # Read into pandas DataFrame
        df = pd.read_csv(io.BytesIO(blob_data))

        return df

    except Exception as e:
        raise


def list_blobs(container_name: str = "datasets") -> list:
    """
    List all blobs in a container

    Args:
        container_name: Name of the container (default: "datasets")

    Returns:
        list: List of blob names
    """
    try:
        blob_service_client = get_blob_service_client()
        container_client = blob_service_client.get_container_client(container_name)

        blobs = []
        for blob in container_client.list_blobs():
            blobs.append(blob.name)

        return blobs

    except Exception as e:
        raise
