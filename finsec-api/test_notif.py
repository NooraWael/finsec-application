import requests
import json

# Base URL
base_url = 'http://host.docker.internal:5000/api'

# Step 1: Login and get token
def login():
    print('=== Login Test ===')
    login_url = f'{base_url}/auth/login'
    login_data = {
        'email': 'john.doe@example.com',
        'password': 'password123'
    }
    response = requests.post(login_url, json=login_data)
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get('access_token')
        print('Login successful!')
        return token
    else:
        print(f'Login failed with status {response.status_code}')
        print(f'Response: {response.text}')
        return None

# Step 2: Test notifications endpoints
def test_notifications(token):
    headers = {'Authorization': f'Bearer {token}'}
    
    print('\n=== Get Notifications Test ===')
    notif_url = f'{base_url}/notifications'
    response = requests.get(notif_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        notifications = data.get('notifications', [])
        print(f'Retrieved {len(notifications)} notifications')
        if notifications:
            for i, notif in enumerate(notifications[:3], 1):
                print(f"{i}. {notif.get('title')} - {notif.get('type')} - Read: {notif.get('read')}")
            if len(notifications) > 3:
                print(f'... and {len(notifications) - 3} more')
    else:
        print(f'Failed to get notifications: {response.status_code}')
        print(f'Response: {response.text}')
    
    print('\n=== Get Notification Settings Test ===')
    settings_url = f'{base_url}/notifications/settings'
    response = requests.get(settings_url, headers=headers)
    if response.status_code == 200:
        settings = response.json()
        print('Settings retrieved successfully:')
        print(f"Push enabled: {settings.get('pushEnabled')}")
        print(f"Email enabled: {settings.get('emailEnabled')}")
        print('Categories:')
        for category, enabled in settings.get('categories', {}).items():
            print(f'  - {category}: {enabled}')
    else:
        print(f'Failed to get notification settings: {response.status_code}')
        print(f'Response: {response.text}')
    
    print('\n=== Update Notification Settings Test ===')
    new_settings = {
        'pushEnabled': True,
        'emailEnabled': False,
        'categories': {
            'transactions': True,
            'security': True,
            'promotions': True
        }
    }
    response = requests.put(settings_url, headers=headers, json=new_settings)
    if response.status_code == 200:
        settings = response.json()
        print('Settings updated successfully:')
        print(f"Push enabled: {settings.get('pushEnabled')}")
        print(f"Email enabled: {settings.get('emailEnabled')}")
        print('Categories:')
        for category, enabled in settings.get('categories', {}).items():
            print(f'  - {category}: {enabled}')
    else:
        print(f'Failed to update notification settings: {response.status_code}')
        print(f'Response: {response.text}')
    
    if notifications:
        unread_notification = next((n for n in notifications if not n.get('read')), None)
        if unread_notification:
            print(f'\n=== Mark Notification as Read Test ===')
            notification_id = unread_notification.get('id')
            mark_read_url = f'{base_url}/notifications/{notification_id}/read'
            response = requests.put(mark_read_url, headers=headers)
            if response.status_code == 200:
                print(f'Notification marked as read successfully!')
            else:
                print(f'Failed to mark notification as read: {response.status_code}')
                print(f'Response: {response.text}')

if __name__ == '__main__':
    token = login()
    if token:
        test_notifications(token) 