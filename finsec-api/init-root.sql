-- Set root password and allow remote connections
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root_password';
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Create application user with remote access
CREATE USER IF NOT EXISTS 'finsec_user'@'%' IDENTIFIED BY 'finsec_password';
GRANT ALL PRIVILEGES ON finsec_db.* TO 'finsec_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES; 