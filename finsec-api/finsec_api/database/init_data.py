import os
import sys
import time
import pymysql
from werkzeug.security import generate_password_hash

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User, Session

def wait_for_db(max_retries=30):
    """Wait for the database to be available"""
    db_host = os.environ.get('MYSQL_HOST', 'db')
    db_user = os.environ.get('MYSQL_USER', 'finsec_user')
    db_password = os.environ.get('MYSQL_PASSWORD', 'finsec_password')
    db_name = os.environ.get('MYSQL_DB', 'finsec_db')
    db_port = int(os.environ.get('MYSQL_PORT', '3307'))
    
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            print(f"Attempting to connect to database: mysql+pymysql://{db_user}:***@{db_host}:{db_port}/{db_name}")
            connection = pymysql.connect(
                host=db_host,
                user=db_user,
                password=db_password,
                database=db_name,
                port=db_port,
                connect_timeout=5
            )
            connection.close()
            print("Successfully connected to the database")
            return True
        except Exception as e:
            retry_count += 1
            print(f"Attempt {retry_count}/{max_retries}: Failed to connect to database")
            print(f"Error: {str(e)}")
            if retry_count >= max_retries:
                print("Maximum retries reached. Could not connect to database.")
                return False
            time.sleep(2)  # Wait for 2 seconds before retrying

def init_data():
    """Initialize the database with test data"""
    # Wait for the database to be available
    if not wait_for_db():
        sys.exit(1)
    
    app = create_app()
    
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        
        print("Creating test users...")
        
        # Create test users
        test_users = [
            {
                'email': 'john.doe@example.com',
                'password': 'password123',
                'first_name': 'John',
                'last_name': 'Doe',
                'phone_number': '+15551234567',
                'mfa_enabled': False
            },
            {
                'email': 'jane.smith@example.com',
                'password': 'password123',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'phone_number': '+15557654321',
                'mfa_enabled': True
            },
            {
                'email': 'ali@example.com',
                'password': 'test123@123',
                'first_name': 'Ali',
                'last_name': 'Khan',
                'phone_number': '+15557654321',
                'mfa_enabled': False
            },
            {
                'email': 'sarah.wilson@example.com',
                'password': 'securePass456',
                'first_name': 'Sarah',
                'last_name': 'Wilson',
                'phone_number': '+15558889999',
                'mfa_enabled': True,
                'preferred_name': 'Sara'
            },
            {
                'email': 'michael.brown@example.com',
                'password': 'mikePass789',
                'first_name': 'Michael',
                'last_name': 'Brown',
                'phone_number': '+15553334444',
                'mfa_enabled': False,
                'address': '123 Main St, New York, NY 10001'
            },
            {
                'email': 'emma.davis@example.com',
                'password': 'emmaSecure2023',
                'first_name': 'Emma',
                'last_name': 'Davis',
                'phone_number': '+15556667777',
                'mfa_enabled': True,
                'preferred_name': 'Em'
            },
            {
                'email': 'david.lee@example.com',
                'password': 'davidPass123',
                'first_name': 'David',
                'last_name': 'Lee',
                'phone_number': '+15552223333',
                'mfa_enabled': False,
                'address': '456 Oak Ave, Los Angeles, CA 90001'
            }
        ]
        
        for user_data in test_users:
            # Check if user already exists
            existing_user = User.query.filter_by(email=user_data['email']).first()
            if not existing_user:
                user = User(
                    email=user_data['email'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    phone_number=user_data['phone_number'],
                    mfa_enabled=user_data['mfa_enabled'],
                    preferred_name=user_data.get('preferred_name'),
                    address=user_data.get('address'),
                    is_active=True
                )
                user.set_password(user_data['password'])
                db.session.add(user)
                print(f"Created user: {user.email}")
        
        db.session.commit()
        print("Test users created successfully!")

if __name__ == '__main__':
    init_data() 