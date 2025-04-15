from app import db
import datetime
import uuid

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'transaction', 'security', 'promotion', 'system'
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    read = db.Column(db.Boolean, default=False)
    action_url = db.Column(db.String(255), nullable=True)
    
    def __repr__(self):
        return f'<Notification {self.id}>'
        
class NotificationSettings(db.Model):
    __tablename__ = 'notification_settings'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    push_enabled = db.Column(db.Boolean, default=True)
    email_enabled = db.Column(db.Boolean, default=True)
    transactions_enabled = db.Column(db.Boolean, default=True)
    security_enabled = db.Column(db.Boolean, default=True)
    promotions_enabled = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<NotificationSettings {self.id}>' 