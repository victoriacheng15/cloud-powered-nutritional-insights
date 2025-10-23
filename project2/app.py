import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from utils import proxy_to_function_app

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Environment
FLASK_ENV = os.getenv("FLASK_ENV", "development")
app.debug = FLASK_ENV == "development"

# Azure Function App URL - use environment variable with fallback to localhost
FUNCTION_APP_URL = os.getenv("FUNCTION_APP_URL", "http://localhost:7071")
# Azure Function App Key - for authentication
FUNCTION_APP_KEY = os.getenv("FUNCTION_APP_KEY", "")

# Determine if we should use function key (only in production)
function_key = FUNCTION_APP_KEY if FLASK_ENV == "production" else None
function_url = (
    FUNCTION_APP_URL if FLASK_ENV == "production" else "http://localhost:7071"
)

print(f"🔧 FLASK_ENV: {FLASK_ENV}")
print(f"🔧 FUNCTION_APP_URL: {function_url}")
print(f"🔧 Debug mode: {app.debug}")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/greeting")
@proxy_to_function_app(function_url, function_key)
def get_greeting():
    """
    Proxy endpoint to call Azure Function App greeting
    """
    pass


@app.route("/api/nutritional-insights")
@proxy_to_function_app(function_url, function_key)
def get_nutritional_insights():
    """
    Proxy endpoint to call Azure Function App nutritional insights
    Returns aggregated nutritional statistics for a diet type

    Query Parameters:
        - diet_type: (optional) "all", "vegan", "keto", "mediterranean", "paleo", or "dash"
                     Defaults to "all" if not provided

    Example: /api/nutritional-insights?diet_type=keto
    """
    pass


@app.route("/api/recipes")
@proxy_to_function_app(function_url, function_key)
def get_recipes():
    """
    Proxy endpoint to call Azure Function App recipes
    Returns recipes filtered by diet type with pagination

    Query Parameters:
        - diet_type: (optional) "all", "vegan", "keto", "mediterranean", "paleo", or "dash"
                     Defaults to "all" if not provided
        - page: (optional) Page number (1-indexed), defaults to 1
        - page_size: (optional) Number of recipes per page, defaults to 20

    Example: /api/recipes?diet_type=keto&page=1&page_size=20
    """
    pass


@app.route("/api/clusters")
@proxy_to_function_app(function_url, function_key)
def get_clusters():
    """
    Proxy endpoint to call Azure Function App clusters
    Returns nutritional clusters for recipes

    Query Parameters:
        - diet_type: (optional) "all", "vegan", "keto", "mediterranean", "paleo", or "dash"
                     Defaults to "all" if not provided
        - num_clusters: (optional) Number of clusters to create, defaults to 3 (max 20)

    Example: /api/clusters?diet_type=keto&num_clusters=4
    """
    pass


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
