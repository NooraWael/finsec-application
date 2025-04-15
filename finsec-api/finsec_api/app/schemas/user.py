from app import ma
from app.models.user import User, Session
from marshmallow import fields

class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        
    id = ma.auto_field()
    email = ma.auto_field()
    first_name = ma.auto_field()
    last_name = ma.auto_field()
    phone_number = ma.auto_field()
    mfa_enabled = ma.auto_field()
    is_active = ma.auto_field()
    created_at = ma.auto_field()
    
    # Don't expose sensitive fields
    password_hash = fields.Str(dump_only=False, load_only=True)
    mfa_secret = fields.Str(dump_only=False, load_only=True)

class SessionSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Session
        
    id = ma.auto_field()
    user_id = ma.auto_field()
    session_id = ma.auto_field()
    device_info = ma.auto_field()
    ip_address = ma.auto_field()
    is_active = ma.auto_field()
    created_at = ma.auto_field()
    last_active_at = ma.auto_field()
    expires_at = ma.auto_field() 