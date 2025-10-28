import os
import pandas as pd
from pathlib import Path
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import json


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
    return pd.read_csv(csv_path)


def get_clusters(diet_type="all", num_clusters=3):
    """
    Get clusters of recipes based on nutritional similarity using K-means clustering.

    Args:
        diet_type: "all", "vegan", "keto", "mediterranean", "paleo", or "dash"
        num_clusters: Number of clusters to create (default 3)

    Returns:
        Dictionary with cluster summaries and metadata
    """
    try:
        # Validate num_clusters parameter
        try:
            num_clusters = int(num_clusters)
            if num_clusters < 1 or num_clusters > 20:
                num_clusters = 3
        except (ValueError, TypeError):
            num_clusters = 3

        # Load dataset (from blob or local)
        df = load_dataset("All_Diets.csv")

        # Filter by diet type if specified
        if diet_type.lower() != "all":
            df = df[df["Diet_type"].str.lower() == diet_type.lower()]

        # If no data found, return empty clusters
        if len(df) == 0:
            return {
                "error": f"No data found for diet type: {diet_type}",
                "diet_type": diet_type,
                "clusters": [],
                "total_recipes": 0,
            }

        # Prepare features for clustering (Protein, Carbs, Fat)
        features = df[["Protein(g)", "Carbs(g)", "Fat(g)"]].values

        # Standardize features (important for K-means)
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)

        # Perform K-means clustering
        kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(features_scaled)

        # Add cluster labels to dataframe
        df["cluster"] = clusters

        # Generate cluster summaries
        cluster_summaries = []
        for cluster_id in range(num_clusters):
            cluster_data = df[df["cluster"] == cluster_id]

            # Calculate statistics for this cluster
            avg_protein = float(cluster_data["Protein(g)"].mean())
            avg_carbs = float(cluster_data["Carbs(g)"].mean())
            avg_fat = float(cluster_data["Fat(g)"].mean())
            recipe_count = len(cluster_data)

            # Generate a descriptive label based on macronutrient profile
            label = generate_cluster_label(avg_protein, avg_carbs, avg_fat)

            summary = {
                "cluster_id": int(cluster_id),
                "label": label,
                "recipe_count": recipe_count,
                "avg_protein": round(avg_protein, 2),
                "avg_carbs": round(avg_carbs, 2),
                "avg_fat": round(avg_fat, 2),
                "sample_recipes": cluster_data["Recipe_name"].head(3).tolist(),
            }
            cluster_summaries.append(summary)

        return {
            "diet_type": diet_type,
            "clusters": cluster_summaries,
            "total_recipes": int(len(df)),
            "num_clusters": num_clusters,
        }

    except Exception as e:
        return {
            "error": str(e),
            "diet_type": diet_type,
            "clusters": [],
            "total_recipes": 0,
        }


def generate_cluster_label(protein, carbs, fat):
    """
    Generate a descriptive label for a cluster based on macronutrient profile.

    Args:
        protein: Average protein in grams
        carbs: Average carbs in grams
        fat: Average fat in grams

    Returns:
        String label describing the cluster
    """
    # Calculate percentages
    total = protein + carbs + fat
    if total == 0:
        return "Minimal Nutrients"

    protein_pct = (protein / total) * 100
    carbs_pct = (carbs / total) * 100
    fat_pct = (fat / total) * 100

    # Determine primary nutrient
    if protein_pct > 40:
        if carbs_pct < 20:
            return "High Protein, Low Carb"
        elif fat_pct > 35:
            return "High Protein & Fat"
        else:
            return "High Protein, Balanced"
    elif carbs_pct > 40:
        if protein_pct < 20:
            return "High Carb, Low Protein"
        else:
            return "Balanced Carb & Protein"
    elif fat_pct > 40:
        if carbs_pct < 20:
            return "Fat-Focused"
        else:
            return "High Fat, Moderate Carbs"
    else:
        return "Balanced Macros"
