-- Wait for MySQL to be ready
SELECT 1;

-- Delete existing users if they exist (cleanup)
DROP USER IF EXISTS 'finsec_user'@'localhost';
DROP USER IF EXISTS 'finsec_user'@'%';
DROP USER IF EXISTS 'root'@'%';

-- Create users with proper access
CREATE USER 'finsec_user'@'%' IDENTIFIED BY 'finsec_password';
CREATE USER 'root'@'%' IDENTIFIED BY 'root_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON finsec_db.* TO 'finsec_user'@'%';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Update root user password and privileges
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;

-- Flush privileges to apply changes
FLUSH PRIVILEGES; 