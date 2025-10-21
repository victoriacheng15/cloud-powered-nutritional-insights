import requests
import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

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
def get_greeting():
    """
    Proxy endpoint to call Azure Function App greeting
    """
    try:
        name = request.args.get("name", "World")
        url = f"{FUNCTION_APP_URL}/api/hello?name={name}"
        
        # Add function key if available
        if FUNCTION_APP_KEY:
            url += f"&code={FUNCTION_APP_KEY}"
        
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            return {"error": f"Function App returned {response.status_code}: {response.text}"}, 500
            
        return response.json()
    except Exception as e:
        return {"error": str(e)}, 500


@app.route("/api/data")
def get_data():
    # Placeholder for API endpoint
    return {"status": "success", "message": "API endpoint working"}


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
