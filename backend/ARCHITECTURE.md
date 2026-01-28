# Backend Architecture

## Overview

This Flask backend implements a secure bank user management system with JWT authentication. It follows Flask best practices including the app factory pattern, Blueprint organization, and service layer architecture.

## Design Patterns

### 1. App Factory Pattern
**Location:** `/home/gh05t/CDV/pai_2025/cdv-webapp/backend/app/__init__.py`

The `create_app()` function creates and configures the Flask application, allowing for:
- Multiple configurations (development, production)
- Easier testing with different settings
- Better separation of concerns

### 2. Blueprint Organization
**Locations:**
- `/home/gh05t/CDV/pai_2025/cdv-webapp/backend/app/routes.py` - Original routes
- `/home/gh05t/CDV/pai_2025/cdv-webapp/backend/app/routes_auth.py` - Authentication endpoints
- `/home/gh05t/CDV/pai_2025/cdv-webapp/backend/app/routes_users.py` - User management endpoints

Blueprints provide:
- Modular route organization
- Clear endpoint grouping
- Easy URL prefix management (`/api/auth`, `/api/users`)

### 3. Service Layer Pattern
**Location:** `/home/gh05t/CDV/pai_2025/cdv-webapp/backend/app/services.py`

Business logic is separated from routes:
- `UserService` handles all user-related operations
- Routes only handle HTTP concerns (validation, responses)
- Easy to test business logic independently
- Consistent error handling

### 4. Input Validation
**Location:** `/home/gh05t/CDV/pai_2025/cdv-webapp/backend/app/schemas.py`

Marshmallow schemas validate all inputs:
- `RegisterSchema` - User registration validation
- `LoginSchema` - Login validation
- `UpdateUserSchema` - Profile update validation

## Security Implementation

### Password Security
- **Hashing:** Werkzeug's `generate_password_hash()` and `check_password_hash()`
- **Storage:** Only hashed passwords stored in database
- **Validation:** Minimum 8 characters enforced

### JWT Authentication
- **Library:** flask-jwt-extended
- **Token Type:** Access tokens (1 hour default expiration)
- **Storage:** Client-side (not stored in database)
- **Verification:** Custom decorator checks token and loads user

### SQL Injection Prevention
- **ORM:** SQLAlchemy with parameterized queries
- **No Raw SQL:** All queries use ORM methods
- **Type Safety:** SQLAlchemy column types enforced

### Input Validation
- **Library:** Marshmallow
- **Validation Points:** All POST/PUT endpoints
- **Error Handling:** Detailed validation errors returned
- **Type Coercion:** Automatic type conversion and validation

## Database Schema

### User Model
**Location:** `/home/gh05t/CDV/pai_2025/cdv-webapp/backend/app/models.py`

```python
class User(db.Model):
    id: int                      # Primary key
    first_name: str              # Max 100 chars
    last_name: str               # Max 100 chars
    email: str                   # Unique, max 120 chars, indexed
    password_hash: str           # Max 255 chars
    account_balance: Decimal     # Numeric(15,2), default 0.00
    created_at: datetime         # Auto-generated
    updated_at: datetime         # Auto-updated
```

**Methods:**
- `set_password(password: str)` - Hash and set password
- `check_password(password: str)` - Verify password
- `to_dict(include_balance: bool)` - Serialize to dictionary

## API Flow

### Registration Flow
```
Client -> POST /api/auth/register
       -> RegisterSchema validation
       -> UserService.create_user()
       -> Password hashing
       -> Database insert
       -> JWT token generation
       -> Response with user + token
```

### Login Flow
```
Client -> POST /api/auth/login
       -> LoginSchema validation
       -> UserService.authenticate()
       -> Password verification
       -> JWT token generation
       -> Response with user + token
```

### Protected Endpoint Flow
```
Client -> GET /api/users/me + JWT token
       -> @jwt_required_custom() decorator
       -> Token verification
       -> User loading from database
       -> Route handler execution
       -> Response
```

## Configuration

**Location:** `/home/gh05t/CDV/pai_2025/cdv-webapp/backend/app/config.py`

### Environment Variables
- `FLASK_ENV` - Application environment (development/production)
- `SECRET_KEY` - Flask secret key for sessions
- `JWT_SECRET_KEY` - JWT signing key
- `JWT_ACCESS_TOKEN_EXPIRES_HOURS` - Token expiration time
- `DATABASE_URL` - Database connection string

### Configuration Classes
- `Config` - Base configuration
- `DevelopmentConfig` - Development settings (DEBUG=True)
- `ProductionConfig` - Production settings (DEBUG=False)

## Error Handling

### Consistent Error Responses
All errors return JSON with standard format:
```json
{
  "error": "Error message",
  "details": {}  // Optional validation details
}
```

### Error Types
- **400 Bad Request** - Validation errors, duplicate emails
- **401 Unauthorized** - Invalid credentials, expired tokens
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Unexpected errors

### Blueprint Error Handlers
Each blueprint has error handlers:
```python
@bp.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404
```

## File Structure

```
backend/
├── app/
│   ├── __init__.py           # App factory (create_app)
│   ├── auth.py               # JWT authentication decorator
│   ├── config.py             # Configuration classes
│   ├── models.py             # SQLAlchemy User model
│   ├── routes.py             # Original hello-world route
│   ├── routes_auth.py        # /api/auth/* endpoints
│   ├── routes_users.py       # /api/users/* endpoints
│   ├── schemas.py            # Marshmallow validation schemas
│   └── services.py           # UserService business logic
├── .env.example              # Example environment variables
├── ARCHITECTURE.md           # This file
├── pyproject.toml            # Poetry dependencies
├── README.md                 # API documentation
├── run.sh                    # Quick start script
└── test_api.py               # Manual API test script
```

## Code Quality Standards

### PEP8 Compliance
- Maximum line length: 88 characters (Black formatter)
- Snake case for functions/variables
- Pascal case for classes
- Type hints on all function signatures
- Docstrings for all public functions

### Best Practices
- No sensitive data in logs
- Environment variables for secrets
- Defensive programming (validate all inputs)
- Consistent error handling
- Clear separation of concerns

## Testing

### Manual Testing
Run the test script with server running:
```bash
# Terminal 1: Start server
poetry run flask --app "app:create_app()" run --port 5000

# Terminal 2: Run tests
poetry run python test_api.py
```

### Test Coverage
The test script covers:
- User registration
- User login
- Get profile (protected)
- Update profile (protected)
- Get balance (protected)
- Invalid token handling

## Deployment Considerations

### Production Checklist
- [ ] Set strong `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Use production database (not SQLite)
- [ ] Set `FLASK_ENV=production`
- [ ] Use WSGI server (Gunicorn, uWSGI)
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Implement rate limiting
- [ ] Regular security audits

### Environment Variables (Production)
```bash
FLASK_ENV=production
SECRET_KEY=<strong-random-key>
JWT_SECRET_KEY=<different-strong-random-key>
JWT_ACCESS_TOKEN_EXPIRES_HOURS=1
DATABASE_URL=postgresql://user:pass@host/dbname
```

## Extension Points

### Adding New Endpoints
1. Create route in appropriate Blueprint
2. Add validation schema if needed
3. Add service method for business logic
4. Document in README.md

### Adding New Models
1. Create model class in `models.py`
2. Add relationships if needed
3. Create migration (if using Alembic)
4. Update services.py

### Adding Authentication Requirements
Use the `@jwt_required_custom()` decorator:
```python
from app.auth import jwt_required_custom

@bp.route("/protected")
@jwt_required_custom()
def protected_route(current_user: User):
    return jsonify({"user": current_user.to_dict()})
```
