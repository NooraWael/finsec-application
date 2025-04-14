import datetime
from app import db

class Card(db.Model):
    __tablename__ = 'cards'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    card_holder = db.Column(db.String(100), nullable=False)
    card_number = db.Column(db.String(16), nullable=False)
    expiry_date = db.Column(db.String(5), nullable=False)  # Format: MM/YY
    card_type = db.Column(db.String(50), nullable=False)
    balance = db.Column(db.Float, default=0.0)
    bank_name = db.Column(db.String(100), nullable=False)
    rewards_points = db.Column(db.Integer, default=0)
    card_network = db.Column(db.String(20), nullable=False)  # visa, mastercard, amex
    daily_limit = db.Column(db.Float, default=5000.0)
    monthly_limit = db.Column(db.Float, default=15000.0)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='card', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Card {self.card_number}>'

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.String(36), primary_key=True)
    card_id = db.Column(db.String(36), db.ForeignKey('cards.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    merchant = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # pending, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f'<Transaction {self.id}>' 