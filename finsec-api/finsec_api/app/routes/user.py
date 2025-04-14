from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User

user_bp = Blueprint('user', __name__, url_prefix='/api')

@user_bp.route('/users/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get the authenticated user's profile"""
    try:
        # Get the user ID from the JWT token
        identity = get_jwt_identity()
        user_id = identity.get('user_id')
        
        # Query the user from the database
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Return the user profile data
        profile = {
            'id': user.id,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'email': user.email,
            'preferredName': user.preferred_name,
            'phone': user.phone_number,
            'address': user.address,
            'memberSince': user.created_at.strftime('%Y-%m-%d'),
            'status': 'active' if user.is_active else 'inactive'
        }
        
        return jsonify(profile), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """Update the authenticated user's profile"""
    try:
        # Get the user ID from the JWT token
        identity = get_jwt_identity()
        user_id = identity.get('user_id')
        
        # Query the user from the database
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get the request data
        data = request.get_json()
        
        # Update user fields if provided in the request
        if 'firstName' in data:
            user.first_name = data['firstName']
        if 'lastName' in data:
            user.last_name = data['lastName']
        if 'preferredName' in data:
            user.preferred_name = data['preferredName']
        if 'phone' in data:
            user.phone_number = data['phone']
        if 'address' in data:
            user.address = data['address']
        
        # Save changes to the database
        db.session.commit()
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 