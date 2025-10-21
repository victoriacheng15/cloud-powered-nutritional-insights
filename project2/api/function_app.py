import azure.functions as func
from functions import hello

app = func.FunctionApp()


@app.route(route="hello")
def http_hello(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP triggered function that calls hello function
    """
    name = req.params.get("name")
    result = hello(name)
    return func.HttpResponse(str(result), status_code=200)
