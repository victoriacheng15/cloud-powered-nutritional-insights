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


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/greeting")
@proxy_to_function_app
def get_greeting():
    """
    Proxy endpoint to call Azure Function App greeting
    """
    pass


@app.route("/api/nutritional-insights")
@proxy_to_function_app
def get_nutritional_insights():
    """
    Proxy endpoint to call Azure Function App nutritional insights
    Returns aggregated nutritional statistics for a diet type
    """
    pass


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
