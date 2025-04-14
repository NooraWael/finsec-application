import requests
import json
from datetime import datetime, timedelta
import random

BASE_URL = "http://localhost:5000/api"

def login():
    """Login and get access token"""
    print("\n=== Logging in ===")
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "john.doe@example.com",
        "password": "password123"
    })
    data = response.json()
    return data.get('access_token')

def add_test_bills(access_token):
    """Add some test bills with different categories and dates"""
    print("\n=== Adding test bills ===")
    categories = ['Groceries', 'Utilities', 'Entertainment', 'Transportation']
    today = datetime.now()
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # Add bills for the last 60 days
    for i in range(60):
        date = today - timedelta(days=i)
        category = random.choice(categories)
        amount = random.randint(10, 200)
        
        bill_data = {
            "category": category,
            "amount": amount,
            "due_date": date.strftime("%Y-%m-%d"),
            "description": f"Test bill for {category}"
        }
        
        response = requests.post(
            f"{BASE_URL}/bills/add",
            headers=headers,
            json=bill_data
        )
        if response.status_code != 200:
            print(f"Failed to add bill: {response.json()}")

def test_spending_analytics(access_token):
    """Test the spending analytics endpoint"""
    print("\n=== Testing spending analytics ===")
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # Test for different periods
    periods = ['week', 'month', 'year']
    for period in periods:
        print(f"\nTesting {period} period:")
        response = requests.get(
            f"{BASE_URL}/analytics/spending?period={period}",
            headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    # Login and get access token
    access_token = login()
    if not access_token:
        print("Failed to login")
        exit(1)
    
    # Add test data
    add_test_bills(access_token)
    
    # Test analytics endpoint
    test_spending_analytics(access_token) 