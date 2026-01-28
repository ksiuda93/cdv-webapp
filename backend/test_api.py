"""Manual test script for API endpoints.

Run this script with the Flask server running to test all endpoints.

Usage:
    poetry run python test_api.py
"""

import requests


BASE_URL = "http://localhost:5000/api"


def test_register():
    """Test user registration."""
    print("\n=== Testing Registration ===")
    url = f"{BASE_URL}/auth/register"
    data = {
        "first_name": "Jan",
        "last_name": "Kowalski",
        "email": "jan.kowalski@example.com",
        "password": "securepass123",
        "account_balance": "1000.00",
    }

    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 201:
        return response.json().get("access_token")
    return None


def test_login():
    """Test user login."""
    print("\n=== Testing Login ===")
    url = f"{BASE_URL}/auth/login"
    data = {
        "email": "jan.kowalski@example.com",
        "password": "securepass123",
    }

    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 200:
        return response.json().get("access_token")
    return None


def test_get_profile(token):
    """Test getting user profile."""
    print("\n=== Testing Get Profile ===")
    url = f"{BASE_URL}/users/me"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")


def test_update_profile(token):
    """Test updating user profile."""
    print("\n=== Testing Update Profile ===")
    url = f"{BASE_URL}/users/me"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "first_name": "Janusz",
        "last_name": "Nowak",
    }

    response = requests.put(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")


def test_get_balance(token):
    """Test getting account balance."""
    print("\n=== Testing Get Balance ===")
    url = f"{BASE_URL}/users/me/balance"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")


def test_invalid_token():
    """Test with invalid token."""
    print("\n=== Testing Invalid Token ===")
    url = f"{BASE_URL}/users/me"
    headers = {"Authorization": "Bearer invalid_token"}

    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")


def main():
    """Run all tests."""
    print("=" * 60)
    print("Bank API Test Suite")
    print("=" * 60)

    try:
        # Test registration
        token = test_register()

        if not token:
            print("\n! Registration failed, trying login instead...")
            token = test_login()

        if not token:
            print("\n! Could not obtain token. Tests stopped.")
            return

        # Test protected endpoints
        test_get_profile(token)
        test_update_profile(token)
        test_get_balance(token)

        # Test error cases
        test_invalid_token()

        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)

    except requests.exceptions.ConnectionError:
        print("\n! Error: Could not connect to the server.")
        print("! Make sure the Flask server is running:")
        print("! poetry run flask --app 'app:create_app()' run --port 5000")


if __name__ == "__main__":
    main()
