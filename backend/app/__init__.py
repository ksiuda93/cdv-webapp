import os

from flask import Flask
from flask_jwt_extended import JWTManager

from app.config import config
from app.models import db


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
    db.init_app(app)
    JWTManager(app)

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
