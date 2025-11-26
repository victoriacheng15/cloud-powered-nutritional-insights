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

                # Determine endpoint format based on function type
                if func_name.startswith("auth_") or "cleanup" in func_name:
                    # auth_oauth_login -> auth/oauth/login, cleanup_list -> cleanup/list
                    endpoint = func_name.replace("_", "/")
                    # Handle 2FA special case: auth/2fa_setup -> auth/2fa-setup
                    endpoint = endpoint.replace("2fa_", "2fa-")
                else:
                    # nutritional_insights -> nutritional-insights
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
