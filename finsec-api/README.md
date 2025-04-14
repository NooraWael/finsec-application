# FinSec Banking API

A secure banking API built with Flask and MySQL that provides authentication and financial management capabilities.

## Features

- **Secure Authentication**
  - Login and password authentication
  - Two-factor authentication (2FA)
  - Session management
  - Secure logout

## Project Structure

```
finsec_api/
├── app/                # Application code
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── schemas/        # Serialization schemas
│   ├── utils/          # Utility functions
│   └── __init__.py     # App initialization
├── database/           # Database related scripts
│   └── init_db.py      # Database initialization
├── Dockerfile          # Docker configuration
├── requirements.txt    # Python dependencies
└── run.py              # Application entry point
```

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Running the Application

1. Clone the repository
2. Run the following command to start the application:

```bash
docker-compose up --build
```

3. Set the correct permissions for the project files:

```bash
chmod -R 755 ./
```

4. The API will be available at http://localhost:5000

### Initializing Test Data

To initialize the database with test data, run:

```bash
docker-compose exec api python -m database.init_db
```

This will create test users that you can use to test the API endpoints.

## API Endpoints

### Authentication

#### Login

```
POST /api/auth/login

Request:
{
  "email": "john.doe@example.com",
  "password": "password123"
}

Response (without MFA):
{
  "message": "Login successful",
  "access_token": "jwt_token",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    ...
  }
}

Response (with MFA):
{
  "message": "MFA verification required",
  "userId": 1,
  "requireMfa": true
}
```

#### MFA Verification

```
POST /api/auth/verify-mfa

Request:
{
  "userId": 1,
  "otpCode": "123456"
}

Response:
{
  "message": "MFA verification successful",
  "access_token": "jwt_token",
  "user": {
    "id": 1,
    "email": "jane.smith@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    ...
  }
}
```

#### Logout

```
POST /api/auth/logout

Headers:
Authorization: Bearer jwt_token

Request:
{
  "userId": 1,
  "sessionId": "session_uuid"
}

Response:
{
  "message": "Logged out successfully"
}
```

## Security Features

- Password hashing with Werkzeug
- TOTP-based two-factor authentication
- JWT for secure API authentication
- Session management to handle multiple devices

## Development Roadmap

Future API endpoints will include:

- Account management
- Transaction history
- Money transfers
- Bill payments
- Spending analytics
