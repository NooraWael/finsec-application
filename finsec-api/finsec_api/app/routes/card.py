from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.card import Card, Transaction
import uuid
from datetime import datetime, timedelta

card_bp = Blueprint('card', __name__, url_prefix='/api/cards')

@card_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_cards():
    """Get all cards for the authenticated user"""
    try:
        # Get the user ID from the JWT token
        identity = get_jwt_identity()
        user_id = identity.get('user_id')
        
        # Query all cards for the user
        cards = Card.query.filter_by(user_id=user_id).all()
        
        # Format the response
        cards_data = [{
            'id': card.id,
            'cardHolder': card.card_holder,
            'cardNumber': card.card_number,
            'expiryDate': card.expiry_date,
            'cardType': card.card_type,
            'balance': card.balance,
            'bankName': card.bank_name,
            'rewardsPoints': card.rewards_points,
            'cardNetwork': card.card_network
        } for card in cards]
        
        return jsonify({'cards': cards_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@card_bp.route('/<card_id>', methods=['GET'])
@jwt_required()
def get_card_details(card_id):
    """Get detailed information for a specific card"""
    try:
        # Get the user ID from the JWT token
        identity = get_jwt_identity()
        user_id = identity.get('user_id')
        
        # Query the card
        card = Card.query.filter_by(id=card_id, user_id=user_id).first()
        
        if not card:
            return jsonify({'error': 'Card not found'}), 404
        
        # Calculate remaining limits
        today = datetime.utcnow().date()
        month_start = today.replace(day=1)
        
        # Get today's transactions
        today_transactions = Transaction.query.filter(
            Transaction.card_id == card.id,
            Transaction.created_at >= today
        ).all()
        
        # Get this month's transactions
        month_transactions = Transaction.query.filter(
            Transaction.card_id == card.id,
            Transaction.created_at >= month_start
        ).all()
        
        # Calculate spent amounts
        today_spent = sum(t.amount for t in today_transactions)
        month_spent = sum(t.amount for t in month_transactions)
        
        # Format the response
        card_data = {
            'id': card.id,
            'cardHolder': card.card_holder,
            'cardNumber': card.card_number,
            'expiryDate': card.expiry_date,
            'cardType': card.card_type,
            'balance': card.balance,
            'transactions': [{
                'id': t.id,
                'amount': t.amount,
                'merchant': t.merchant,
                'category': t.category,
                'status': t.status,
                'createdAt': t.created_at.isoformat()
            } for t in card.transactions],
            'limits': {
                'daily': card.daily_limit,
                'monthly': card.monthly_limit,
                'remaining': {
                    'daily': card.daily_limit - today_spent,
                    'monthly': card.monthly_limit - month_spent
                }
            }
        }
        
        return jsonify(card_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 