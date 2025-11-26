"""
OAuth and 2FA Authentication Module

This module provides functions for OAuth 2.0 authentication (Google & GitHub) and
Two-Factor Authentication (2FA) using TOTP. It integrates with Azure Key Vault for
secure credential retrieval and generates JWT tokens for authenticated sessions.

Supported OAuth Providers:
- Google OAuth 2.0
- GitHub OAuth 2.0

Authentication Flow:
1. Frontend requests OAuth URL via get_oauth_login_url()
2. User authenticates with provider
3. Provider redirects to callback with authorization code
4. Backend exchanges code for JWT token via handle_oauth_callback()
5. Frontend can then setup 2FA via setup_two_factor()
6. User scans QR code and enters TOTP code
7. Backend verifies code and issues session token via verify_two_factor()
"""

import base64
import io
import os
import secrets
import time
from typing import Any, Dict, Optional

import jwt
import pyotp
import qrcode
from urllib.parse import urlencode

from .utils import get_secret_with_fallback

ISSUER_NAME = "Nutritional Insights"
JWT_SIGNING_KEY = os.getenv("JWT_SIGNING_KEY", "change-me")

_twofa_store: Dict[str, Optional[str]] = {
    "secret": None,
    "email": None,
}

OAUTH_PROVIDERS = {
    "google": {
        "auth_base": "https://accounts.google.com/o/oauth2/v2/auth",
        "scope": "openid email profile",
    },
    "github": {
        "auth_base": "https://github.com/login/oauth/authorize",
        "scope": "read:user user:email",
    },
}

# GitHub OAuth setup:
# 1. Visit https://github.com/settings/developers → OAuth Apps and create a new app.
# 2. Set the redirect URI to https://<your-function-app>/api/auth/oauth/callback (or the dev URL).
# 3. Store the generated Client ID + redirect URI in Key Vault as GITHUB_OAUTH_CLIENT_ID
#    and GITHUB_OAUTH_REDIRECT_URI (the helper auto-converts underscores to dashes).
# 4. The frontend button triggers /api/auth/oauth/login?provider=github, and the callback
#    endpoint will issue the demo JWT once GitHub redirects back with the code.

# Google OAuth setup:
# 1. Visit https://console.cloud.google.com → Create OAuth 2.0 credentials
# 2. Set the redirect URI to http://127.0.0.1:5000/api/auth/oauth/callback (or your production URL).
# 3. Store the generated Client ID in Key Vault as GOOGLE_OAUTH_CLIENT_ID
#    and the redirect URI in Key Vault as OAUTH_REDIRECT_URI


def _build_state() -> str:
    return f"ni-{secrets.token_urlsafe(8)}"


def _create_jwt(payload: Dict[str, Any]) -> str:
    return jwt.encode(payload, JWT_SIGNING_KEY, algorithm="HS256")


def get_oauth_login_url(provider: str) -> Dict[str, Any]:
    provider = provider.lower()
    if provider not in OAUTH_PROVIDERS:
        return {
            "status": "error",
            "message": f"Unsupported provider '{provider}'.",
        }

    config = OAUTH_PROVIDERS[provider]
    client_id = get_secret_with_fallback(
        f"{provider.upper()}_OAUTH_CLIENT_ID", env_var_name=f"{provider.upper()}_OAUTH_CLIENT_ID", default=None
    )
    redirect_uri = get_secret_with_fallback(
        "OAUTH_REDIRECT_URI", env_var_name="OAUTH_REDIRECT_URI", default=None
    )

    if not client_id or not redirect_uri:
        return {
            "status": "error",
            "message": f"Missing OAuth configuration for {provider}.",
        }

    state = _build_state()
    params = {
        "client_id": client_id,
        "response_type": "code",
        "redirect_uri": redirect_uri,
        "scope": config["scope"],
        "state": state,
    }

    base_url = config["auth_base"]
    if provider == "google":
        params["access_type"] = "offline"
    if provider == "github":
        params["allow_signup"] = "true"

    auth_url = f"{base_url}?{urlencode(params)}"

    return {
        "status": "success",
        "provider": provider,
        "auth_url": auth_url,
        "state": state,
    }


def handle_oauth_callback(provider: str, code: Optional[str], state: Optional[str]) -> Dict[str, Any]:
    if not code:
        return {"status": "error", "message": "Missing authorization code."}

    payload = {
        "provider": provider,
        "code": code,
        "state": state,
        "iat": int(time.time()),
    }
    token = _create_jwt(payload)

    return {
        "status": "success",
        "message": "OAuth callback received",
        "token": token,
        "provider": provider,
        "state": state,
    }


def setup_two_factor(email: Optional[str] = None) -> Dict[str, Any]:
    try:
        user_email = (email or "user@example.com").strip()
        secret = pyotp.random_base32()
        _twofa_store["secret"] = secret
        _twofa_store["email"] = user_email

        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(name=user_email, issuer_name=ISSUER_NAME)

        qr = qrcode.make(provisioning_uri)
        buffer = io.BytesIO()
        qr.save(buffer, format="PNG")
        qr_data = base64.b64encode(buffer.getvalue()).decode()

        return {
            "status": "success",
            "email": user_email,
            "secret": secret,
            "qr_code": f"data:image/png;base64,{qr_data}",
            "provisioning_uri": provisioning_uri,
        }
    except Exception as e:
        raise


def verify_two_factor(code: Optional[str]) -> Dict[str, Any]:
    secret = _twofa_store.get("secret")
    if not secret:
        return {"status": "error", "message": "2FA has not been set up yet."}

    if not code or not code.isdigit():
        return {"status": "error", "message": "Invalid code submitted."}

    totp = pyotp.TOTP(secret)
    verified = totp.verify(code, valid_window=1)

    if verified:
        payload = {
            "email": _twofa_store.get("email"),
            "verified": True,
            "timestamp": int(time.time()),
        }
        token = _create_jwt(payload)
        return {"status": "success", "message": "2FA verified", "token": token}

    return {"status": "error", "message": "2FA code did not match."}
