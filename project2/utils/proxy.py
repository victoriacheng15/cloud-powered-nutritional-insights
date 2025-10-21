import os
import requests
from functools import wraps
from flask import request


def proxy_to_function_app(func):
    """
    Decorator to proxy requests to Azure Function App and handle errors
    Automatically:
    - Extracts endpoint name from function name
    - Builds URL to Function App
    - Passes query parameters
    - Adds function key for authentication
    - Handles errors
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            # Get environment variables
            function_app_url = os.getenv("FUNCTION_APP_URL", "http://localhost:7071")
            function_app_key = os.getenv("FUNCTION_APP_KEY", "")

            # Get the endpoint name from the function
            endpoint = func.__name__.replace("get_", "").replace("_", "-")

            # Build query string from request args
            query_params = request.args.to_dict()

            # Build URL
            url = f"{function_app_url}/api/{endpoint}"

            # Add function key if available
            if function_app_key:
                query_params["code"] = function_app_key

            # Make request to Function App
            response = requests.get(url, params=query_params, timeout=10)

            if response.status_code != 200:
                return {
                    "error": f"Function App returned {response.status_code}: {response.text}"
                }, 500

            return response.json()
        except Exception as e:
            return {"error": str(e)}, 500

    return wrapper
