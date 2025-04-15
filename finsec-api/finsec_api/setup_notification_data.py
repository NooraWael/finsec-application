#!/usr/bin/env python3
import sys
import os
import time
import datetime
import uuid
import pymysql

from app import create_app, db
from app.models.user import User
from app.models.notification import Notification, NotificationSettings

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

def setup_notification_data():
    # Create app context
    app = create_app()
    
    with app.app_context():
        print("Creating test notification data...")
        
        # Get test user
        test_user = User.query.filter_by(email='john.doe@example.com').first()
        if not test_user:
            print("Test user not found!")
            return
        
        # Create notification settings if not exist
        settings = NotificationSettings.query.filter_by(user_id=test_user.id).first()
        if not settings:
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
            print("Created notification settings for user")
        
        # Create test notifications if not exist
        notification_count = Notification.query.filter_by(user_id=test_user.id).count()
        if notification_count == 0:
            # Create sample notifications
            test_notifications = [
                {
                    'title': 'Large Transaction Alert',
                    'message': 'A transaction of $200.00 was made at Best Buy.',
                    'type': 'transaction',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(hours=1),
                    'read': False,
                    'action_url': '/transactions'
                },
                {
                    'title': 'Security Alert',
                    'message': 'Your password was changed successfully.',
                    'type': 'security',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(days=2),
                    'read': True,
                    'action_url': '/security'
                },
                {
                    'title': 'New Rewards Available',
                    'message': 'You have earned 500 reward points from your recent purchases!',
                    'type': 'promotion',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(days=3),
                    'read': False,
                    'action_url': '/rewards'
                },
                {
                    'title': 'System Maintenance',
                    'message': 'Our system will be undergoing maintenance on Sunday from 2AM-4AM ET.',
                    'type': 'system',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(days=1),
                    'read': False,
                    'action_url': None
                },
                {
                    'title': 'Bill Payment Reminder',
                    'message': 'Your credit card payment is due in 3 days.',
                    'type': 'transaction',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(hours=12),
                    'read': False,
                    'action_url': '/bills'
                },
                {
                    'title': 'Security Verification Required',
                    'message': 'We noticed a login from a new device. Please verify your identity.',
                    'type': 'security',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(hours=6),
                    'read': False,
                    'action_url': '/security/verify'
                },
                {
                    'title': 'Limited Time Offer',
                    'message': 'Get 5% cashback on all purchases this weekend!',
                    'type': 'promotion',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(hours=24),
                    'read': False,
                    'action_url': '/offers'
                },
                {
                    'title': 'Recurring Payment Processed',
                    'message': 'Your subscription payment of $9.99 to Netflix was processed successfully.',
                    'type': 'transaction',
                    'created_at': datetime.datetime.utcnow() - datetime.timedelta(days=5),
                    'read': True,
                    'action_url': '/transactions'
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
            print(f"Added {len(test_notifications)} test notifications for user")
        
        print("Test notification data setup complete!")

if __name__ == "__main__":
    if wait_for_db():
        setup_notification_data()
    else:
        print("Failed to connect to the database.")
        sys.exit(1) 