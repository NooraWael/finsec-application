#!/usr/bin/env python3
import os
import sys
import time
import pymysql
from . import create_app, db
from .models.user import User, Session
from .models.card import Card, Transaction
from .models.notification import Notification, NotificationSettings
import pyotp
import uuid
import datetime

def wait_for_db():
    """Wait for the database to be ready"""
    db_host = os.environ.get('MYSQL_HOST', 'db')
    db_port = int(os.environ.get('MYSQL_PORT', '3307'))
    db_user = os.environ.get('MYSQL_USER', 'finsec_user')
    db_pass = os.environ.get('MYSQL_PASSWORD', 'finsec_password')
    db_name = os.environ.get('MYSQL_DB', 'finsec_db')
    
    print(f"Waiting for database connection (host: {db_host}, port: {db_port}, database: {db_name})...")
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            print(f"Attempt {retry_count + 1}/{max_retries}: Connecting to database...")
            connection = pymysql.connect(
                host=db_host,
                port=db_port,
                user=db_user,
                password=db_pass,
                database=db_name,
                connect_timeout=5
            )
            connection.close()
            print("Successfully connected to the database!")
            return True
        except Exception as e:
            retry_count += 1
            if retry_count >= max_retries:
                print(f"Failed to connect to database after {max_retries} attempts")
                return False
            print(f"Connection failed: {str(e)}")
            print("Retrying in 2 seconds...")
            time.sleep(2)

def create_test_data():
    """Create test users and cards"""
    try:
        # Create test user if not exists
        test_user = User.query.filter_by(email='john.doe@example.com').first()
        if not test_user:
            test_user = User(
                email='john.doe@example.com',
                first_name='John',
                last_name='Doe',
                is_active=True
            )
            test_user.set_password('password123')
            db.session.add(test_user)
            db.session.commit()
            print("Test user created successfully!")
        
        # Create test card if not exists
        test_card = Card.query.filter_by(user_id=test_user.id).first()
        if not test_card:
            test_card = Card(
                id=str(uuid.uuid4()),
                user_id=test_user.id,
                card_holder='John Doe',
                card_number='4111111111111111',
                expiry_date='12/25',
                card_type='Credit',
                balance=5000.00,
                bank_name='Example Bank',
                rewards_points=1000,
                card_network='visa'
            )
            db.session.add(test_card)
            db.session.commit()
            print("Test card created successfully!")
            
            # Create test transactions
            test_transactions = [
                {
                    'amount': -50.00,
                    'merchant': 'Starbucks',
                    'category': 'Food & Dining',
                    'status': 'completed',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(hours=2)
                },
                {
                    'amount': -120.50,
                    'merchant': 'Amazon',
                    'category': 'Shopping',
                    'status': 'completed',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(days=2)
                },
                {
                    'amount': 1000.00,
                    'merchant': 'Salary Deposit',
                    'category': 'Income',
                    'status': 'completed',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(days=5)
                },
                {
                    'amount': -75.25,
                    'merchant': 'Shell Gas Station',
                    'category': 'Transportation',
                    'status': 'completed',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(days=1)
                },
                {
                    'amount': -200.00,
                    'merchant': 'Best Buy',
                    'category': 'Electronics',
                    'status': 'pending',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(hours=1)
                }
            ]
            
            for txn_data in test_transactions:
                transaction = Transaction(
                    id=str(uuid.uuid4()),
                    card_id=test_card.id,
                    **txn_data
                )
                db.session.add(transaction)
            
            db.session.commit()
            print("Test transactions created successfully!")
            
        # Create test notifications if none exist
        if not Notification.query.filter_by(user_id=test_user.id).first():
            test_notifications = [
                {
                    'title': 'Large Transaction Alert',
                    'message': 'A transaction of $200.00 was made at Best Buy.',
                    'type': 'transaction',
                    'timestamp': datetime.datetime.utcnow() - datetime.timedelta(hours=1),
                    'read': False,
                    'action_url': '/transactions'
                },
                {
                    'title': 'Security Alert',
                    'message': 'Your password was changed successfully.',
                    'type': 'security',
                    'timestamp': datetime.datetime.utcnow() - datetime.timedelta(days=2),
                    'read': True,
                    'action_url': '/security'
                },
                {
                    'title': 'New Rewards Available',
                    'message': 'You have earned 500 reward points from your recent purchases!',
                    'type': 'promotion',
                    'timestamp': datetime.datetime.utcnow() - datetime.timedelta(days=3),
                    'read': False,
                    'action_url': '/rewards'
                },
                {
                    'title': 'System Maintenance',
                    'message': 'Our system will be undergoing maintenance on Sunday from 2AM-4AM ET.',
                    'type': 'system',
                    'timestamp': datetime.datetime.utcnow() - datetime.timedelta(days=1),
                    'read': False,
                    'action_url': None
                },
                {
                    'title': 'Bill Payment Reminder',
                    'message': 'Your credit card payment is due in 3 days.',
                    'type': 'transaction',
                    'timestamp': datetime.datetime.utcnow() - datetime.timedelta(hours=12),
                    'read': False,
                    'action_url': '/bills'
                }
            ]
            
            for notif_data in test_notifications:
                notification = Notification(
                    id=str(uuid.uuid4()),
                    user_id=test_user.id,
                    **notif_data
                )
                db.session.add(notification)
            
            db.session.commit()
            print("Test notifications created successfully!")
        
        # Create notification settings if none exist
        if not NotificationSettings.query.filter_by(user_id=test_user.id).first():
            settings = NotificationSettings(
                id=str(uuid.uuid4()),
                user_id=test_user.id,
                push_enabled=True,
                email_enabled=True,
                transactions_enabled=True,
                security_enabled=True,
                promotions_enabled=False
            )
            db.session.add(settings)
            db.session.commit()
            print("Test notification settings created successfully!")
            
    except Exception as e:
        print(f"Error creating test data: {str(e)}")
        db.session.rollback()

def create_tables():
    """Create database tables"""
    if not wait_for_db():
        print("Failed to connect to the database after multiple attempts. Exiting.")
        sys.exit(1)
    
    app = create_app()
    with app.app_context():
        print("Creating database tables...")
        try:
            db.create_all()
            print("Database tables created successfully!")
            
            # Check if we need to create test users
            user_count = User.query.count()
            if user_count == 0:
                print("No users found. Creating test users...")
                
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
                    }
                ]
                
                for user_data in test_users:
                    user = User(
                        email=user_data['email'],
                        first_name=user_data['first_name'],
                        last_name=user_data['last_name'],
                        phone_number=user_data['phone_number'],
                        mfa_enabled=user_data['mfa_enabled']
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
                
                print("Test users created successfully!")

            # Create test card for the first user
            test_card = Card.query.filter_by(user_id=user.id).first()
            if not test_card:
                test_card = Card(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    card_holder='John Doe',
                    card_number='4111111111111111',
                    expiry_date='12/25',
                    card_type='Credit',
                    balance=5000.00,
                    bank_name='Example Bank',
                    rewards_points=1000,
                    card_network='visa'
                )
                db.session.add(test_card)
                db.session.commit()
                print("Test card created successfully!")
        except Exception as e:
            print(f"Error creating database tables: {e}")
            sys.exit(1)

if __name__ == "__main__":
    if wait_for_db():
        app = create_app()
        with app.app_context():
            db.create_all()
            
            # Create test user if not exists
            test_user = User.query.filter_by(email='john.doe@example.com').first()
            if not test_user:
                test_user = User(
                    email='john.doe@example.com',
                    first_name='John',
                    last_name='Doe',
                    is_active=True
                )
                test_user.set_password('password123')
                db.session.add(test_user)
                db.session.commit()
                print("Test user created successfully!")
            
            # Create test card if not exists
            test_card = Card.query.filter_by(user_id=test_user.id).first()
            if not test_card:
                test_card = Card(
                    id=str(uuid.uuid4()),
                    user_id=test_user.id,
                    card_holder='John Doe',
                    card_number='4111111111111111',
                    expiry_date='12/25',
                    card_type='Credit',
                    balance=5000.00,
                    bank_name='Example Bank',
                    rewards_points=1000,
                    card_network='visa'
                )
                db.session.add(test_card)
                db.session.commit()
                print("Test card created successfully!")
            
            # Create test transactions if none exist
            if not Transaction.query.first():
                test_transactions = [
                    {
                        'amount': -50.00,
                        'merchant': 'Starbucks',
                        'category': 'Food & Dining',
                        'status': 'completed',
                        'created_at': datetime.datetime.utcnow() - datetime.timedelta(hours=2)
                    },
                    {
                        'amount': -120.50,
                        'merchant': 'Amazon',
                        'category': 'Shopping',
                        'status': 'completed',
                        'created_at': datetime.datetime.utcnow() - datetime.timedelta(days=2)
                    },
                    {
                        'amount': 1000.00,
                        'merchant': 'Salary Deposit',
                        'category': 'Income',
                        'status': 'completed',
                        'created_at': datetime.datetime.utcnow() - datetime.timedelta(days=5)
                    },
                    {
                        'amount': -75.25,
                        'merchant': 'Shell Gas Station',
                        'category': 'Transportation',
                        'status': 'completed',
                        'created_at': datetime.datetime.utcnow() - datetime.timedelta(days=1)
                    },
                    {
                        'amount': -200.00,
                        'merchant': 'Best Buy',
                        'category': 'Electronics',
                        'status': 'pending',
                        'created_at': datetime.datetime.utcnow() - datetime.timedelta(hours=1)
                    }
                ]
                
                for txn_data in test_transactions:
                    transaction = Transaction(
                        id=str(uuid.uuid4()),
                        card_id=test_card.id,
                        **txn_data
                    )
                    db.session.add(transaction)
                
                db.session.commit()
                print("Test transactions created successfully!")
            
            print("Database tables created successfully!") 