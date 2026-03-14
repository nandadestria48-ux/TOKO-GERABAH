import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { formatRupiahShort } from "../utils/formatCurrency";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { orders, user } = useContext(CartContext);
  const [stats, setStats] = useState({
    totalproducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch statistics dari API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsRes = await fetch("http://localhost:5050/api/products");
        const products = productsRes.ok ? await productsRes.json() : [];
        
        // Hitung revenue dari orders di context
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        setStats({
          totalproducts: products.length || 8,
          totalUsers: 1, // Minimal ada 1 user (yang login)
          totalOrders: orders.length || 0,
          totalRevenue: totalRevenue || 0
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        // Fallback values
        setStats({
          totalproducts: 8,
          totalUsers: 1,
          totalOrders: orders.length || 0,
          totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0) || 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [orders]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>🌿 Tentang Kami</h2>
          <p>Toko Gerabah Nusantara adalah toko online yang menyediakan berbagai produk kerajinan gerabah berkualitas tinggi. Kami bekerja sama dengan pengrajin lokal untuk menghadirkan produk unik yang dibuat secara handmade dengan sentuhan tradisional.

Kami percaya bahwa setiap gerabah memiliki cerita, nilai seni, dan keunikan tersendiri yang tidak dapat digantikan oleh produk pabrikan.</p>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Gerabah</h3>
            <p className="stat-number">{stats.totalproducts}</p>
          </div>
          <div className="stat-card">
            <h3>👥 Total Pengguna</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>📦 Total Pesanan</h3>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>💰 Total Pendapatan</h3>
            <p className="stat-number">{formatRupiahShort(stats.totalRevenue)}</p>
          </div>
        </div>

        <div className="menu-container">
          <h3>Menu Utama</h3>
          <div className="menu-buttons">
            <button className="menu-btn" onClick={() => navigate("/products")}>
              Produk Gerabah
            </button>
            <button className="menu-btn" onClick={() => navigate("/cart")}>
              Keranjang
            </button>
            <button className="menu-btn" onClick={() => navigate("/orders")}>
              Riwayat Order
            </button>
            <button className="menu-btn" onClick={() => navigate("/profile")}>
              Profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
