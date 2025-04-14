import os
import sys
import uuid
from datetime import datetime, timedelta
import random

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the Flask app and models
from app import create_app, db
from app.models.card import Card, Transaction
from app.models.user import User

def setup_analytics_data():
    """Add sample transaction data for analytics testing"""
    print("Setting up analytics test data...")
    
    app = create_app()
    
    with app.app_context():
        # Find the first user in the system
        user = User.query.first()
        if not user:
            print("No users found in the system. Please run the setup script first.")
            return
        
        # Find the user's card
        card = Card.query.filter_by(user_id=user.id).first()
        if not card:
            print("No cards found for the user. Please run the setup script first.")
            return
        
        # Define spending categories
        categories = [
            'Food & Dining', 
            'Shopping', 
            'Transportation', 
            'Entertainment', 
            'Healthcare', 
            'Utilities', 
            'Groceries', 
            'Travel'
        ]
        
        # Define merchants for each category
        merchants = {
            'Food & Dining': ['Starbucks', 'McDonald\'s', 'Pizza Hut', 'Subway', 'Local Restaurant'],
            'Shopping': ['Amazon', 'Target', 'Walmart', 'Best Buy', 'IKEA'],
            'Transportation': ['Uber', 'Lyft', 'Shell Gas', 'BP', 'Local Transit'],
            'Entertainment': ['Netflix', 'Movie Theater', 'Spotify', 'Game Store', 'Concert Tickets'],
            'Healthcare': ['Pharmacy', 'Doctor Visit', 'Dental Care', 'Eye Care', 'Health Insurance'],
            'Utilities': ['Electric Bill', 'Water Bill', 'Gas Bill', 'Internet Provider', 'Phone Bill'],
            'Groceries': ['Kroger', 'Whole Foods', 'Trader Joe\'s', 'Aldi', 'Local Grocery'],
            'Travel': ['Airbnb', 'Hotel', 'Airline Tickets', 'Car Rental', 'Travel Agency']
        }
        
        # Delete existing transactions to avoid duplication
        Transaction.query.filter(Transaction.card_id == card.id).delete()
        db.session.commit()
        
        # Generate transactions for the past 90 days
        today = datetime.utcnow()
        transactions_to_add = []
        
        # Transaction volume by category (relative frequency)
        category_volume = {
            'Food & Dining': 20, 
            'Shopping': 15, 
            'Transportation': 12, 
            'Entertainment': 8, 
            'Healthcare': 5, 
            'Utilities': 6, 
            'Groceries': 25, 
            'Travel': 9
        }
        
        # Generate transactions
        for days_ago in range(90):
            date = today - timedelta(days=days_ago)
            
            # For each category, create a proportional number of transactions
            for category, frequency in category_volume.items():
                # Adjust frequency to create more realistic data (fewer transactions per day)
                daily_frequency = max(1, frequency // 15) if random.random() < 0.7 else 0
                
                for _ in range(daily_frequency):
                    merchant = random.choice(merchants[category])
                    
                    # Generate amount based on category
                    if category == 'Food & Dining':
                        amount = round(random.uniform(10, 50), 2)
                    elif category == 'Shopping':
                        amount = round(random.uniform(20, 200), 2)
                    elif category == 'Transportation':
                        amount = round(random.uniform(10, 60), 2)
                    elif category == 'Entertainment':
                        amount = round(random.uniform(15, 80), 2)
                    elif category == 'Healthcare':
                        amount = round(random.uniform(20, 150), 2)
                    elif category == 'Utilities':
                        amount = round(random.uniform(50, 150), 2)
                    elif category == 'Groceries':
                        amount = round(random.uniform(30, 150), 2)
                    elif category == 'Travel':
                        amount = round(random.uniform(100, 500), 2)
                    else:
                        amount = round(random.uniform(10, 100), 2)
                    
                    # Make all amounts negative (spending)
                    amount = -amount
                    
                    # Randomize the transaction time
                    hours = random.randint(8, 22)
                    minutes = random.randint(0, 59)
                    seconds = random.randint(0, 59)
                    transaction_time = date.replace(hour=hours, minute=minutes, second=seconds)
                    
                    transaction = Transaction(
                        id=str(uuid.uuid4()),
                        card_id=card.id,
                        amount=amount,
                        merchant=merchant,
                        category=category,
                        status='completed',
                        created_at=transaction_time
                    )
                    transactions_to_add.append(transaction)
        
        # Add income transactions (positive amounts)
        for month in range(3):
            date = today.replace(day=1) - timedelta(days=today.day) - timedelta(days=30 * month)
            
            # Monthly salary
            salary_transaction = Transaction(
                id=str(uuid.uuid4()),
                card_id=card.id,
                amount=round(random.uniform(3000, 4000), 2),
                merchant='Employer',
                category='Income',
                status='completed',
                created_at=date
            )
            transactions_to_add.append(salary_transaction)
            
            # Random additional income
            if random.random() < 0.3:
                bonus_transaction = Transaction(
                    id=str(uuid.uuid4()),
                    card_id=card.id,
                    amount=round(random.uniform(100, 500), 2),
                    merchant='Side Gig',
                    category='Income',
                    status='completed',
                    created_at=date + timedelta(days=random.randint(1, 15))
                )
                transactions_to_add.append(bonus_transaction)
        
        # Add all transactions to database
        db.session.add_all(transactions_to_add)
        db.session.commit()
        
        # Count created transactions
        total_transactions = len(transactions_to_add)
        print(f"Created {total_transactions} test transactions for analytics")
        
        # Calculate total spending
        total_spending = db.session.query(
            db.func.sum(db.func.abs(Transaction.amount))
        ).filter(
            Transaction.card_id == card.id,
            Transaction.amount < 0
        ).scalar()
        
        print(f"Total spending amount: ${round(float(total_spending), 2)}")
        
        # Print spending by category
        print("\nSpending by category:")
        category_spending = db.session.query(
            Transaction.category,
            db.func.sum(db.func.abs(Transaction.amount)).label('total')
        ).filter(
            Transaction.card_id == card.id,
            Transaction.amount < 0
        ).group_by(
            Transaction.category
        ).all()
        
        for category, amount in category_spending:
            print(f"  {category}: ${round(float(amount), 2)}")
        
        print("\nAnalytics data setup complete. You can now test the API.")

if __name__ == "__main__":
    setup_analytics_data() 