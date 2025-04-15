import os
import sys
sys.path.append('/app')

from app import create_app, db
from app.models.bill import Bill
from app.models.user import User
from datetime import datetime, timedelta
import json

def test_bills():
    app = create_app()
    client = app.test_client()
    
    with app.app_context():
        # Login to get token
        print("1. Logging in...")
        login_response = client.post('/api/auth/login', json={
            'email': 'jane.smith@example.com',
            'password': 'password123'
        })
        print(f"Login Response: {login_response.status_code}")
        print(json.dumps(json.loads(login_response.data), indent=2))
        
        if login_response.status_code == 200:
            token = json.loads(login_response.data).get('access_token')
            headers = {'Authorization': f'Bearer {token}'}
            
            # Get all bills
            print("\n2. Getting all bills...")
            bills_response = client.get('/api/bills', headers=headers)
            print(f"Bills Response: {bills_response.status_code}")
            print(json.dumps(json.loads(bills_response.data), indent=2))
            
            # Create a test bill if none exist
            if bills_response.status_code == 200 and not json.loads(bills_response.data).get('bills'):
                print("\nCreating test bills...")
                test_bills = [
                    Bill(
                        user_id=json.loads(login_response.data)['user']['id'],
                        name='Electricity Bill',
                        category='Utilities',
                        amount=150.50,
                        due_date=datetime.utcnow() + timedelta(days=7),
                        autopay=False
                    ),
                    Bill(
                        user_id=json.loads(login_response.data)['user']['id'],
                        name='Water Bill',
                        category='Utilities',
                        amount=75.25,
                        due_date=datetime.utcnow() + timedelta(days=14),
                        autopay=True
                    )
                ]
                for bill in test_bills:
                    db.session.add(bill)
                db.session.commit()
                
                # Get bills again
                print("\n3. Getting bills after creation...")
                bills_response = client.get('/api/bills', headers=headers)
                print(f"Bills Response: {bills_response.status_code}")
                print(json.dumps(json.loads(bills_response.data), indent=2))
            
            # Try to pay a bill
            if bills_response.status_code == 200 and json.loads(bills_response.data).get('bills'):
                bill = json.loads(bills_response.data)['bills'][0]
                payment_data = {
                    'billId': bill['id'],
                    'amount': bill['amount'],
                    'paymentMethodId': 'pm_123456789'
                }
                
                print("\n4. Paying a bill...")
                pay_response = client.post('/api/bills/pay', 
                                        headers=headers,
                                        json=payment_data)
                print(f"Payment Response: {pay_response.status_code}")
                print(json.dumps(json.loads(pay_response.data), indent=2))

if __name__ == '__main__':
    test_bills() 