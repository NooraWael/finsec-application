from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.card import Card, Transaction
from sqlalchemy import func
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api')

@analytics_bp.route('/analytics/spending', methods=['GET'])
@jwt_required()
def get_spending_analytics():
    """Get spending analytics based on the specified period"""
    try:
        # Get the user ID from the JWT token
        identity = get_jwt_identity()
        user_id = identity.get('user_id')
        
        # Get query parameters
        period = request.args.get('period', 'month')
        if period not in ['week', 'month', 'year']:
            return jsonify({'error': 'Invalid period. Must be week, month, or year'}), 400
        
        # Calculate date range based on period
        now = datetime.utcnow()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        else:  # year
            start_date = now - timedelta(days=365)
        
        # Get previous period for comparison
        if period == 'week':
            prev_start_date = start_date - timedelta(days=7)
        elif period == 'month':
            prev_start_date = start_date - timedelta(days=30)
        else:  # year
            prev_start_date = start_date - timedelta(days=365)
            
        prev_end_date = start_date
        
        # Get all spending transactions for the user's cards (negative amounts) in current period
        current_transactions = (db.session.query(
            Transaction.category,
            func.abs(func.sum(Transaction.amount)).label('total_amount'),
            func.count(Transaction.id).label('transaction_count')
        )
        .join(Card)
        .filter(
            Card.user_id == user_id,
            Transaction.amount < 0,  # Only spending transactions
            Transaction.created_at >= start_date,
            Transaction.created_at <= now
        )
        .group_by(Transaction.category)
        .all())
        
        # Get previous period data for comparison
        previous_transactions = (db.session.query(
            Transaction.category,
            func.abs(func.sum(Transaction.amount)).label('total_amount')
        )
        .join(Card)
        .filter(
            Card.user_id == user_id,
            Transaction.amount < 0,
            Transaction.created_at >= prev_start_date,
            Transaction.created_at < prev_end_date
        )
        .group_by(Transaction.category)
        .all())
        
        # Create dictionary of previous period amounts by category
        prev_period_by_category = {t.category: float(t.total_amount) for t in previous_transactions}
        
        # Calculate total spending amount
        total_spending = sum(float(t.total_amount) for t in current_transactions)
        
        # Format the response
        categories = []
        for transaction in current_transactions:
            # Calculate percentage of total
            percentage = (float(transaction.total_amount) / total_spending * 100) if total_spending > 0 else 0
            
            # Calculate monthly change
            prev_amount = prev_period_by_category.get(transaction.category, 0)
            if prev_amount > 0:
                monthly_change = ((float(transaction.total_amount) - prev_amount) / prev_amount) * 100
            else:
                monthly_change = 100  # New category
            
            categories.append({
                'name': transaction.category,
                'amount': float(transaction.total_amount),
                'percentage': round(percentage, 2),
                'transactions': transaction.transaction_count,
                'monthlyChange': round(monthly_change, 2)
            })
        
        # Sort categories by amount (descending)
        categories.sort(key=lambda x: x['amount'], reverse=True)
        
        return jsonify({'categories': categories}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 