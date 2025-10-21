from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

# Azure Function App URL - use environment variable with fallback to localhost
FUNCTION_APP_URL = os.getenv("FUNCTION_APP_URL", "http://localhost:7071")


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
        response = requests.get(f"{FUNCTION_APP_URL}/api/hello?name={name}")
        return response.json()
    except Exception as e:
        return {"error": str(e)}, 500


@app.route("/api/data")
def get_data():
    # Placeholder for API endpoint
    return {"status": "success", "message": "API endpoint working"}


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
