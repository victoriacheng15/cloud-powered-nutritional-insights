import requests
from functools import wraps
from flask import request


def proxy_to_function_app(function_app_url, function_app_key=None):
    """
    Decorator to proxy requests to Azure Function App and handle errors

    Args:
        function_app_url: Base URL of the Function App
        function_app_key: Optional function key for authentication
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                # Get the endpoint name from the function
                endpoint = func.__name__.replace("get_", "").replace("_", "-")

                # Build query string from request args
                query_params = request.args.to_dict()

                # Build URL
                url = f"{function_app_url}/api/{endpoint}"

                # Add function key if provided
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

    return decorator
