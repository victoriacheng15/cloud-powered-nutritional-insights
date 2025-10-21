import azure.functions as func
import json
from functions import hello, get_nutritional_insights

app = func.FunctionApp()


@app.route(route="hello")
def http_hello(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP triggered function that calls hello function
    """
    name = req.params.get("name")
    result = hello(name)
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
