# data_analysis.py

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# -------------------------------
# Step 1: Load Dataset
# -------------------------------
df = pd.read_csv('./datasets/All_Diets.csv')

# Normalize column names
df.columns = [c.strip().lower().replace(" ", "_").replace("(g)", "").replace("__","_") for c in df.columns]

# Ensure numeric columns
for col in ['protein', 'carbs', 'fat']:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Handle missing values: fill with mean per column
df[['protein','carbs','fat']] = df[['protein','carbs','fat']].fillna(df[['protein','carbs','fat']].mean())

# -------------------------------
# Step 2: Compute Metrics
# -------------------------------

# Average macronutrient content per diet type
avg_macros = df.groupby('diet_type')[['protein','carbs','fat']].mean()
print("Average macronutrients per Diet Type:\n", avg_macros)

# Top 5 protein-rich recipes per diet type
top_protein = df.sort_values('protein', ascending=False).groupby('diet_type').head(5)
print("\nTop 5 protein-rich recipes per Diet Type:\n", top_protein[['diet_type','recipe_name','cuisine_type','protein','carbs','fat']])

# Diet type with highest protein content (mean)
diet_highest_protein = avg_macros['protein'].idxmax()
print(f"\nDiet type with highest average protein: {diet_highest_protein}")

# Most common cuisines per diet type
common_cuisines = df.groupby('diet_type')['cuisine_type'].agg(lambda x: x.value_counts().idxmax())
print("\nMost common cuisine per Diet Type:\n", common_cuisines)

# New metrics
df['protein_to_carbs_ratio'] = df['protein'] / df['carbs'].replace(0, np.nan)
df['carbs_to_fat_ratio'] = df['carbs'] / df['fat'].replace(0, np.nan)

# -------------------------------
# Step 3: Visualizations
# -------------------------------

sns.set(style="whitegrid")

# 1. Bar chart for average macronutrients per diet type
avg_macros.plot(kind='bar', figsize=(10,6))
plt.title("Average Macronutrients by Diet Type")
plt.ylabel("Grams")
plt.xticks(rotation=45)
plt.savefig("./screenshots/avg_macros_bar.png")

# 2. Heatmap: macronutrients vs diet type
plt.figure(figsize=(10,6))
sns.heatmap(avg_macros, annot=True, fmt=".2f", cmap="YlGnBu")
plt.title("Heatmap of Average Macronutrients per Diet Type")
plt.savefig("./screenshots/macros_heatmap.png")

# 3. Scatter plot: Top 5 protein-rich recipes per diet type
plt.figure(figsize=(12,6))
sns.scatterplot(
    data=top_protein,
    x='recipe_name',
    y='protein',
    hue='diet_type',
    style='cuisine_type',
    s=100
)
plt.xticks(rotation=90)
plt.ylabel("Protein (g)")
plt.title("Top 5 Protein-Rich Recipes per Diet Type")
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.savefig("./screenshots/top_protein_scatter.png", bbox_inches="tight")
