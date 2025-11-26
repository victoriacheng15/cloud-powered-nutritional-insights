import azure.functions as func
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from functions import (
    greeting,
    get_nutritional_insights,
    get_recipes,
    get_clusters,
    get_security_status,
    get_oauth_login_url,
    handle_oauth_callback,
    setup_two_factor,
    verify_two_factor,
    list_resources_in_group,
    delete_resources,
)

app = func.FunctionApp()


@app.route(route="greeting")
def http_greeting(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP triggered function that calls greeting function
    """
    name = req.params.get("name")
    result = greeting(name)
    return func.HttpResponse(str(result), status_code=200)


@app.route(route="nutritional-insights")
def http_nutritional_insights(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP triggered function that returns nutritional insights for a diet type
    """
    try:
        diet_type = req.params.get("diet_type", "all")
        result = get_nutritional_insights(diet_type)
        return func.HttpResponse(
            json.dumps(result), status_code=200, mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}), status_code=500, mimetype="application/json"
        )


@app.route(route="recipes")
def http_recipes(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP triggered function that returns recipes filtered by diet type with pagination

    Query Parameters:
        - diet_type: (optional) "all", "vegan", "keto", "mediterranean", "paleo", or "dash"
                     Defaults to "all" if not provided
        - page: (optional) Page number (1-indexed), defaults to 1
        - page_size: (optional) Number of recipes per page, defaults to 20
    """
    try:
        diet_type = req.params.get("diet_type", "all")
        page = req.params.get("page", "1")
        page_size = req.params.get("page_size", "20")
        result = get_recipes(diet_type, page, page_size)
        return func.HttpResponse(
            json.dumps(result), status_code=200, mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}), status_code=500, mimetype="application/json"
        )


@app.route(route="clusters")
def http_clusters(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP triggered function that returns nutritional clusters for recipes

    Query Parameters:
        - diet_type: (optional) "all", "vegan", "keto", "mediterranean", "paleo", or "dash"
                     Defaults to "all" if not provided
        - num_clusters: (optional) Number of clusters to create, defaults to 3 (max 20)
    """
    try:
        diet_type = req.params.get("diet_type", "all")
        num_clusters = req.params.get("num_clusters", "3")
        result = get_clusters(diet_type, num_clusters)
        return func.HttpResponse(
            json.dumps(result), status_code=200, mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}), status_code=500, mimetype="application/json"
        )


@app.route(route="security-status")
def http_security_status(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP triggered function that returns the security and compliance status

    Returns:
        - encryption: Encryption status (Enabled/Disabled)
        - access_control: Access control status (Secure/Compromised)
        - compliance: Compliance status (Compliant/Non-Compliant)
    """
    try:
        result = get_security_status()
        return func.HttpResponse(
            json.dumps(result), status_code=200, mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}), status_code=500, mimetype="application/json"
        )


@app.route(route="cleanup/list", methods=["GET"])
def http_cleanup_list(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP triggered function that lists all resources in the resource group.
    
    Returns:
        - status: "success" or "error"
        - resource_group: Name of the resource group
        - resources: List of resources with id, name, type
        - count: Total number of resources
    """
    try:
        result = list_resources_in_group()
        status_code = 200 if result["status"] == "success" else 500
        return func.HttpResponse(
            json.dumps(result),
            status_code=status_code,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }),
            status_code=500,
            mimetype="application/json"
        )


@app.route(route="cleanup/delete", methods=["POST"])
def http_cleanup_delete(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP triggered function that deletes selected resources.
    
    Request body:
        {
            "resource_ids": ["resource_id_1", "resource_id_2", ...]
        }
    
    Returns:
        - status: "success", "partial", or "error"
        - deleted_count: Number of successfully deleted resources
        - failed_count: Number of failed deletions
        - deleted_resources: List of successfully deleted resource IDs
        - failed_resources: List of failed deletions with errors
    """
    try:
        # Require confirmation header for safety
        confirmation = req.headers.get("X-Cleanup-Confirm")
        if confirmation != "confirmed":
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "message": "Deletion requires confirmation header: X-Cleanup-Confirm: confirmed",
                    "timestamp": datetime.utcnow().isoformat()
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        req_body = req.get_json()
        resource_ids = req_body.get("resource_ids", [])
        
        if not resource_ids:
            return func.HttpResponse(
                json.dumps({
                    "status": "error",
                    "message": "No resources specified for deletion",
                    "timestamp": datetime.utcnow().isoformat()
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        result = delete_resources(resource_ids)
        status_code = 200 if result["status"] in ["success", "partial"] else 500
        return func.HttpResponse(
            json.dumps(result),
            status_code=status_code,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }),
            status_code=500,
            mimetype="application/json"
        )



@app.route(route="auth/oauth/login", methods=["GET"])
def http_auth_oauth_login(req: func.HttpRequest) -> func.HttpResponse:
    provider = req.params.get("provider", "azure")
    result = get_oauth_login_url(provider)
    status_code = 200 if result.get("status") == "success" else 400
    return func.HttpResponse(
        json.dumps(result),
        status_code=status_code,
        mimetype="application/json"
    )


@app.route(route="auth/oauth/callback", methods=["GET"])
def http_auth_oauth_callback(req: func.HttpRequest) -> func.HttpResponse:
    provider = req.params.get("provider", "azure")
    code = req.params.get("code")
    state = req.params.get("state")
    result = handle_oauth_callback(provider, code, state)
    status_code = 200 if result.get("status") == "success" else 400
    return func.HttpResponse(
        json.dumps(result),
        status_code=status_code,
        mimetype="application/json"
    )


@app.route(route="auth/2fa-setup", methods=["POST"])
def http_auth_two_factor_setup(req: func.HttpRequest) -> func.HttpResponse:
    try:
        try:
            req_body = req.get_json()
        except ValueError:
            req_body = {}

        email = req_body.get("email") if isinstance(req_body, dict) else None
        result = setup_two_factor(email)
        status_code = 200 if result.get("status") == "success" else 400
        return func.HttpResponse(
            json.dumps(result),
            status_code=status_code,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }),
            status_code=500,
            mimetype="application/json"
        )


@app.route(route="auth/2fa-verify", methods=["POST"])
def http_auth_two_factor_verify(req: func.HttpRequest) -> func.HttpResponse:
    try:
        try:
            req_body = req.get_json()
        except ValueError:
            req_body = {}

        code = req_body.get("code") if isinstance(req_body, dict) else None
        result = verify_two_factor(code)
        status_code = 200 if result.get("status") == "success" else 400
        return func.HttpResponse(
            json.dumps(result),
            status_code=status_code,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }),
            status_code=500,
            mimetype="application/json"
        )