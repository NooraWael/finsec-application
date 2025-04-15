from flask import Flask, jsonify
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
    CORS(app)

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
    from app.routes.analytics import analytics_bp
    from app.routes.notification import notification_bp
    from app.routes.transaction import transaction_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(card_bp)
    app.register_blueprint(bills_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(transaction_bp, url_prefix='/api/transactions')
    
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
    
    # Create database tables with retry logic
    max_retries = 30
    retry_count = 0
    retry_delay = 2
    
    with app.app_context():
        while retry_count < max_retries:
            try:
                # Try to connect to MySQL
                print(f"Attempting to connect to database: mysql+pymysql://{db_user}:***@{db_host}:{db_port}/{db_name}")
                connection = pymysql.connect(
                    host=db_host,
                    user=db_user,
                    password=db_password,
                    database=db_name,
                    port=int(db_port),
                    connect_timeout=5
                )
                connection.close()
                print("Successfully connected to the database")
                
                # Now that we've verified the connection, create the tables
                db.create_all()
                print("Database tables created successfully")
                break
            except Exception as e:
                retry_count += 1
                print(f"Attempt {retry_count}/{max_retries}: Failed to connect to database")
                print(f"Error: {str(e)}")
                if retry_count >= max_retries:
                    print("Maximum retries reached. Could not create database tables.")
                else:
                    print(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
    
    return app 