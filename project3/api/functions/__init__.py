"""
Functions module for Nutritional Insights API.

Exports all endpoint handler functions and utility functions for:
- Greeting and basic endpoints
- Nutritional data analysis and insights
- Recipe fetching with pagination
- K-means clustering of recipes
- Security and compliance status
- Authentication (OAuth and 2FA)
- Resource cleanup management
"""

from .greeting import greeting
from .nutritional_insights import get_nutritional_insights
from .get_recipes import get_recipes
from .get_clusters import get_clusters
from .security_compliance import get_security_status
from .auth import (
    get_oauth_login_url,
    handle_oauth_callback,
    setup_two_factor,
    verify_two_factor,
)
from .cleanup import list_resources_in_group, delete_resources

__all__ = [
    # Core endpoints
    "greeting",
    "get_nutritional_insights",
    "get_recipes",
    "get_clusters",
    "get_security_status",
    # Authentication
    "get_oauth_login_url",
    "handle_oauth_callback",
    "setup_two_factor",
    "verify_two_factor",
    # Resource management
    "list_resources_in_group",
    "delete_resources",
]
