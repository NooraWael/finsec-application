#!/bin/bash

set -e
set -x

# Set the application directory
APP_DIR="/app"

# Add the application directory to Python path
export PYTHONPATH=$APP_DIR:$PYTHONPATH

# Wait for the database to be ready
$APP_DIR/wait-for-it.sh db 3307

# Sleep for a moment to ensure MySQL has fully initialized
echo "Waiting a bit more for MySQL to complete initialization..."
sleep 3

# Create database tables
echo "Creating database tables..."
cd $APP_DIR
python -m app.create_tables

# Add test data
python setup_test_data.py
python setup_notification_data.py

# Start the Flask application
echo "Starting Flask application..."
export FLASK_APP=app
export FLASK_DEBUG=1
python -m flask run --host=0.0.0.0 --port=5000 