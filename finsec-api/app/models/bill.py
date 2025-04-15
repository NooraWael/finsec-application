from app import db
from datetime import datetime
import uuid

class Bill(db.Model):
    __tablename__ = 'bills'

    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'upcoming', 'overdue', 'paid'
    autopay = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, user_id, name, category, amount, due_date, autopay=False):
        self.id = str(uuid.uuid4())
        self.user_id = user_id
        self.name = name
        self.category = category
        self.amount = amount
        self.due_date = due_date
        self.autopay = autopay
        self.status = self._calculate_status()

    def _calculate_status(self):
        if self.due_date < datetime.utcnow():
            return 'overdue'
        return 'upcoming'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'amount': self.amount,
            'dueDate': self.due_date.isoformat(),
            'status': self.status,
            'autopay': self.autopay
        } 