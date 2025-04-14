from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.notification import Notification, NotificationSettings
from app.models.user import User
from marshmallow import Schema, fields, validate

notification_bp = Blueprint('notification', __name__, url_prefix='/api/notifications')

class NotificationSchema(Schema):
    id = fields.String()
    title = fields.String()
    message = fields.String()
    type = fields.String(validate=validate.OneOf(['transaction', 'security', 'promotion', 'system']))
    created_at = fields.DateTime(attribute="created_at")
    read = fields.Boolean()
    action_url = fields.String(allow_none=True)

class NotificationSettingsSchema(Schema):
    push_enabled = fields.Boolean(required=True)
    email_enabled = fields.Boolean(required=True)
    categories = fields.Dict(keys=fields.String(), values=fields.Boolean())

notification_schema = NotificationSchema()
notifications_schema = NotificationSchema(many=True)
notification_settings_schema = NotificationSettingsSchema()

@notification_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """
    Get all notifications for the authenticated user
    ---
    tags:
      - Notifications
    security:
      - jwt: []
    responses:
      200:
        description: List of notifications
      401:
        description: Unauthorized
    """
    identity = get_jwt_identity()
    current_user_id = identity.get('user_id') if isinstance(identity, dict) else identity
    
    # Get notifications for the current user
    notifications = Notification.query.filter_by(user_id=current_user_id).order_by(Notification.created_at.desc()).all()
    
    return jsonify({
        'notifications': notifications_schema.dump(notifications)
    }), 200

@notification_bp.route('/settings', methods=['GET'])
@jwt_required()
def get_notification_settings():
    """
    Get notification settings for the authenticated user
    ---
    tags:
      - Notifications
    security:
      - jwt: []
    responses:
      200:
        description: Notification settings
      401:
        description: Unauthorized
    """
    identity = get_jwt_identity()
    current_user_id = identity.get('user_id') if isinstance(identity, dict) else identity
    
    # Get or create notification settings for the user
    settings = NotificationSettings.query.filter_by(user_id=current_user_id).first()
    
    if not settings:
        settings = NotificationSettings(user_id=current_user_id)
        db.session.add(settings)
        db.session.commit()
    
    return jsonify({
        'pushEnabled': settings.push_enabled,
        'emailEnabled': settings.email_enabled,
        'categories': {
            'transactions': settings.transactions_enabled,
            'security': settings.security_enabled,
            'promotions': settings.promotions_enabled
        }
    }), 200

@notification_bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_notification_settings():
    """
    Update notification settings for the authenticated user
    ---
    tags:
      - Notifications
    security:
      - jwt: []
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              pushEnabled:
                type: boolean
              emailEnabled:
                type: boolean
              categories:
                type: object
                properties:
                  transactions:
                    type: boolean
                  security:
                    type: boolean
                  promotions:
                    type: boolean
    responses:
      200:
        description: Notification settings updated
      400:
        description: Invalid request
      401:
        description: Unauthorized
    """
    identity = get_jwt_identity()
    current_user_id = identity.get('user_id') if isinstance(identity, dict) else identity
    
    # Validate input
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No input data provided'}), 400
    
    # Get or create notification settings for the user
    settings = NotificationSettings.query.filter_by(user_id=current_user_id).first()
    
    if not settings:
        settings = NotificationSettings(user_id=current_user_id)
        db.session.add(settings)
    
    # Update settings
    if 'pushEnabled' in data:
        settings.push_enabled = data['pushEnabled']
    
    if 'emailEnabled' in data:
        settings.email_enabled = data['emailEnabled']
    
    if 'categories' in data:
        categories = data['categories']
        if 'transactions' in categories:
            settings.transactions_enabled = categories['transactions']
        
        if 'security' in categories:
            settings.security_enabled = categories['security']
        
        if 'promotions' in categories:
            settings.promotions_enabled = categories['promotions']
    
    db.session.commit()
    
    return jsonify({
        'pushEnabled': settings.push_enabled,
        'emailEnabled': settings.email_enabled,
        'categories': {
            'transactions': settings.transactions_enabled,
            'security': settings.security_enabled,
            'promotions': settings.promotions_enabled
        }
    }), 200

@notification_bp.route('/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_as_read(notification_id):
    """
    Mark a notification as read
    ---
    tags:
      - Notifications
    security:
      - jwt: []
    parameters:
      - name: notification_id
        in: path
        required: true
        description: ID of the notification to mark as read
        schema:
          type: string
    responses:
      200:
        description: Notification marked as read
      404:
        description: Notification not found
      401:
        description: Unauthorized
    """
    identity = get_jwt_identity()
    current_user_id = identity.get('user_id') if isinstance(identity, dict) else identity
    
    # Find the notification
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()
    
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404
    
    # Mark as read
    notification.read = True
    db.session.commit()
    
    return jsonify({'message': 'Notification marked as read'}), 200 