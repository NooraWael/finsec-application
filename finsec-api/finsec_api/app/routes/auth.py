import uuid
import datetime
import pyotp
import traceback
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity
)
from werkzeug.security import check_password_hash

from app import db
from app.models.user import User, Session
from app.schemas.user import UserSchema
from app.utils.auth import generate_mfa_secret, get_totp_uri

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
user_schema = UserSchema()

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint for user authentication
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              description: User's email address
            password:
              type: string
              description: User's password
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            message:
              type: string
            access_token:
              type: string
            user:
              type: object
      400:
        description: Missing credentials
      401:
        description: Invalid credentials
      403:
        description: Account is inactive
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            current_app.logger.error(f"Missing credentials: {data}")
            return jsonify({'error': 'Email and password required'}), 400
        
        current_app.logger.info(f"Login attempt for email: {data['email']}")
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            current_app.logger.error(f"User not found: {data['email']}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.check_password(data['password']):
            current_app.logger.error(f"Invalid password for user: {data['email']}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            current_app.logger.error(f"Account inactive: {data['email']}")
            return jsonify({'error': 'Account is inactive'}), 403
        
        # If MFA is enabled for the user, return a message indicating MFA is required
        if user.mfa_enabled:
            current_app.logger.info(f"MFA required for user: {data['email']}")
            return jsonify({
                'message': 'MFA verification required',
                'userId': user.id,
                'requireMfa': True
            }), 200
        
        # If MFA is not enabled, create a session
        session_id = str(uuid.uuid4())
        
        # Create a new session
        new_session = Session(
            user_id=user.id,
            session_id=session_id,
            device_info=request.user_agent.string,
            ip_address=request.remote_addr,
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=7)
        )
        
        db.session.add(new_session)
        db.session.commit()
        
        # Create access token with user ID and session ID
        access_token = create_access_token(
            identity={
                'user_id': user.id,
                'session_id': session_id
            }
        )
        
        current_app.logger.info(f"Login successful for user: {data['email']}")
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'session_id': session_id,
            'user': user_schema.dump(user)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-mfa', methods=['POST'])
def verify_mfa():
    """
    MFA verification endpoint
    ---
    Expects:
        {
            userId: string,
            otpCode: string,
            email: string,
            password: string
        }
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('userId') or not data.get('otpCode') or not data.get('email') or not data.get('password'):
            current_app.logger.error(f"Missing MFA data: {data}")
            return jsonify({'error': 'User ID, OTP code, email, and password required'}), 400
        
        user = User.query.get(data['userId'])
        
        if not user:
            current_app.logger.error(f"User not found for MFA: {data['userId']}")
            return jsonify({'error': 'User not found'}), 404
        
        if not user.is_active:
            current_app.logger.error(f"Account inactive for MFA: {user.email}")
            return jsonify({'error': 'Account is inactive'}), 403
        
        # Validate email and password
        if user.email != data['email'] or not user.check_password(data['password']):
            current_app.logger.error(f"Invalid credentials for user: {data['email']}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify OTP code
        totp = pyotp.TOTP(user.mfa_secret)
        current_app.logger.info(f"Verifying OTP for user: {user.email}, OTP: {data['otpCode']}")
        # Log current time and expected OTP for debugging
        current_app.logger.info(f"Current time: {datetime.datetime.utcnow()}")
        current_app.logger.info(f"Expected OTP: {totp.now()}")
        
        if not totp.verify(data['otpCode']):
            current_app.logger.error(f"Invalid MFA code for user: {user.email}")
            return jsonify({'error': 'Invalid MFA code'}), 401
        
        # Create a new session
        session_id = str(uuid.uuid4())
        new_session = Session(
            user_id=user.id,
            session_id=session_id,
            device_info=request.user_agent.string,
            ip_address=request.remote_addr,
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=7)
        )
        
        db.session.add(new_session)
        db.session.commit()
        
        # Create access token with user ID and session ID
        access_token = create_access_token(
            identity={
                'user_id': user.id,
                'session_id': session_id
            }
        )
        
        current_app.logger.info(f"MFA verification successful for user: {user.email}")
        
        return jsonify({
            'message': 'MFA verification successful',
            'access_token': access_token,
            'session_id': session_id,
            'user': user_schema.dump(user)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"MFA verification error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout endpoint
    ---
    Expects:
        {
            userId: string,
            sessionId: string
        }
    """
    try:
        data = request.get_json()
        identity = get_jwt_identity()
        
        # Get the current session from JWT identity
        user_id = identity.get('user_id')
        session_id = identity.get('session_id')
        
        current_app.logger.info(f"Logout attempt for user_id: {user_id}, session_id: {session_id}")
        
        # If the logout request includes a specific user and session, use those instead
        if data and data.get('userId') and data.get('sessionId'):
            user_id = data['userId']
            session_id = data['sessionId']
            current_app.logger.info(f"Using provided user_id: {user_id}, session_id: {session_id}")
        
        # Find the session
        session = Session.query.filter_by(
            user_id=user_id,
            session_id=session_id,
            is_active=True
        ).first()
        
        if not session:
            current_app.logger.error(f"Session not found: user_id={user_id}, session_id={session_id}")
            return jsonify({'error': 'Session not found'}), 404
        
        # Deactivate the session
        session.is_active = False
        db.session.commit()
        
        current_app.logger.info(f"Logout successful for user_id: {user_id}")
        
        return jsonify({'message': 'Logged out successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Logout error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/generate-mfa-secret', methods=['POST'])
def generate_mfa_secret_endpoint():
    """
    Generate MFA secret for first-time login
    ---
    Expects:
        {
            userId: string
        }
    """
    try:
        data = request.get_json()
        user_id = data.get('userId')

        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        if not user.is_active:
            return jsonify({'error': 'Account is inactive'}), 403

        # Generate a new MFA secret
        mfa_secret = generate_mfa_secret()
        user.mfa_secret = mfa_secret
        user.mfa_enabled = True
        db.session.commit()

        # Generate TOTP URI
        totp_uri = get_totp_uri(user.email, mfa_secret)

        return jsonify({
            'message': 'MFA secret generated successfully',
            'mfa_secret': mfa_secret,
            'totp_uri': totp_uri
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error generating MFA secret: {str(e)}")
        return jsonify({'error': str(e)}), 500 