import azure.functions as func
import json
from functions import (
    greeting,
    get_nutritional_insights,
    get_recipes,
    get_clusters,
    get_security_status,
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
