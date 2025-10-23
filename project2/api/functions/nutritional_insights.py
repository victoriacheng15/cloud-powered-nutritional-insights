import json
import os
import pandas as pd
from pathlib import Path


def load_dataset(filename="All_Diets.csv"):
    """
    Load dataset from Azure Blob Storage or local filesystem.
    Falls back to local if blob storage is not configured.
    """
    # Try to load from Azure Blob Storage first
    if os.getenv("AZURE_STORAGE_CONNECTION_STRING"):
        try:
            from .blob_storage import read_csv_from_blob
            return read_csv_from_blob(filename)
        except Exception as e:
            pass
    
    # Fallback to local filesystem
    csv_path = Path(__file__).parent / "datasets" / filename
    df = pd.read_csv(csv_path)
    return df


def get_nutritional_insights(diet_type="all"):
    """
    Get nutritional insights for a specific diet type or all diets.

    Args:
        diet_type: "all", "vegan", "keto", "mediterranean", "paleo", or "dash"

    Returns:
        Dictionary with aggregated nutritional statistics
    """
    try:
        # Load dataset (from blob or local)
        df = load_dataset("All_Diets.csv")

        # Filter by diet type if specified
        if diet_type.lower() != "all":
            df = df[df["Diet_type"].str.lower() == diet_type.lower()]

        # If no data found, return error
        if len(df) == 0:
            return {
                "error": f"No data found for diet type: {diet_type}",
                "diet_type": diet_type,
                "recipe_count": 0,
            }

        # Calculate aggregated statistics
        stats = {
            "diet_type": diet_type,
            "recipe_count": int(len(df)),
            "protein": {
                "average": round(float(df["Protein(g)"].mean()), 2),
                "min": round(float(df["Protein(g)"].min()), 2),
                "max": round(float(df["Protein(g)"].max()), 2),
            },
            "carbs": {
                "average": round(float(df["Carbs(g)"].mean()), 2),
                "min": round(float(df["Carbs(g)"].min()), 2),
                "max": round(float(df["Carbs(g)"].max()), 2),
            },
            "fat": {
                "average": round(float(df["Fat(g)"].mean()), 2),
                "min": round(float(df["Fat(g)"].min()), 2),
                "max": round(float(df["Fat(g)"].max()), 2),
            },
            "cuisine_types": df["Cuisine_type"].unique().tolist(),
        }

        return stats

    except Exception as e:
        return {"error": str(e), "diet_type": diet_type}
