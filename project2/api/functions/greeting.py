import json
from datetime import datetime


def hello(name=None):
    """
    Hello world function
    """
    now = datetime.now()
    if name:
        return json.dumps({"message": f"Hello, {name}!", "timestamp": str(now)})
    return json.dumps({"message": "Hello, World!", "timestamp": str(now)})
