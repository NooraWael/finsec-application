from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.card import Card, Transaction
from datetime import datetime, timedelta
from sqlalchemy import and_, or_

transaction_bp = Blueprint('transaction', __name__)

@transaction_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    """Get transactions with filters"""
    try:
        # Get the user ID from the JWT token
        identity = get_jwt_identity()
        user_id = identity.get('user_id')
        
        # Get query parameters
        date_range = request.args.get('dateRange', 'all')
        txn_type = request.args.get('type', 'all')
        min_amount = request.args.get('minAmount', type=float)
        max_amount = request.args.get('maxAmount', type=float)
        search = request.args.get('search', '')
        page = request.args.get('page', 1, type=int)
        limit = min(request.args.get('limit', 10, type=int), 50)  # Cap at 50
        
        # Base query: get all transactions for the user's cards
        query = Transaction.query.join(Card).filter(Card.user_id == user_id)
        
        # Apply date range filter
        now = datetime.utcnow()
        if date_range == 'today':
            query = query.filter(Transaction.created_at >= now.date())
        elif date_range == 'week':
            week_ago = now - timedelta(days=7)
            query = query.filter(Transaction.created_at >= week_ago)
        elif date_range == 'month':
            month_ago = now - timedelta(days=30)
            query = query.filter(Transaction.created_at >= month_ago)
        
        # Apply amount filters
        if min_amount is not None:
            query = query.filter(Transaction.amount >= min_amount)
        if max_amount is not None:
            query = query.filter(Transaction.amount <= max_amount)
        
        # Apply search filter
        if search:
            search_filter = or_(
                Transaction.merchant.ilike(f'%{search}%'),
                Transaction.category.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)
        
        # Apply pagination
        total = query.count()
        transactions = query.offset((page - 1) * limit).limit(limit).all()
        
        # Format response
        transactions_data = [{
            'id': t.id,
            'type': 'debit' if t.amount < 0 else 'credit',
            'amount': abs(t.amount),
            'date': t.created_at.isoformat(),
            'category': t.category,
            'merchant': t.merchant,
            'status': t.status,
            'paymentMethod': f"{t.card.card_network} *{t.card.card_number[-4:]}"
        } for t in transactions]
        
        return jsonify({
            'transactions': transactions_data,
            'pagination': {
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transaction_bp.route('/<transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction_details(transaction_id):
    """Get detailed information for a specific transaction"""
    try:
        # Get the user ID from the JWT token
        identity = get_jwt_identity()
        user_id = identity.get('user_id')
        
        # Query the transaction and ensure it belongs to the user
        transaction = Transaction.query.join(Card).filter(
            Transaction.id == transaction_id,
            Card.user_id == user_id
        ).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Format the response
        transaction_data = {
            'id': transaction.id,
            'type': 'debit' if transaction.amount < 0 else 'credit',
            'amount': abs(transaction.amount),
            'date': transaction.created_at.isoformat(),
            'description': f"Transaction at {transaction.merchant}",
            'category': transaction.category,
            'merchant': transaction.merchant,
            'reference': transaction.id,  # Using transaction ID as reference
            'status': transaction.status,
            'paymentMethod': f"{transaction.card.card_network} *{transaction.card.card_number[-4:]}"
        }
        
        return jsonify(transaction_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 