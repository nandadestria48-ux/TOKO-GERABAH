-- Database Toko Gerabah Online Setup Script
-- Run this script in MySQL to initialize the database

-- Create Database
CREATE DATABASE IF NOT EXISTS toko_gerabah;
USE toko_gerabah;

-- Users Table (with role and profilePhoto)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  address TEXT,
  profilePhoto LONGTEXT,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
);

-- Products Table (8 default pottery items)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  image VARCHAR(500),
  rating DECIMAL(3, 1),
  reviews INT DEFAULT 0,
  discount INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_price (price)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  items JSON NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Dalam Pengiriman',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_order_number (order_number),
  INDEX idx_created_at (created_at)
);

-- Insert Default Admin User (password: 123, hashed with bcrypt)
INSERT INTO users (username, email, password, phone, address, role) VALUES (
  'admin',
  'admin@tokogerabah.com',
  '$2a$10$mZPo3.tCXlhSZK0b3F.yQ.yVsD.Sg5YXQp5SLxqvpDhz7m0K7RP9K',
  '+62812345678',
  'Jl. Gerabah No. 123, Jakarta',
  'admin'
) ON DUPLICATE KEY UPDATE id=id;

-- Insert Default Products (8 Pottery Items)
INSERT INTO products (title, author, price, category, image, rating, reviews, discount) VALUES
('Clean Code', 'Robert C. Martin', 189000, 'programming', 'https://images-na.ssl-images-amazon.com/images/P/0132350882.01.L.jpg', 4.8, 45, 15),
('The Pragmatic Programmer', 'David Thomas, Andrew Hunt', 185000, 'programming', 'https://covers.openlibrary.org/b/id/8338103-L.jpg', 4.7, 38, 10),
('Design Patterns', 'Gang of Four', 225000, 'programming', 'https://images-na.ssl-images-amazon.com/images/P/0201633612.01.L.jpg', 4.6, 52, 5),
('1984', 'George Orwell', 95000, 'fiksi', 'https://images-na.ssl-images-amazon.com/images/P/0451524934.01.L.jpg', 4.9, 128, 20),
('Sapiens', 'Yuval Noah Harari', 135000, 'nonfiksi', 'https://images-na.ssl-images-amazon.com/images/P/0062316095.01.L.jpg', 4.8, 95, 0),
('Atomic Habits', 'James Clear', 105000, 'self-help', 'https://images-na.ssl-images-amazon.com/images/P/0735211299.01.L.jpg', 4.9, 210, 25),
('The Silent Patient', 'Alex Michaelides', 89000, 'fiksi', 'https://images-na.ssl-images-amazon.com/images/P/1250301696.01.L.jpg', 4.7, 67, 12),
('Mindset', 'Carol S. Dweck', 125000, 'self-help', 'https://images-na.ssl-images-amazon.com/images/P/0345472322.01.L.jpg', 4.6, 143, 8)
ON DUPLICATE KEY UPDATE id=id;

-- Verify Setup
SELECT '✅ Database setup complete!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_orders FROM orders;
