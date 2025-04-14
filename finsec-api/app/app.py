from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from models import db
from routes.bills import bills_bp

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://finsec_user:finsec_password@db:3307/finsec_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production

    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app)

    app.register_blueprint(bills_bp)

    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy'})

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 