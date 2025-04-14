import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User

def add_test_user():
    app = create_app()
    with app.app_context():
        # Check if user already exists
        user = User.query.filter_by(email='huda.al-hashimi@example.com').first()
        if not user:
            user = User(
                email='huda.al-hashimi@example.com',
                first_name='Huda',
                last_name='Al-Hashimi',
                is_active=True
            )
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            print("Test user created successfully!")
        else:
            print("User already exists!")

if __name__ == "__main__":
    add_test_user() 