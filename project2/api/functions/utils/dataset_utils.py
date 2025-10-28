"""
Utility functions for data loading and processing.
Centralizes common functionality used across multiple functions.
"""

import os
import pandas as pd
from pathlib import Path


def load_dataset(filename="All_Diets.csv"):
    """
    Load dataset from Azure Blob Storage or local filesystem.
    Falls back to local if blob storage is not configured.

    Args:
        filename: Name of the CSV file to load (default: "All_Diets.csv")

    Returns:
        pandas.DataFrame: The loaded dataset
    """
    # Try to load from Azure Blob Storage first
    if os.getenv("AZURE_STORAGE_CONNECTION_STRING"):
        try:
            from ..blob_storage import read_csv_from_blob

            return read_csv_from_blob(filename)
        except Exception as e:
            pass

    # Fallback to local filesystem
    csv_path = Path(__file__).parent.parent / "datasets" / filename
    return pd.read_csv(csv_path)


def filter_by_diet_type(df, diet_type="all"):
    """
    Filter dataframe by diet type.

    Args:
        df: pandas DataFrame to filter
        diet_type: Diet type to filter by (default: "all" for no filtering)

    Returns:
        pandas.DataFrame: Filtered dataframe, or empty dataframe if no matches found
    """
    if diet_type.lower() == "all":
        return df

    filtered_df = df[df["Diet_type"].str.lower() == diet_type.lower()]
    return filtered_df
