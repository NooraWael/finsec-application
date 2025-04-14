import mysql.connector
import random
from datetime import datetime, timedelta
import uuid

# Database connection parameters
db_config = {
    'host': 'db',  # Docker service name
    'user': 'finsec_user',
    'password': 'finsec_password',
    'database': 'finsec_db',
    'port': 3307
}

def add_test_data():
    """Add test transactions to the database"""
    print("Adding test transactions to the database...")
    
    try:
        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Get user and card information
        cursor.execute("SELECT id FROM users LIMIT 1")
        user_id = cursor.fetchone()[0]
        
        cursor.execute(f"SELECT id FROM cards WHERE user_id = {user_id}")
        card_ids = [row[0] for row in cursor.fetchall()]
        
        if not card_ids:
            print("No cards found for the user! Please run setup first.")
            return
        
        # Categories and their relative distribution
        categories = [
            "Food & Dining",
            "Shopping",
            "Entertainment",
            "Transportation",
            "Housing",
            "Healthcare",
            "Travel",
            "Education"
        ]
        
        # Merchants for each category
        merchants = {
            "Food & Dining": ["Starbucks", "McDonalds", "Chipotle", "Subway", "Local Restaurant"],
            "Shopping": ["Amazon", "Target", "Walmart", "Best Buy", "Nike"],
            "Entertainment": ["Netflix", "Spotify", "AMC Theaters", "Game Stop", "Ticketmaster"],
            "Transportation": ["Uber", "Lyft", "Shell", "BP", "Public Transit"],
            "Housing": ["Rent", "Mortgage", "Electricity", "Water", "Internet"],
            "Healthcare": ["CVS Pharmacy", "Walgreens", "Doctor Visit", "Health Insurance"],
            "Travel": ["Airbnb", "Expedia", "Delta Airlines", "Hilton Hotels", "Cruise Line"],
            "Education": ["University", "Textbooks", "Online Course", "Student Loan"]
        }
        
        # Amount ranges for each category
        amount_ranges = {
            "Food & Dining": (10, 100),
            "Shopping": (20, 200),
            "Entertainment": (15, 120),
            "Transportation": (5, 80),
            "Housing": (200, 1500),
            "Healthcare": (30, 250),
            "Travel": (100, 800),
            "Education": (50, 300)
        }
        
        # Clear existing transactions
        cursor.execute("DELETE FROM transactions")
        conn.commit()
        
        # Current time for transaction dates
        now = datetime.now()
        
        # Insert 1000 spending transactions
        for i in range(1000):
            # Random date within the last year
            days_ago = random.randint(0, 365)
            date = now - timedelta(days=days_ago)
            date_str = date.strftime('%Y-%m-%d %H:%M:%S')
            
            # Select random card
            card_id = random.choice(card_ids)
            
            # Select category
            category = random.choice(categories)
            
            # Calculate amount (negative for spending)
            min_amount, max_amount = amount_ranges[category]
            amount = -round(random.uniform(min_amount, max_amount), 2)
            
            # Select merchant
            merchant = random.choice(merchants[category])
            
            # Create unique ID
            transaction_id = str(uuid.uuid4())
            
            # Insert transaction
            cursor.execute(
                "INSERT INTO transactions (id, card_id, amount, merchant, category, status, created_at) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (transaction_id, card_id, amount, merchant, category, "completed", date_str)
            )
        
        # Add 50 income transactions
        income_sources = ["Salary Deposit", "Interest", "Refund", "Transfer", "Investment Income"]
        for i in range(50):
            days_ago = random.randint(0, 365)
            date = now - timedelta(days=days_ago)
            date_str = date.strftime('%Y-%m-%d %H:%M:%S')
            
            card_id = random.choice(card_ids)
            source = random.choice(income_sources)
            amount = round(random.uniform(500, 5000), 2)
            
            transaction_id = str(uuid.uuid4())
            
            cursor.execute(
                "INSERT INTO transactions (id, card_id, amount, merchant, category, status, created_at) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (transaction_id, card_id, amount, source, "Income", "completed", date_str)
            )
        
        # Commit all changes
        conn.commit()
        print(f"Successfully added 1050 test transactions")
        
    except Exception as e:
        print(f"Error adding test data: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    add_test_data() 