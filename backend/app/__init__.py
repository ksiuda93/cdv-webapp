import os

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.config import config
from app.models import db
from app.redis_client import init_redis, is_token_blacklisted


def create_app(config_name: str = None):
    """Create and configure the Flask application.

    Args:
        config_name: Configuration name ('development', 'production', or None for default)

    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__)

    # Load configuration
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")
    app.config.from_object(config.get(config_name, config["default"]))

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt = JWTManager(app)
    init_redis(app)

    # JWT token blacklist check
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
        jti = jwt_payload["jti"]
        return is_token_blacklisted(jti)

    # Register blueprints
    from app.routes import bp
    from app.routes_auth import auth_bp
    from app.routes_users import users_bp

    app.register_blueprint(bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    return app
