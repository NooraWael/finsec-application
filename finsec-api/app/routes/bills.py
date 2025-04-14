from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.bill import Bill
from app.models.card import Card, Transaction
from datetime import datetime
import uuid

bills_bp = Blueprint('bills', __name__, url_prefix='/api')

@bills_bp.route('/bills', methods=['GET'])
@jwt_required()
def get_bills():
    """Get all bills for the authenticated user"""
    try:
        # Get the user ID from the JWT token
        identity = get_jwt_identity()
        user_id = identity.get('user_id')
        
        # Query all bills for the user
        bills = Bill.query.filter_by(user_id=user_id).all()
        
        # Format the response
        bills_data = [bill.to_dict() for bill in bills]
        
        return jsonify({'bills': bills_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bills_bp.route('/bills/pay', methods=['POST'])
@jwt_required()
def pay_bill():
    """Pay a specific bill"""
    try:
        print("=== Starting payment process ===")
        # Get the user ID from the JWT token
        identity = get_jwt_identity()
        user_id = identity.get('user_id')
        print(f"User ID from token: {user_id}")
        
        # Get request data
        data = request.get_json()
        bill_id = data.get('billId')
        amount = data.get('amount')
        payment_method_id = data.get('paymentMethodId')
        print(f"Request data - Bill ID: {bill_id}, Amount: {amount}, Payment Method ID: {payment_method_id}")
        
        # Step 1: Validate payment method ID format and existence
        print("Step 1: Validating payment method ID")
        if not payment_method_id:
            print("Error: Payment method ID is missing")
            return jsonify({
                'error': 'Invalid request',
                'details': 'Payment method ID is required'
            }), 400
            
        # Validate payment method ID format (should be a UUID)
        print(f"Validating UUID format for payment method ID: {payment_method_id}")
        try:
            uuid.UUID(payment_method_id)
            print("UUID format validation passed")
        except ValueError as e:
            print(f"UUID format validation failed: {str(e)}")
            return jsonify({
                'error': 'Invalid payment method',
                'details': 'Payment method ID format is invalid'
            }), 400
            
        # Check if card exists in database
        print("Checking if card exists in database")
        card = Card.query.filter_by(id=payment_method_id).first()
        print(f"Card query result: {card}")
        if not card:
            print(f"Card not found for ID: {payment_method_id}")
            return jsonify({
                'error': 'Invalid payment method',
                'details': 'Payment method not found in database'
            }), 404
            
        # Verify card belongs to the user
        print(f"Verifying card ownership - Card User ID: {card.user_id}, Request User ID: {user_id}")
        if card.user_id != user_id:
            print("Card ownership verification failed")
            return jsonify({
                'error': 'Invalid payment method',
                'details': 'This payment method does not belong to your account'
            }), 403
        print("Card ownership verified successfully")
            
        # Step 2: Validate bill ID
        print("\nStep 2: Validating bill ID")
        if not bill_id:
            print("Error: Bill ID is missing")
            return jsonify({
                'error': 'Invalid request',
                'details': 'Bill ID is required'
            }), 400
            
        bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
        print(f"Bill query result: {bill}")
        if not bill:
            print(f"Bill not found for ID: {bill_id}")
            return jsonify({
                'error': 'Invalid bill',
                'details': 'The provided bill ID does not exist or does not belong to your account'
            }), 404
            
        # Step 3: Validate amount
        print("\nStep 3: Validating amount")
        print(f"Amount to validate: {amount}, Bill amount: {bill.amount}")
        if not amount or amount <= 0:
            print("Error: Invalid amount (zero or negative)")
            return jsonify({
                'error': 'Invalid amount',
                'details': 'Payment amount must be greater than 0'
            }), 400
            
        if amount != bill.amount:
            print(f"Error: Amount mismatch - Payment: {amount}, Bill: {bill.amount}")
            return jsonify({
                'error': 'Invalid amount',
                'details': 'Payment amount must match bill amount'
            }), 400
            
        # Step 4: Check card balance
        print("\nStep 4: Checking card balance")
        print(f"Card balance: {card.balance}, Required amount: {amount}")
        if card.balance < amount:
            print("Error: Insufficient balance")
            return jsonify({
                'error': 'Insufficient balance',
                'details': f'Your card balance ({card.balance}) is less than the payment amount ({amount})'
            }), 400
            
        # All validations passed, process payment
        print("\nAll validations passed, processing payment")
        try:
            # Deduct amount from card
            print(f"Deducting {amount} from card balance {card.balance}")
            card.balance -= amount
            print(f"New card balance: {card.balance}")
            
            # Create transaction record
            transaction = Transaction(
                id=str(uuid.uuid4()),
                card_id=card.id,
                amount=amount,
                merchant=bill.merchant,
                category='bill_payment',
                status='completed'
            )
            print(f"Created transaction record: {transaction.id}")
            db.session.add(transaction)
                
            # Update bill status
            print("Updating bill status to paid")
            bill.status = 'paid'
            db.session.commit()
            print("Database changes committed successfully")
            
            return jsonify({
                'message': 'Payment successful',
                'billId': bill.id,
                'status': 'paid',
                'transaction_id': transaction.id,
                'card_balance': card.balance
            }), 200
            
        except Exception as e:
            print(f"Error during payment processing: {str(e)}")
            db.session.rollback()
            return jsonify({
                'error': 'Payment processing failed',
                'details': str(e)
            }), 500
            
    except Exception as e:
        print(f"Unexpected error in payment process: {str(e)}")
        db.session.rollback()
        return jsonify({
            'error': 'Payment failed',
            'details': str(e)
        }), 500 