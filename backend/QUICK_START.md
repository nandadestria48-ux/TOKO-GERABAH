# 🚀 Quick Start - Backend Server

## ⚡ Fastest Way

### Step 1: Start MySQL
Double-click file ini:
```
start-backend.bat
```

Script akan:
1. ✅ Check if MySQL running
2. ✅ Start MySQL if not running
3. ✅ Start Backend server on port 5000
4. ✅ Auto-initialize database

### Step 2: Verify Server
Open browser → http://localhost:5000/api/health

Expected response:
```json
{
  "status": "Server is running"
}
```

---

## 🔧 Manual Start (if script doesn't work)

### Start MySQL First:
**Option A: XAMPP**
- Open XAMPP Control Panel
- Click "Start" next to MySQL
- Wait for green indicator

**Option B: Command Line**
```bash
# Windows
net start MySQL80

# Or if using XAMPP path
"C:\xampp\mysql\bin\mysqld.exe"
```

### Then Start Backend:
```bash
cd backend
npm start
```

---

## ❌ Common Issues

### Error: "ECONNREFUSED"
→ MySQL is not running
→ Start MySQL first using one of methods above

### Error: "Access Denied"
→ Check DB credentials in .env
- DB_USER=root (default)
- DB_PASSWORD= (empty by default)

### Error: "Port 3306 already in use"
→ MySQL already running (but server couldn't connect)
→ Try restarting MySQL or check firewall

### Error: "Database doesn't exist"
→ Run database.sql script
```bash
mysql -u root -p < database.sql
```

---

## ✅ Success Indicators

When server is running correctly, you should see:
```
✅ Database initialized successfully
🚀 Server berjalan di http://localhost:5000
📚 Admin credentials: username: admin | password: 123
```

---

## 📱 Frontend Connect

After backend is running, frontend will automatically try to connect.

Test admin login:
- Username: `admin`
- Password: `123`

---

## 🛑 Stop Server

- Press `Ctrl + C` in terminal
- Or close the command window

---

## 📞 Need Help?

1. Make sure MySQL is running
2. Check .env file configuration
3. Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`
4. Check server logs for error messages

Good luck! 🎯
