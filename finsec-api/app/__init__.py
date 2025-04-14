from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_swagger_ui import get_swaggerui_blueprint
import os
import time
import pymysql

# Initialize SQLAlchemy
db = SQLAlchemy()
# Initialize Marshmallow
ma = Marshmallow()

def create_app():
    app = Flask(__name__)
    # Configure CORS to allow all origins with credentials
    CORS(app, resources={r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods"],
        "expose_headers": ["Content-Type", "Authorization", "X-Requested-With", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods"],
        "supports_credentials": False,
        "max_age": 3600
    }})

    # Configure Swagger UI
    SWAGGER_URL = '/swagger'
    API_URL = '/static/swagger.json'
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "FinSec Banking API"
        }
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    # Add route to serve swagger.json with no-cache headers
    @app.route('/static/swagger.json')
    def serve_swagger():
        response = send_from_directory(app.static_folder, 'swagger.json')
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response

    # Configure database
    db_user = os.environ.get('MYSQL_USER', 'finsec_user')
    db_password = os.environ.get('MYSQL_PASSWORD', 'finsec_password')
    db_host = os.environ.get('MYSQL_HOST', 'db')
    db_name = os.environ.get('MYSQL_DB', 'finsec_db')
    db_port = os.environ.get('MYSQL_PORT', '3307')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure JWT
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev_key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 60 * 60  # 1 hour
    jwt = JWTManager(app)
    
    # Initialize extensions with app
    db.init_app(app)
    ma.init_app(app)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.card import card_bp
    from app.routes.bills import bills_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(card_bp)
    app.register_blueprint(bills_bp)
    
    # Add a health check route
    @app.route('/')
    def health_check():
        """
        Health check endpoint
        ---
        tags:
          - Health
        responses:
          200:
            description: API is healthy
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: healthy
        """
        return jsonify({'status': 'healthy'}), 200

    return app
