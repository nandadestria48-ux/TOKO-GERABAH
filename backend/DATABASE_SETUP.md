# 🗄️ Setup Database MySQL - Toko Gerabah Online

## 📋 Prerequisites

1. **MySQL Server** harus sudah terinstall
   - Download: https://dev.mysql.com/downloads/mysql/
   - Atau gunakan: XAMPP, WAMP, MAMP, dll

2. **Node.js** & **npm**

## 🚀 Step-by-Step Setup

### 1️⃣ Start MySQL Server

**Windows (XAMPP/WAMP):**
```bash
# Buka XAMPP Control Panel → Click "Start" next to MySQL
```

**macOS (Homebrew):**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo systemctl start mysql
```

### 2️⃣ Login ke MySQL Command Line

```bash
mysql -u root -p
```
- Username: `root`
- Password: (kosong atau sesuai konfigurasi)

### 3️⃣ Buat Database (Pilih Salah Satu)

#### **Option A: Using SQL Script (Recommended)**
```bash
# Di dalam MySQL Command Line
source /path/to/database.sql

# Atau (Windows)
source C:\path\to\database.sql
```

#### **Option B: Manual Command**
```sql
CREATE DATABASE IF NOT EXISTS toko_gerabah;
USE toko_gerabah;

-- Copy-paste semua query dari database.sql di sini
```

### 4️⃣ Configure Backend (.env)

Edit file `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=toko_gerabah
JWT_SECRET=your_jwt_secret_key_change_in_production
PORT=6969
```

**Keterangan:**
- `DB_HOST`: Alamat server MySQL (localhost untuk lokal)
- `DB_USER`: Username MySQL (default: root)
- `DB_PASSWORD`: Password MySQL (kosong jika tidak ada password)
- `DB_NAME`: Nama database (harus sama dengan di database.sql)
- `JWT_SECRET`: Secret key untuk JWT token (ganti di production)

### 5️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

### 6️⃣ Start Backend Server

```bash
npm start          # Production mode
# atau
npm run dev        # Development mode dengan auto-reload
```

Jika berhasil, akan muncul:
```
✅ Database initialized successfully
📚 Admin credentials: username: admin | password: 123
🚀 Server berjalan di http://localhost:6969
```

---

## 📊 Database Structure

### **Users Table**
```
id (PK)        | Auto increment ID
username       | Unique, max 50 chars
email          | Unique, max 100 chars
password       | Hashed with bcrypt
phone          | Optional
address        | Optional
profilePhoto   | Base64 image data
role           | 'user' or 'admin'
created_at     | Timestamp
updated_at     | Timestamp
```

### **Products Table**
```
id (PK)        | Auto increment ID
title          | Pottery item title
author         | Author name
price          | Decimal(10,2)
category       | programming, fiksi, nonfiksi, self-help
image          | URL to pottery item image
rating         | Decimal(3,1) e.g., 4.8
reviews        | Integer count
discount       | Percentage (0-100)
created_at     | Timestamp
updated_at     | Timestamp
```

### **Orders Table**
```
id (PK)        | Auto increment ID
order_number   | Unique order ID (ORD-timestamp)
user_id (FK)   | Reference to users.id
items          | JSON array of order items
total          | Decimal(10,2) order total
status         | 'Dalam Pengiriman', 'Terkirim', etc
created_at     | Timestamp
updated_at     | Timestamp
```

---

## 🔑 Default Credentials

**Admin Account**
- Username: `admin`
- Password: `123`
- Role: `admin`

---

## 🐛 Troubleshooting

### Error: "Can't connect to MySQL server"
```
✅ Solution: Pastikan MySQL server sudah running
- Windows: Start MySQL dari XAMPP/WAMP
- Mac/Linux: brew services start mysql / sudo systemctl start mysql
```

### Error: "Access denied for user 'root'"
```
✅ Solution: Update DB_PASSWORD di .env sesuai password MySQL Anda
```

### Error: "Database toko_gerabah doesn't exist"
```
✅ Solution: Run database.sql script untuk create database dan tables
```

### Error: "Port 5000 already in use"
```
✅ Solution: Ubah PORT di .env atau kill process yang menggunakan port 5000
- Windows: netstat -ano | findstr :5000
- Mac/Linux: lsof -i :5000
```

### Connection Timeout
```
✅ Solution: Pastikan DB_HOST dan DB_PORT benar di .env
```

---

## ✅ Verification

Cek jika database sudah setup dengan benar:

```bash
# Login ke MySQL
mysql -u root -p

# Di MySQL Command Line
USE toko_gerabah;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
```

Expected output:
```
Tables_in_toko_gerabah
users
products
orders

count(*): 1 (admin user)
count(*): 8 (8 default pottery items)
```

---

## 📱 Connect Frontend

Frontend sudah dikonfigurasi untuk menggunakan localStorage. Untuk menggunakan backend API:

**Update CartContext.jsx:**
```javascript
const API_URL = "http://localhost:5000/api";

const login = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    setUser(data.user);
  }
};
```

---

## 🔐 Production Deployment

Sebelum deploy ke production:

1. **Change JWT_SECRET** di .env ke random string yang panjang
2. **Use strong database password** (jangan kosong)
3. **Enable HTTPS** 
4. **Set proper database backups**
5. **Restrict CORS** ke domain Anda saja
6. **Add rate limiting** untuk API endpoints

---

## 📞 Support

Jika masih ada masalah, cek:
- MySQL service status
- Database credentials di .env
- Firewall settings (port 3306 untuk MySQL, 5000 untuk backend)
- Backend server logs

Dokumentasi lengkap API di: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
