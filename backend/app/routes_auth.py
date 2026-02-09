"""Authentication routes."""

import logging
from datetime import datetime, timezone

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt, jwt_required
from marshmallow import ValidationError

from app.rabbitmq import publish_message
from app.redis_client import blacklist_token, rate_limit
from app.schemas import LoginSchema, RegisterSchema
from app.services import UserService

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
@rate_limit(max_requests=3, window_seconds=60, key_prefix="rl:reg")
def register():
    """Register a new user.

    Expected JSON body:
        {
            "first_name": "Jan",
            "last_name": "Kowalski",
            "email": "jan.kowalski@example.com",
            "password": "securepass123",
            "account_balance": "1000.00"  (optional)
        }

    Returns:
        201: User created successfully with user data and JWT token
        400: Validation error or user already exists
        500: Server error
    """
    try:
        # Validate input
        schema = RegisterSchema()
        data = schema.load(request.get_json())

    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 400
    except Exception:
        return jsonify({"error": "Invalid request data"}), 400

    # Create user
    user, error = UserService.create_user(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        password=data["password"],
        account_balance=data.get("account_balance"),
    )

    if error:
        return jsonify({"error": error}), 400

    try:
        publish_message("email-send", {
            "event": "user_registered",
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "registered_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.error(f"Failed to publish registration email message for user {user.email}: {e}")

    # Generate JWT token (identity must be a string)
    access_token = create_access_token(identity=str(user.id))

    return (
        jsonify(
            {
                "message": "User registered successfully",
                "user": user.to_dict(),
                "access_token": access_token,
            }
        ),
        201,
    )


@auth_bp.route("/login", methods=["POST"])
@rate_limit(max_requests=5, window_seconds=60, key_prefix="rl:login")
def login():
    """Authenticate user and return JWT token.

    Expected JSON body:
        {
            "email": "jan.kowalski@example.com",
            "password": "securepass123"
        }

    Returns:
        200: Login successful with JWT token
        400: Validation error
        401: Invalid credentials
        500: Server error
    """
    try:
        # Validate input
        schema = LoginSchema()
        data = schema.load(request.get_json())

    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 400
    except Exception:
        return jsonify({"error": "Invalid request data"}), 400

    # Authenticate user
    user = UserService.authenticate(
        email=data["email"],
        password=data["password"],
    )

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    # Generate JWT token (identity must be a string)
    access_token = create_access_token(identity=str(user.id))

    return jsonify(
        {
            "message": "Login successful",
            "user": user.to_dict(),
            "access_token": access_token,
        }
    ), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Logout user by blacklisting their JWT token.

    Requires JWT authentication.

    Returns:
        200: Logout successful
        401: Unauthorized (invalid/expired token)
    """
    jwt_data = get_jwt()
    jti = jwt_data["jti"]
    exp_timestamp = jwt_data["exp"]

    # Calculate remaining TTL so the blacklist entry auto-expires
    import time
    remaining = max(int(exp_timestamp - time.time()), 0)

    blacklist_token(jti, remaining)
    logger.info(f"Token {jti} blacklisted (expires in {remaining}s)")

    return jsonify({"message": "Wylogowano pomyślnie"}), 200


@auth_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({"error": "Resource not found"}), 404


@auth_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({"error": "Internal server error"}), 500
