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

INSERT INTO products (title, author, price, category, image, rating, reviews, discount) VALUES
('Piring Tradisional Ukir', 'Pengrajin Toko Gerabah', 85000.00, 'piring', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500', 4.9, 156, 15),
('Vas Bunga Minimalis', 'Pengrajin Toko Gerabah', 125000.00, 'vas', 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//91/MTA-77234220/no-brand_no-brand_full01.jpg', 4.8, 89, 10),
('Cangkir Kopi Artisan', 'Pengrajin Toko Gerabah', 45000.00, 'cangkir', 'https://down-id.img.susercontent.com/file/id-11134207-7r98r-lx13gjcouyi638@resize_w82_nl.webp', 4.7, 234, 20),
('Mangkuk Tua Besar', 'Pengrajin Toko Gerabah', 95000.00, 'mangkuk', 'https://www.galleryfurnicraftjepara.com/wp-content/uploads/2023/01/mangkuk-kayu-jati-30x8-@200-02-scaled.jpg', 4.6, 145, 5),
('Kendi Tradisional Indah', 'Pengrajin Toko Gerabah', 155000.00, 'kendi', 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Kendi_LACMA_M.88.72.jpg', 4.8, 112, 0),
('Pot Tanaman Dekoratif', 'Pengrajin Toko Gerabah', 65000.00, 'pot', 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/MTA-40166492/tidak_ada_merk_pot_tanaman_dekoratif_tanah_liat_tembikar_dia_9cm_wmo_ik1908_chiaf_full01_qz8qgi3s.jpg', 4.9, 287, 25),
('Guci Hias Antik', 'Pengrajin Toko Gerabah', 245000.00, 'guci', 'https://p19-images-sign-sg.tokopedia-static.net/tos-alisg-i-aphluv4xwc-sg/img/VqbcmM/2021/7/22/c55571d1-6154-4975-bc33-27fb0072e5c9.jpg~tplv-aphluv4xwc-white-pad-v1:1600:1600.jpeg?lk3s=0ccea506&x-expires=1773463539&x-signature=3FrjEQij4ZqEovlFJknGlCxJpVE%3D&x-signature-webp=p2KZhNZ%2BxYjl2NHEQYMcH5FupKU%3D', 4.7, 78, 8),
('Perlengkapan Teh Tradisional', 'Pengrajin Toko Gerabah', 185000.00, 'set-teh', 'https://richcreme.com/wp-content/uploads/2025/07/header-24.webp', 4.8, 93, 12)
ON DUPLICATE KEY UPDATE id=id;

-- Verify Setup
SELECT '✅ Database setup complete!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_orders FROM orders;
