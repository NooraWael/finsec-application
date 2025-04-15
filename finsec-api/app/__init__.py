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


def get_env_var(var_name):
    value = os.environ.get(var_name)
    if not value:
        raise EnvironmentError(f"Environment variable '{var_name}' is not set.")
    return value

# Configure database
db_user = get_env_var('MYSQL_USER')
db_password = get_env_var('MYSQL_PASSWORD')
db_host = get_env_var('MYSQL_HOST')
db_name = get_env_var('MYSQL_DB')
db_port = os.environ.get('MYSQL_PORT', '3306')  # optional: still provide a fallback for less critical values

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure JWT
app.config['JWT_SECRET_KEY'] = get_env_var('JWT_SECRET_KEY')
    
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
