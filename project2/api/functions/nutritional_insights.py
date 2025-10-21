import json
import os
import pandas as pd
from pathlib import Path


def get_nutritional_insights(diet_type="all"):
    """
    Get nutritional insights for a specific diet type or all diets.

    Args:
        diet_type: "all", "vegan", "keto", "mediterranean", "paleo", or "dash"

    Returns:
        Dictionary with aggregated nutritional statistics
    """
    try:
        # Get the path to the CSV file
        # The function app runs from project2/api, so we need to go up to project2
        csv_path = Path(__file__).parent.parent.parent / "datasets" / "All_Diets.csv"

        # Read the CSV
        df = pd.read_csv(csv_path)

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
