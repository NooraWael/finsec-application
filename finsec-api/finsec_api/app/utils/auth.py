import pyotp
import datetime
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.models.user import Session

def generate_mfa_secret():
    """Generate a new MFA secret key for TOTP"""
    return pyotp.random_base32()

def get_totp_uri(email, secret, issuer_name="FinSec Banking"):
    """Generate a TOTP URI for QR code generation"""
    return pyotp.totp.TOTP(secret).provisioning_uri(
        name=email,
        issuer_name=issuer_name
    )

def require_active_session(fn):
    """Decorator to check if the session in the JWT is still active"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # First verify the JWT
        verify_jwt_in_request()
        
        # Get user and session IDs from the JWT
        identity = get_jwt_identity()
        user_id = identity.get('user_id')
        session_id = identity.get('session_id')
        
        if not user_id or not session_id:
            return jsonify({'error': 'Invalid token format'}), 401
        
        # Check if the session exists and is active
        session = Session.query.filter_by(
            user_id=user_id,
            session_id=session_id,
            is_active=True
        ).first()
        
        if not session:
            return jsonify({'error': 'Session expired or invalid'}), 401
        
        # Check if the session has expired
        if session.expires_at and session.expires_at < datetime.datetime.utcnow():
            session.is_active = False
            return jsonify({'error': 'Session expired'}), 401
        
        # Update last active time
        session.last_active_at = datetime.datetime.utcnow()
        
        return fn(*args, **kwargs)
    
    return wrapper 