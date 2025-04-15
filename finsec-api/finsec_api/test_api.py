import json
import requests
import sys

BASE_URL = "http://localhost:5000/api"

def test_login(email, password):
    """Test the login endpoint"""
    print("\n=== Testing Login ===")
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": email,
        "password": password
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(data, indent=2)}")
    
    if "requireMfa" in data and data["requireMfa"]:
        return data["userId"], None
    elif "access_token" in data:
        return data["user"]["id"], data["access_token"]
    else:
        return None, None

def test_verify_mfa(user_id, otp_code):
    """Test the MFA verification endpoint"""
    print("\n=== Testing MFA Verification ===")
    url = f"{BASE_URL}/auth/verify-mfa"
    payload = {
        "userId": user_id,
        "otpCode": otp_code
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(data, indent=2)}")
    
    if "access_token" in data:
        return data["access_token"]
    else:
        return None

def test_logout(user_id, session_id, access_token):
    """Test the logout endpoint"""
    print("\n=== Testing Logout ===")
    url = f"{BASE_URL}/auth/logout"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    payload = {
        "userId": user_id,
        "sessionId": session_id
    }
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(data, indent=2)}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python test_api.py <email> <password> [otp_code]")
        return
    
    email = sys.argv[1]
    password = sys.argv[2]
    otp_code = sys.argv[3] if len(sys.argv) > 3 else None
    
    # Test login
    user_id, access_token = test_login(email, password)
    
    if user_id and not access_token and otp_code:
        # If MFA is required and OTP code is provided, test MFA verification
        access_token = test_verify_mfa(user_id, otp_code)
    
    if access_token:
        # Extract session_id from JWT payload
        # In a real test, you'd parse the JWT to get the session_id
        # For simplicity, we'll just use a placeholder
        session_id = "test_session"
        test_logout(user_id, session_id, access_token)

if __name__ == "__main__":
    main() 