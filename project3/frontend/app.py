import os
import requests
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


@app.route("/api/security-status")
@proxy_to_function_app(function_url, function_key)
def get_security_status():
    """
    Proxy endpoint to call Azure Function App security status
    Returns the current security and compliance status

    Returns:
        - encryption: Encryption status (Enabled/Disabled)
        - access_control: Access control status (Secure/Compromised)
        - compliance: Compliance status (Compliant/Non-Compliant)

    Example: /api/security-status
    """
    pass


@app.route("/api/cleanup/list", methods=["GET"])
@proxy_to_function_app(function_url, function_key)
def get_cleanup_list():
    """
    Proxy endpoint to list resources in the resource group
    Returns a list of all resources that can be deleted

    Example: /api/cleanup/list
    """
    pass


@app.route("/api/cleanup/delete", methods=["POST"])
@proxy_to_function_app(function_url, function_key)
def get_cleanup_delete():
    """
    Proxy endpoint to delete selected resources
    
    Request body:
        {
            "resource_ids": ["resource_id_1", "resource_id_2", ...]
        }

    Example: /api/cleanup/delete
    """
    pass


@app.route("/api/auth/oauth/login")
@proxy_to_function_app(function_url, function_key)
def get_auth_oauth_login():
    """
    Proxy endpoint to initiate OAuth logins

    Query Parameters:
        - provider: azure, google, or github
    """
    pass


@app.route("/api/auth/oauth/callback")
def get_auth_oauth_callback():
    """
    Handle OAuth callback from provider
    GitHub redirects here with authorization code and state

    Query Parameters:
        - provider: oauth provider
        - code: authorization code
        - state: state value
    """
    try:
        provider = request.args.get("provider", "github")
        code = request.args.get("code")
        state = request.args.get("state")
        
        if not code:
            return jsonify({"error": "Missing authorization code"}), 400
        
        # Forward to Function App callback endpoint
        url = f"{function_url}/api/auth/oauth/callback"
        params = {
            "provider": provider,
            "code": code,
            "state": state
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            return jsonify({"error": f"Function App error: {response.text}"}), 500
        
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/auth/2fa-setup", methods=["POST"])
@proxy_to_function_app(function_url, function_key)
def get_auth_2fa_setup():
    """
    Proxy endpoint to generate TOTP secrets and QR images
    """
    pass


@app.route("/api/auth/2fa-verify", methods=["POST"])
@proxy_to_function_app(function_url, function_key)
def get_auth_2fa_verify():
    """
    Proxy endpoint to verify submitted 2FA codes
    """
    pass


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
