"""
Greeting Module

This module provides a simple HTTP greeting endpoint that returns a personalized
message with a timestamp. Used for testing API connectivity and basic functionality.
"""

import json
from datetime import datetime


def greeting(name=None):
    """
    Hello world function
    """
    now = datetime.now()
    if name:
        return json.dumps({"message": f"Hello, {name}!", "timestamp": str(now)})
    return json.dumps({"message": "Hello, World!", "timestamp": str(now)})
