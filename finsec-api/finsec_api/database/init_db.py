import os
import sys
import datetime
import uuid
import pyotp
import time
import pymysql

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User, Session
from app.models.bill import Bill

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

def init_db():
    """Initialize the database with test data"""
    # Wait for the database to be available
    if not wait_for_db():
        sys.exit(1)
    
    app = create_app()
    
    with app.app_context():
        # Recreate all tables
        db.drop_all()
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
            
            if user_data['mfa_enabled']:
                user.mfa_secret = pyotp.random_base32()
                print(f"User {user.email} MFA secret: {user.mfa_secret}")
                print(f"Current OTP: {pyotp.TOTP(user.mfa_secret).now()}")
            
            db.session.add(user)
        
        db.session.commit()
        
        # Create a test session for the first user
        user = User.query.filter_by(email='john.doe@example.com').first()
        
        session = Session(
            user_id=user.id,
            session_id=str(uuid.uuid4()),
            device_info="Test Device",
            ip_address="127.0.0.1",
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=7)
        )
        
        db.session.add(session)
        db.session.commit()
        
        print("Creating test bills...")
        
        # Create test bills for the first user
        test_bills = [
            {
                'name': 'Electricity Bill',
                'category': 'Utilities',
                'amount': 150.00,
                'due_date': datetime.datetime.utcnow() + datetime.timedelta(days=7),
                'status': 'upcoming',
                'autopay': False
            },
            {
                'name': 'Internet Bill',
                'category': 'Utilities',
                'amount': 75.00,
                'due_date': datetime.datetime.utcnow() + datetime.timedelta(days=14),
                'status': 'upcoming',
                'autopay': True
            },
            {
                'name': 'Credit Card Payment',
                'category': 'Credit Cards',
                'amount': 500.00,
                'due_date': datetime.datetime.utcnow() + datetime.timedelta(days=21),
                'status': 'upcoming',
                'autopay': False
            },
            {
                'name': 'Netflix Subscription',
                'category': 'Entertainment',
                'amount': 15.99,
                'due_date': datetime.datetime.utcnow() + datetime.timedelta(days=5),
                'status': 'upcoming',
                'autopay': True
            },
            {
                'name': 'Water Bill',
                'category': 'Utilities',
                'amount': 85.50,
                'due_date': datetime.datetime.utcnow() + datetime.timedelta(days=10),
                'status': 'upcoming',
                'autopay': False
            },
            {
                'name': 'Phone Bill',
                'category': 'Telecommunications',
                'amount': 89.99,
                'due_date': datetime.datetime.utcnow() + datetime.timedelta(days=3),
                'status': 'upcoming',
                'autopay': True
            },
            {
                'name': 'Gym Membership',
                'category': 'Health & Fitness',
                'amount': 49.99,
                'due_date': datetime.datetime.utcnow() + datetime.timedelta(days=2),
                'status': 'upcoming',
                'autopay': True
            },
            {
                'name': 'Car Insurance',
                'category': 'Insurance',
                'amount': 175.00,
                'due_date': datetime.datetime.utcnow() + datetime.timedelta(days=15),
                'status': 'upcoming',
                'autopay': False
            },
            {
                'name': 'Mortgage Payment',
                'category': 'Housing',
                'amount': 1500.00,
                'due_date': datetime.datetime.utcnow() + datetime.timedelta(days=1),
                'status': 'upcoming',
                'autopay': True
            },
            {
                'name': 'Student Loan',
                'category': 'Loans',
                'amount': 350.00,
                'due_date': datetime.datetime.utcnow() + datetime.timedelta(days=12),
                'status': 'upcoming',
                'autopay': False
            }
        ]
        
        for bill_data in test_bills:
            bill = Bill(
                user_id=user.id,
                name=bill_data['name'],
                category=bill_data['category'],
                amount=bill_data['amount'],
                due_date=bill_data['due_date'],
                status=bill_data['status'],
                autopay=bill_data['autopay']
            )
            db.session.add(bill)
        
        db.session.commit()
        
        print("Database initialized with test data.")
        print(f"Created {User.query.count()} users, {Session.query.count()} sessions, and {Bill.query.count()} bills.")

if __name__ == '__main__':
    init_db() 