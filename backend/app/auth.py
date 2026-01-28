"""Authentication utilities and decorators."""

from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.services import UserService


def jwt_required_custom():
    """Decorator to protect routes with JWT authentication.

    This decorator verifies the JWT token and loads the current user.
    It returns a 401 error if the token is invalid or the user doesn't exist.

    Returns:
        Decorated function that includes current_user in kwargs
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()

                # Load user from database
                current_user = UserService.get_by_id(user_id)
                if not current_user:
                    return jsonify({"error": "User not found"}), 401

                # Pass current_user to the route handler
                return fn(*args, current_user=current_user, **kwargs)

            except Exception as e:
                return jsonify({"error": "Invalid or expired token"}), 401

        return wrapper

    return decorator
