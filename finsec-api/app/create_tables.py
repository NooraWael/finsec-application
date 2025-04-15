from app import create_app, db
from app.models.bill import Bill
import time
import pymysql

def wait_for_db(host, port, database, max_attempts=30):
    print(f"Waiting for database connection (host: {host}, port: {port}, database: {database})...")
    attempt = 1
    while attempt <= max_attempts:
        try:
            print(f"Attempt {attempt}/{max_attempts}: Connecting to database...")
            connection = pymysql.connect(
                host=host,
                port=int(port),
                user='finsec_user',
                password='finsec_password',
                database=database
            )
            print("Successfully connected to the database!")
            connection.close()
            return True
        except pymysql.Error as e:
            print(f"Failed to connect: {e}")
            attempt += 1
            time.sleep(1)
    return False

def create_tables():
    app = create_app()
    with app.app_context():
        print("Attempting to connect to database: " + app.config['SQLALCHEMY_DATABASE_URI'])
        
        # Wait for database to be ready
        if not wait_for_db('db', '3307', 'finsec_db'):
            print("Failed to connect to database after maximum attempts")
            return
            
        print("Successfully connected to the database")
        
        # Create all tables
        db.create_all()
        print("Database tables created successfully")

if __name__ == '__main__':
    create_tables() 