"""User routes."""

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.auth import jwt_required_custom
from app.models import User
from app.schemas import UpdateUserSchema
from app.services import UserService

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("/me", methods=["GET"])
@jwt_required_custom()
def get_current_user(current_user: User):
    """Get current user's profile.

    Requires JWT authentication.

    Returns:
        200: User profile data
        401: Unauthorized (invalid/expired token)
    """
    return jsonify({"user": current_user.to_dict()}), 200


@users_bp.route("/me", methods=["PUT"])
@jwt_required_custom()
def update_current_user(current_user: User):
    """Update current user's profile.

    Requires JWT authentication.

    Expected JSON body (all fields optional):
        {
            "first_name": "Jan",
            "last_name": "Kowalski",
            "email": "new.email@example.com"
        }

    Returns:
        200: User updated successfully with updated user data
        400: Validation error or email already in use
        401: Unauthorized (invalid/expired token)
    """
    try:
        # Validate input
        schema = UpdateUserSchema()
        data = schema.load(request.get_json())

    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 400
    except Exception:
        return jsonify({"error": "Invalid request data"}), 400

    # Check if there's any data to update
    if not data:
        return jsonify({"error": "No data provided for update"}), 400

    # Update user
    user, error = UserService.update_user(
        user_id=current_user.id,
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        email=data.get("email"),
    )

    if error:
        return jsonify({"error": error}), 400

    return jsonify(
        {
            "message": "User updated successfully",
            "user": user.to_dict(),
        }
    ), 200


@users_bp.route("/me/balance", methods=["GET"])
@jwt_required_custom()
def get_balance(current_user: User):
    """Get current user's account balance.

    Requires JWT authentication.

    Returns:
        200: Account balance data
        401: Unauthorized (invalid/expired token)
        404: User not found
    """
    balance, error = UserService.get_balance(current_user.id)

    if error:
        return jsonify({"error": error}), 404

    return jsonify(
        {
            "account_balance": str(balance),
            "currency": "PLN",
        }
    ), 200


@users_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({"error": "Resource not found"}), 404


@users_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({"error": "Internal server error"}), 500
