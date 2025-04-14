import requests
import json

# API base URL
base_url = "http://localhost:5000/api"

def test_notification_api():
    # Step 1: Login to get a token
    login_url = f"{base_url}/auth/login"
    login_data = {
        "email": "john.doe@example.com",
        "password": "password123"
    }
    
    print("1. Logging in to get access token...")
    login_response = requests.post(login_url, json=login_data)
    
    if login_response.status_code != 200:
        print(f"Login failed with status code: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        return
    
    print("Login successful!")
    token_data = login_response.json()
    access_token = token_data.get("accessToken")
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Step 2: Get notifications
    print("\n2. Getting notifications...")
    notifications_url = f"{base_url}/notifications"
    notifications_response = requests.get(notifications_url, headers=headers)
    
    if notifications_response.status_code != 200:
        print(f"Get notifications failed with status code: {notifications_response.status_code}")
        print(f"Response: {notifications_response.text}")
    else:
        print("Notifications retrieved successfully!")
        notifications = notifications_response.json().get("notifications", [])
        print(f"Found {len(notifications)} notifications:")
        for i, notification in enumerate(notifications[:3], 1):  # Show first 3 notifications
            print(f"  {i}. {notification['title']} - {notification['type']} - Read: {notification['read']}")
        if len(notifications) > 3:
            print(f"  ... and {len(notifications) - 3} more")
    
    # Step 3: Get notification settings
    print("\n3. Getting notification settings...")
    settings_url = f"{base_url}/notifications/settings"
    settings_response = requests.get(settings_url, headers=headers)
    
    if settings_response.status_code != 200:
        print(f"Get notification settings failed with status code: {settings_response.status_code}")
        print(f"Response: {settings_response.text}")
    else:
        print("Notification settings retrieved successfully!")
        settings = settings_response.json()
        print(f"  Push Enabled: {settings.get('pushEnabled')}")
        print(f"  Email Enabled: {settings.get('emailEnabled')}")
        print(f"  Categories:")
        categories = settings.get('categories', {})
        for category, enabled in categories.items():
            print(f"    - {category}: {enabled}")
    
    # Step 4: Update notification settings
    print("\n4. Updating notification settings...")
    new_settings = {
        "pushEnabled": True,
        "emailEnabled": False,
        "categories": {
            "transactions": True,
            "security": True,
            "promotions": True
        }
    }
    
    update_settings_response = requests.put(settings_url, headers=headers, json=new_settings)
    
    if update_settings_response.status_code != 200:
        print(f"Update notification settings failed with status code: {update_settings_response.status_code}")
        print(f"Response: {update_settings_response.text}")
    else:
        print("Notification settings updated successfully!")
        updated_settings = update_settings_response.json()
        print(f"  Push Enabled: {updated_settings.get('pushEnabled')}")
        print(f"  Email Enabled: {updated_settings.get('emailEnabled')}")
        print(f"  Categories:")
        categories = updated_settings.get('categories', {})
        for category, enabled in categories.items():
            print(f"    - {category}: {enabled}")
    
    # Step 5: Mark a notification as read (if we have any unread notifications)
    if notifications and len(notifications) > 0:
        unread_notification = next((n for n in notifications if not n["read"]), None)
        
        if unread_notification:
            notification_id = unread_notification["id"]
            print(f"\n5. Marking notification '{unread_notification['title']}' as read...")
            mark_read_url = f"{base_url}/notifications/{notification_id}/read"
            mark_read_response = requests.put(mark_read_url, headers=headers)
            
            if mark_read_response.status_code != 200:
                print(f"Mark notification as read failed with status code: {mark_read_response.status_code}")
                print(f"Response: {mark_read_response.text}")
            else:
                print("Notification marked as read successfully!")

if __name__ == "__main__":
    print("Testing the Notification API")
    print("============================")
    test_notification_api()
    print("\nTests completed!") 