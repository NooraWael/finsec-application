import os
import sys
from datetime import datetime, timedelta
import random
import uuid

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User
from app.models.card import Card, Transaction

def setup_transactions():
    """Set up test transactions for all users"""
    app = create_app()
    
    with app.app_context():
        # Get all users
        users = User.query.all()
        
        # Transaction categories and merchants
        categories = {
            'Groceries': ['Walmart', 'Target', 'Whole Foods', 'Costco', 'Local Market'],
            'Dining': ['Starbucks', 'McDonalds', 'Pizza Hut', 'Local Restaurant', 'Food Delivery'],
            'Shopping': ['Amazon', 'Best Buy', 'Nike', 'Zara', 'Apple Store'],
            'Transportation': ['Uber', 'Lyft', 'Gas Station', 'Public Transit', 'Parking'],
            'Entertainment': ['Netflix', 'Spotify', 'Movie Theater', 'Concert', 'Gaming'],
            'Utilities': ['Electricity', 'Water', 'Internet', 'Phone', 'Cable'],
            'Healthcare': ['Pharmacy', 'Doctor', 'Dentist', 'Hospital', 'Insurance'],
            'Travel': ['Airline', 'Hotel', 'Rental Car', 'Travel Agency', 'Tour']
        }
        
        # Generate transactions for each user
        for user in users:
            print(f"Creating transactions for user: {user.email}")
            
            # Get user's cards
            cards = Card.query.filter_by(user_id=user.id).all()
            if not cards:
                print(f"No cards found for user {user.email}")
                continue
            
            # Generate transactions for the last 90 days
            today = datetime.now()
            transaction_count = 0
            
            for i in range(90):
                date = today - timedelta(days=i)
                
                # Randomly select a card
                card = random.choice(cards)
                
                # Randomly select a category and merchant
                category = random.choice(list(categories.keys()))
                merchant = random.choice(categories[category])
                
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
    setup_transactions() 