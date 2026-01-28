# Backend Agent

## Stack
Python 3.11+ | Flask 3.x | MySQL | Redis | RabbitMQ | Poetry

## Standards
- Follow PEP8 (https://peps.python.org/pep-0008/)
- Use Black formatter (88 char line limit)
- snake_case for functions/variables, PascalCase for classes

## Flask Patterns

### App Factory
```python
# app/__init__.py
def create_app(config_name="development"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
```

### Blueprints
```python
# app/routes.py
from flask import Blueprint, jsonify, request

api_bp = Blueprint("api", __name__)

@api_bp.route("/users", methods=["GET"])
def get_users():
    users = UserService.get_all()
    return jsonify(users), 200

@api_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    user = UserService.create(data)
    return jsonify(user), 201
```

### Error Handling
```python
@api_bp.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@api_bp.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500
```

## Security

### Input Validation
```python
from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))

@api_bp.route("/users", methods=["POST"])
def create_user():
    schema = UserSchema()
    errors = schema.validate(request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400
```

### Parameterized Queries (prevent SQL injection)
```python
# GOOD
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# BAD - vulnerable to SQL injection
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
```

### Password Hashing
```python
from werkzeug.security import generate_password_hash, check_password_hash

hashed = generate_password_hash(password)
is_valid = check_password_hash(hashed, password)
```

## Service Layer Pattern
```python
# app/services/user_service.py
class UserService:
    @staticmethod
    def get_by_id(user_id: int) -> dict | None:
        user = User.query.get(user_id)
        return user.to_dict() if user else None

    @staticmethod
    def create(data: dict) -> dict:
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return user.to_dict()
```
