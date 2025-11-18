import os
import pandas as pd
from pathlib import Path
from .utils import load_dataset, filter_by_diet_type


def get_recipes(diet_type="all", page=1, page_size=20):
    """
    Get recipes filtered by diet type with pagination.

    Args:
        diet_type: "all", "vegan", "keto", "mediterranean", "paleo", or "dash"
        page: Page number (1-indexed)
        page_size: Number of recipes per page (default 20)

    Returns:
        Dictionary with paginated recipe list and metadata
    """
    try:
        # Validate pagination parameters
        try:
            page = int(page)
            page_size = int(page_size)
            if page < 1:
                page = 1
            if page_size < 1 or page_size > 100:
                page_size = 20
        except (ValueError, TypeError):
            page = 1
            page_size = 20

        # Load dataset (from blob or local)
        df = load_dataset("All_Diets.csv")

        # Filter by diet type if specified
        df = filter_by_diet_type(df, diet_type)

        # If no data found, return empty list
        if len(df) == 0:
            return {
                "diet_type": diet_type,
                "recipes": [],
                "total_count": 0,
                "page": page,
                "page_size": page_size,
                "total_pages": 0,
                "has_next": False,
                "has_previous": False,
            }

        total_count = len(df)
        total_pages = (total_count + page_size - 1) // page_size

        # Validate page number
        if page > total_pages:
            page = total_pages

        # Calculate start and end indices
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        # Get the page of data
        page_data = df.iloc[start_idx:end_idx]

        # Convert to list of dictionaries
        recipes = []
        for _, row in page_data.iterrows():
            recipe = {
                "recipe_name": row["Recipe_name"],
                "diet_type": row["Diet_type"],
                "cuisine_type": row["Cuisine_type"],
                "protein_g": round(float(row["Protein(g)"]), 2),
                "carbs_g": round(float(row["Carbs(g)"]), 2),
                "fat_g": round(float(row["Fat(g)"]), 2),
                "extraction_day": row["Extraction_day"],
                "extraction_time": row["Extraction_time"],
            }
            recipes.append(recipe)

        return {
            "diet_type": diet_type,
            "recipes": recipes,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1,
        }

    except Exception as e:
        return {
            "error": str(e),
            "diet_type": diet_type,
            "recipes": [],
            "total_count": 0,
        }
