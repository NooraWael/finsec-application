import os
import sys

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User
from app.models.bill import Bill
from app.models.card import Card, Transaction
from datetime import datetime, timedelta
import random
import uuid
import unidecode

def generate_email(first_name, last_name):
    """Generate a realistic email from Arabic names"""
    base = f"{unidecode.unidecode(first_name.lower())}.{unidecode.unidecode(last_name.lower())}"
    domain = random.choice(["example.com"])
    return f"{base}@{domain}"

def setup_database():
    """Set up the database and create Arabic users and test bills"""
    app = create_app()
    
    with app.app_context():
        db.create_all()

        arabic_names = [
            ("Ahmed", "Al-Mansour"),
            ("Fatima", "Al-Fahad"),
            ("Omar", "Bin Khalid"),
            ("Layla", "Hassan"),
            ("Youssef", "Al-Saleh"),
            ("Amina", "Zahran"),
            ("Khalid", "Nour"),
            ("Huda", "Al-Hashimi"),
            ("Tariq", "El-Sayed"),
            ("Mona", "Abdelrahman")
        ]

        categories = ['Groceries', 'Utilities', 'Entertainment', 'Transportation']
        bill_names = {
            'Groceries': ['Walmart', 'Target', 'Whole Foods', 'Costco'],
            'Utilities': ['Electricity', 'Water', 'Gas', 'Internet'],
            'Entertainment': ['Netflix', 'Movie Theater', 'Concert Tickets', 'Gaming'],
            'Transportation': ['Gas', 'Car Payment', 'Bus Pass', 'Train Ticket']
        }

        today = datetime.now()
        
        for first_name, last_name in arabic_names:
            email = generate_email(first_name, last_name)

            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True
                )
                user.set_password('password123')
                db.session.add(user)
                db.session.commit()
                print(f"Created user: {first_name} {last_name} ({email})")
            
            # Create bills
            bill_count = 0
            for i in range(60):
                date = today - timedelta(days=i)
                category = random.choice(categories)
                name = random.choice(bill_names[category])
                amount = random.randint(1000, 20000) / 100
                status = 'paid' if i > 30 else 'upcoming'
                
                bill = Bill(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    name=name,
                    category=category,
                    amount=amount,
                    due_date=date,
                    status=status,
                    autopay=random.choice([True, False])
                )
                db.session.add(bill)
                bill_count += 1
            
            db.session.commit()
            print(f"Added {bill_count} bills for {email}")
            
            # Create test cards for each user
            card_networks = ['visa', 'mastercard', 'amex']
            card_types = ['Credit', 'Debit']
            
            # Create 3 cards for each user
            for i in range(3):
                card = Card(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    card_holder=f"{first_name} {last_name}",
                    card_number=''.join([str(random.randint(0, 9)) for _ in range(16)]),
                    expiry_date=f"{random.randint(1, 12):02d}/{random.randint(24, 28)}",
                    card_type=random.choice(card_types),
                    balance=random.uniform(1000, 10000),
                    bank_name='Example Bank',
                    rewards_points=random.randint(100, 5000),
                    card_network=random.choice(card_networks),
                    daily_limit=5000.0,
                    monthly_limit=15000.0
                )
                db.session.add(card)
            
            db.session.commit()
            print(f"Added 3 test cards for {email}")

            # Create transactions for each user
            transaction_categories = {
                'Groceries': ['Walmart', 'Target', 'Whole Foods', 'Costco', 'Local Market'],
                'Dining': ['Starbucks', 'McDonalds', 'Pizza Hut', 'Local Restaurant', 'Food Delivery'],
                'Shopping': ['Amazon', 'Best Buy', 'Nike', 'Zara', 'Apple Store'],
                'Transportation': ['Uber', 'Lyft', 'Gas Station', 'Public Transit', 'Parking'],
                'Entertainment': ['Netflix', 'Spotify', 'Movie Theater', 'Concert', 'Gaming'],
                'Utilities': ['Electricity', 'Water', 'Internet', 'Phone', 'Cable'],
                'Healthcare': ['Pharmacy', 'Doctor', 'Dentist', 'Hospital', 'Insurance'],
                'Travel': ['Airline', 'Hotel', 'Rental Car', 'Travel Agency', 'Tour']
            }

            # Get user's cards
            cards = Card.query.filter_by(user_id=user.id).all()
            if not cards:
                print(f"No cards found for user {user.email}")
                continue

            # Generate transactions for the last 90 days
            transaction_count = 0
            for i in range(90):
                date = today - timedelta(days=i)
                
                # Randomly select a card
                card = random.choice(cards)
                
                # Randomly select a category and merchant
                category = random.choice(list(transaction_categories.keys()))
                merchant = random.choice(transaction_categories[category])
                
                # Generate random amount (between $1 and $500)
                amount = random.uniform(1, 500)
                
                # Randomly make it a credit or debit
                if random.random() < 0.3:  # 30% chance of being a credit
                    amount = -amount
                
                # Create transaction
                transaction = Transaction(
                    id=str(uuid.uuid4()),
                    card_id=card.id,
                    amount=amount,
                    merchant=merchant,
                    category=category,
                    status='completed',
                    created_at=date
                )
                
                db.session.add(transaction)
                transaction_count += 1
                
                # Commit every 10 transactions to avoid memory issues
                if transaction_count % 10 == 0:
                    db.session.commit()
            
            # Final commit for any remaining transactions
            db.session.commit()
            print(f"Added {transaction_count} transactions for user {user.email}")

if __name__ == "__main__":
    setup_database()
