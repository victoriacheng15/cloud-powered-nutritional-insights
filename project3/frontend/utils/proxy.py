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
                func_name = func.__name__.replace("get_", "")

                # Special case: 2FA functions use hyphens (auth_2fa_setup -> auth/2fa-setup)
                if "2fa" in func_name:
                    # Split on the last underscore to separate "auth" from "2fa_setup"
                    parts = func_name.split("_")
                    endpoint = f"{parts[0]}/{func_name[len(parts[0])+1:].replace('_', '-')}"
                # Special case: auth functions use slash-separated segments (auth_oauth_login -> auth/oauth/login)
                elif func_name.startswith("auth_"):
                    endpoint = func_name.replace("_", "/")
                # Special case: cleanup functions use slash-separated segments
                elif "cleanup" in func_name:
                    endpoint = func_name.replace("_", "/")
                else:
                    # For other functions, replace underscores with hyphens
                    endpoint = func_name.replace("_", "-")

                query_params = request.args.to_dict()

                # Build URL
                url = f"{function_app_url}/api/{endpoint}"

                # Add function key if provided
                if function_app_key:
                    query_params["code"] = function_app_key

                # Make request to Function App - support both GET and POST
                if request.method == "POST":
                    response = requests.post(url, json=request.get_json(), params=query_params, timeout=10, headers=request.headers)
                else:
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
