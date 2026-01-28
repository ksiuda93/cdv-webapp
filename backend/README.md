# Bank User Management Backend

Flask REST API with JWT authentication for bank user management.

## Features

- User registration and authentication
- JWT-based authorization
- Secure password hashing (Werkzeug)
- SQLite database with SQLAlchemy ORM
- Input validation with Marshmallow
- PEP8 compliant code
- Service layer architecture

## Installation

```bash
cd backend
poetry install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
```
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES_HOURS=1
DATABASE_URL=sqlite:///bank.db
```

## Running the Application

```bash
poetry run flask --app "app:create_app()" run --port 5000
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "Jan",
  "last_name": "Kowalski",
  "email": "jan.kowalski@example.com",
  "password": "securepass123",
  "account_balance": "1000.00"  // optional, defaults to 0.00
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "first_name": "Jan",
    "last_name": "Kowalski",
    "email": "jan.kowalski@example.com",
    "created_at": "2026-01-28T10:00:00.000000",
    "updated_at": "2026-01-28T10:00:00.000000"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jan.kowalski@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "first_name": "Jan",
    "last_name": "Kowalski",
    "email": "jan.kowalski@example.com",
    "created_at": "2026-01-28T10:00:00.000000",
    "updated_at": "2026-01-28T10:00:00.000000"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### User Endpoints (Protected)

All user endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

#### Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "first_name": "Jan",
    "last_name": "Kowalski",
    "email": "jan.kowalski@example.com",
    "created_at": "2026-01-28T10:00:00.000000",
    "updated_at": "2026-01-28T10:00:00.000000"
  }
}
```

#### Update Current User Profile
```http
PUT /api/users/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "Janusz",
  "last_name": "Nowak",
  "email": "janusz.nowak@example.com"
}
```

All fields are optional. Only provided fields will be updated.

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "first_name": "Janusz",
    "last_name": "Nowak",
    "email": "janusz.nowak@example.com",
    "created_at": "2026-01-28T10:00:00.000000",
    "updated_at": "2026-01-28T10:15:00.000000"
  }
}
```

#### Get Account Balance
```http
GET /api/users/me/balance
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "account_balance": "1000.00",
  "currency": "PLN"
}
```

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Not a valid email address."],
    "password": ["Password must be at least 8 characters long"]
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid email or password"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Testing with cURL

### Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jan",
    "last_name": "Kowalski",
    "email": "jan.kowalski@example.com",
    "password": "securepass123",
    "account_balance": "1000.00"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jan.kowalski@example.com",
    "password": "securepass123"
  }'
```

### Get profile (replace TOKEN with actual token):
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer TOKEN"
```

### Get balance:
```bash
curl -X GET http://localhost:5000/api/users/me/balance \
  -H "Authorization: Bearer TOKEN"
```

### Update profile:
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Janusz",
    "email": "janusz.nowak@example.com"
  }'
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py        # App factory with create_app()
│   ├── auth.py            # JWT authentication decorator
│   ├── config.py          # Application configuration
│   ├── models.py          # SQLAlchemy User model
│   ├── routes.py          # Original hello-world route
│   ├── routes_auth.py     # Authentication endpoints
│   ├── routes_users.py    # User management endpoints
│   ├── schemas.py         # Marshmallow validation schemas
│   └── services.py        # Business logic service layer
├── .env.example           # Example environment variables
├── pyproject.toml         # Poetry dependencies
└── README.md              # This file
```

## Security Features

- **Password Hashing**: Uses Werkzeug's secure password hashing
- **JWT Tokens**: Time-limited access tokens (1 hour default)
- **Input Validation**: Marshmallow schemas validate all inputs
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **Unique Email**: Database constraint prevents duplicate emails
- **Error Handling**: Consistent error responses without exposing internals

## Database Schema

### User Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | Integer | Primary Key |
| first_name | String(100) | Not Null |
| last_name | String(100) | Not Null |
| email | String(120) | Unique, Not Null, Indexed |
| password_hash | String(255) | Not Null |
| account_balance | Numeric(15,2) | Not Null, Default 0.00 |
| created_at | DateTime | Not Null, Auto |
| updated_at | DateTime | Not Null, Auto |

## Development

The application follows Flask best practices:
- App factory pattern for configurability
- Blueprint organization for modular routes
- Service layer for business logic
- Marshmallow for data validation
- SQLAlchemy for database operations
- PEP8 code style compliance
