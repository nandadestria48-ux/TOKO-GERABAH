const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: "/api/swagger.json",
  },
}));

// Swagger JSON
app.get("/api/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "toko_gerabah",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Connection Pool without database selection (for initial setup)
const setupPool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware: Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token tidak valid" });
  }
};

// Middleware: Verify Admin Role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Hanya admin yang dapat mengakses endpoint ini" });
  }
  next();
};

// Initialize Database
const initDatabase = async () => {
  try {
    const dbName = process.env.DB_NAME || "toko_gerabah";
    console.log("\n🔄 Initializing database...");
    console.log(`   Host: ${process.env.DB_HOST || "localhost"}`);
    console.log(`   User: ${process.env.DB_USER || "root"}`);
    console.log(`   Database: ${dbName}\n`);
    
    let connection = await setupPool.getConnection();
    
    // Create database if not exists
    console.log(`📦 Creating database '${dbName}' if not exists...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' ready`);
    
    connection.release();
    
    // Now connect to the database
    connection = await pool.getConnection();
    
    // Drop existing tables if they have wrong schema (for reset)
    try {
      await connection.execute(`DROP TABLE IF EXISTS orders`);
      await connection.execute(`DROP TABLE IF EXISTS products`);
      await connection.execute(`DROP TABLE IF EXISTS users`);
    } catch (e) {
      // Ignore drop errors
    }
    
    // Create users table with role
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(15),
        address TEXT,
        profilePhoto LONGTEXT,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await connection.execute(`
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50),
        image VARCHAR(500),
        rating DECIMAL(3, 1),
        reviews INT DEFAULT 0,
        discount INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create orders table
    await connection.execute(`
      CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        items JSON NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Dalam Pengiriman',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Check if admin user exists
    const [users] = await connection.execute("SELECT * FROM users WHERE username = ?", ["admin"]);
    
    if (users.length === 0) {
      console.log("📝 Creating default admin user...");
      const hashedPassword = await bcrypt.hash("123", 10);
      await connection.execute(
        "INSERT INTO users (username, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)",
        ["admin", "admin@tokogerabah.com", hashedPassword, "+62812345678", "Jl. Gerabah Seni No. 123, Jakarta", "admin"]
      );
      console.log("✅ Admin user created (username: admin, password: 123)");
    }

    // Check if products exist
    const [products] = await connection.execute("SELECT COUNT(*) as count FROM products");
    if (products[0].count === 0) {
      console.log("🏺 Inserting default pottery products...");
      const defaultProducts = [
        ["Piring Tradisional Ukir", "Pengrajin Toko Gerabah", "Piring keramik tradisional dengan ukiran motif batik Jawa yang indah. Dibuat dengan tangan menggunakan teknik pinching dan coil. Cocok untuk piring hias atau pemberian hadiah.", 85000.00, "piring", "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500", 4.9, 156, 15],
        ["Vas Bunga Minimalis", "Pengrajin Toko Gerabah", "Vas bunga modern dengan desain minimalis yang elegan. Terbuat dari bahan gerabah berkualitas tinggi dengan glazur warna natural. Tinggi 25cm, sempurna untuk bunga segar atau dekorasi rumah.", 125000.00, "vas", "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//91/MTA-77234220/no-brand_no-brand_full01.jpg", 4.8, 89, 10],
        ["Cangkir Kopi Artisan", "Pengrajin Toko Gerabah", "Cangkir kopi handmade dengan tekstur kasar yang unik. Diproduksi dengan teknik wheel throwing dan finishing manual. Kapasitas 350ml, dilengkapi dengan pegangan yang ergonomis.", 45000.00, "cangkir", "https://down-id.img.susercontent.com/file/id-11134207-7r98r-lx13gjcouyi638@resize_w82_nl.webp", 4.7, 234, 20],
        ["Mangkuk Tua Besar", "Pengrajin Toko Gerabah", "Mangkuk gerabah besar dengan ukuran diameter 30cm. Dibuat dari tanah liat premium dengan teknik hand-building. Ideal untuk menyajikan makanan atau dekorasi meja makan.", 95000.00, "mangkuk", "https://www.galleryfurnicraftjepara.com/wp-content/uploads/2023/01/mangkuk-kayu-jati-30x8-@200-02-scaled.jpg", 4.6, 145, 5],
        ["Kendi Tradisional Indah", "Pengrajin Toko Gerabah", "Kendi atau teko gerabah dengan desain tradisional Indonesia. Dibuat dengan teknik coiling yang sudah turun-temurun. Kapasitas 2 liter, cocok untuk menyimpan air dan minuman.", 155000.00, "kendi", "https://upload.wikimedia.org/wikipedia/commons/5/5a/Kendi_LACMA_M.88.72.jpg", 4.8, 112, 0],
        ["Pot Tanaman Dekoratif", "Pengrajin Toko Gerabah", "Pot tanaman dengan desain unik dan warna natural yang menarik. Tersedia dalam berbagai ukuran dari 15cm hingga 30cm. Memiliki lubang drainase yang sempurna untuk tanaman hias.", 65000.00, "pot", "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/MTA-40166492/tidak_ada_merk_pot_tanaman_dekoratif_tanah_liat_tembikar_dia_9cm_wmo_ik1908_chiaf_full01_qz8qgi3s.jpg", 4.9, 287, 25],
        ["Guci Hias Antik", "Pengrajin Toko Gerabah", "Guci gerabah besar dengan motif ukiran tradisional yang elegan. Tinggi 35cm, berkualitas tinggi dengan finishing licin sempurna. Cocok untuk koleksi atau dekorasi sudut rumah.", 245000.00, "guci", "https://p19-images-sign-sg.tokopedia-static.net/tos-alisg-i-aphluv4xwc-sg/img/VqbcmM/2021/7/22/c55571d1-6154-4975-bc33-27fb0072e5c9.jpg~tplv-aphluv4xwc-white-pad-v1:1600:1600.jpeg?lk3s=0ccea506&x-expires=1773463539&x-signature=3FrjEQij4ZqEovlFJknGlCxJpVE%3D&x-signature-webp=p2KZhNZ%2BxYjl2NHEQYMcH5FupKU%3D", 4.7, 78, 8],
        ["Perlengkapan Teh Tradisional", "Pengrajin Toko Gerabah", "Set perlengkapan teh tradisional dengan desain klasik yang elegan. Terdiri dari teko, cangkir, dan piring kecil. Dibuat dari gerabah berkualitas premium dengan finishing glazur natural, cocok untuk menikmati teh bersama keluarga.", 185000.00, "set-teh", "https://richcreme.com/wp-content/uploads/2025/07/header-24.webp", 4.8, 93, 12],
      ];

      for (const product of defaultProducts) {
        await connection.execute(
          "INSERT INTO products (title, author, description, price, category, image, rating, reviews, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          product
        );
      }
      console.log("✅ Default pottery products inserted (8 items)");
    }

    connection.release();
    console.log("✅ Database initialized successfully!\n");
  } catch (error) {
    console.error("\n❌ Database initialization error:");
    console.error("   Error Code:", error.code || "UNKNOWN");
    console.error("   Error Message:", error.message || error);
    console.error("\n💡 Troubleshooting:");
    
    if (error.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("   → MySQL connection was lost");
      console.error("   → Make sure MySQL server is running");
    } else if (error.code === "ECONNREFUSED") {
      console.error("   → MySQL server refused connection");
      console.error("   → Start MySQL: XAMPP Control Panel → Start MySQL");
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("   → Authentication failed");
      console.error("   → Check DB_USER and DB_PASSWORD in .env file");
      console.error("   → Default: DB_USER=root, DB_PASSWORD=(empty)");
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("   → Database does not exist and cannot be created");
      console.error("   → Check database permissions");
    }
    
    console.error("\n   📋 Current .env configuration:");
    console.error(`   DB_HOST=${process.env.DB_HOST || "localhost"}`);
    console.error(`   DB_USER=${process.env.DB_USER || "root"}`);
    console.error(`   DB_NAME=${process.env.DB_NAME || "toko_gerabah"}\n`);
  }
};

// Routes: Authentication

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register user baru
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Username atau email sudah terdaftar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Register
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const connection = await pool.getConnection();

    // Check if user exists
    const [existingUser] = await connection.execute(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ error: "Username atau email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await connection.execute(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, "user"]
    );

    connection.release();
    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registrasi gagal" });
  }
});

// Login
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login dan dapatkan JWT Token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: "123"
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Username atau password salah
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePhoto: user.profilePhoto,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login gagal" });
  }
});

// Routes: Products

// Get all products
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Dapatkan semua produk
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Daftar semua produk
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Error server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/products", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [products] = await connection.execute("SELECT * FROM products");
    connection.release();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil produk" });
  }
});

// Add product (Admin only)
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Tambah produk baru (Admin only)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - price
 *               - category
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 example: Piring Tradisional Ukir
 *               author:
 *                 type: string
 *                 example: Pengrajin Toko Gerabah
 *               description:
 *                 type: string
 *                 example: Piring keramik tradisional dengan ukiran motif batik
 *               price:
 *                 type: number
 *                 example: 85000
 *               category:
 *                 type: string
 *                 example: piring
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               rating:
 *                 type: number
 *                 example: 4.8
 *               reviews:
 *                 type: number
 *                 example: 234
 *               discount:
 *                 type: number
 *                 example: 10
 *     responses:
 *       201:
 *         description: Produk berhasil ditambahkan
 *       401:
 *         description: Tidak authorized
 *       403:
 *         description: Hanya admin yang bisa menambah produk
 */
app.post("/api/products", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, author, description, price, category, image, rating, reviews, discount } = req.body;
    const connection = await pool.getConnection();

    await connection.execute(
      "INSERT INTO products (title, author, description, price, category, image, rating, reviews, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [title, author, description || "", price, category, image, rating || 0, reviews || 0, discount || 0]
    );

    const [newProduct] = await connection.execute(
      "SELECT * FROM products WHERE title = ? AND author = ?",
      [title, author]
    );

    connection.release();
    res.status(201).json(newProduct[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambah produk" });
  }
});

// Update product (Admin only)
/**
 * @swagger
 * /api/products/{productId}:
 *   put:
 *     summary: Update produk (Admin only)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               rating:
 *                 type: number
 *               reviews:
 *                 type: number
 *               discount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Produk berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Tidak authorized
 *       403:
 *         description: Hanya admin yang bisa update produk
 */
app.put("/api/products/:productId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, author, description, price, category, image, rating, reviews, discount } = req.body;
    const connection = await pool.getConnection();

    // Check if product exists
    const [checkProduct] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

    if (checkProduct.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    await connection.execute(
      "UPDATE products SET title = ?, author = ?, description = ?, price = ?, category = ?, image = ?, rating = ?, reviews = ?, discount = ? WHERE id = ?",
      [title, author, description || "", price, category, image, rating, reviews, discount, productId]
    );

    const [updatedProduct] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

    connection.release();
    res.json(updatedProduct[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal update produk" });
  }
});

// Delete product (Admin only)
/**
 * @swagger
 * /api/products/{productId}:
 *   delete:
 *     summary: Hapus produk (Admin only)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         example: 1
 *     responses:
 *       200:
 *         description: Produk berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Produk berhasil dihapus
 *       401:
 *         description: Tidak authorized
 *       403:
 *         description: Hanya admin yang bisa hapus produk
 */
app.delete("/api/products/:productId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const connection = await pool.getConnection();

    await connection.execute("DELETE FROM products WHERE id = ?", [productId]);

    connection.release();
    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal hapus produk" });
  }
});

// Routes: Orders

// Create order
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Buat order baru
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - total
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *               total:
 *                 type: number
 *                 example: 500000
 *     responses:
 *       201:
 *         description: Order berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Tidak authorized
 */
app.post("/api/orders", verifyToken, async (req, res) => {
  try {
    const { items, total } = req.body;
    const connection = await pool.getConnection();

    const orderNumber = `ORD-${Date.now()}`;

    await connection.execute(
      "INSERT INTO orders (order_number, user_id, items, total) VALUES (?, ?, ?, ?)",
      [orderNumber, req.user.id, JSON.stringify(items), total]
    );

    const [newOrder] = await connection.execute(
      "SELECT * FROM orders WHERE order_number = ?",
      [orderNumber]
    );

    connection.release();

    const order = newOrder[0];
    res.status(201).json({
      ...order,
      items: JSON.parse(order.items),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Pemesanan gagal" });
  }
});

// Get user orders
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Dapatkan riwayat pesanan user
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar pesanan user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Tidak authorized
 */
app.get("/api/orders", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [orders] = await connection.execute(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    connection.release();

    const formattedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items),
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil pesanan" });
  }
});

// Routes: Users

// Get user profile
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Dapatkan profil user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Data profil user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Tidak authorized
 *       404:
 *         description: User tidak ditemukan
 */
app.get("/api/users/profile", verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id, username, email, phone, address, profilePhoto, role FROM users WHERE id = ?",
      [req.user.id]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil profil" });
  }
});

// Update user profile
/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update profil user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *               address:
 *                 type: string
 *                 example: Jakarta, Indonesia
 *               profilePhoto:
 *                 type: string
 *                 example: data:image/jpeg;base64,...
 *     responses:
 *       200:
 *         description: Profil berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Tidak authorized
 */
app.put("/api/users/profile", verifyToken, async (req, res) => {
  try {
    const { email, phone, address, profilePhoto } = req.body;
    const connection = await pool.getConnection();

    await connection.execute(
      "UPDATE users SET email = ?, phone = ?, address = ?, profilePhoto = ? WHERE id = ?",
      [email, phone, address, profilePhoto, req.user.id]
    );

    const [updatedUser] = await connection.execute(
      "SELECT id, username, email, phone, address, profilePhoto, role FROM users WHERE id = ?",
      [req.user.id]
    );

    connection.release();
    res.json(updatedUser[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Update profil gagal" });
  }
});

// Get all users (Admin only)
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Dapatkan semua user (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Tidak authorized
 *       403:
 *         description: Hanya admin yang bisa akses
 */
app.get("/api/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id, username, email, phone, role, created_at FROM users"
    );

    connection.release();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil daftar user" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Start Server
const PORT = process.env.PORT || 5050;
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log("\n" + "=".repeat(50));
    console.log("✅ Backend Server Ready!");
    console.log("=".repeat(50));
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📚 Admin: username: admin | password: 123`);
    console.log(`📖 API Docs: http://localhost:5050/api-docs/`);
    console.log("=".repeat(50) + "\n");
  });
}).catch(error => {
  console.error("\n⚠️  Server failed to start due to database error");
  console.error("Please fix the issue above and restart\n");
  process.exit(1);
});
