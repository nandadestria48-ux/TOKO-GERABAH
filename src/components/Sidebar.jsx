import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "./Sidebar.css";

function Sidebar({ isOpen, setIsOpen, onLogout }) {
  const navigate = useNavigate();
  const { getTotalItems } = useContext(CartContext);

  const menuItems = [
    { icon: "🏠", label: "Dashboard", path: "/dashboard" },
    { icon: "/GERABAH", label: "Gerabah", path: "/products", isImage: true },
    { icon: "🛒", label: "Keranjang", path: "/cart", badge: getTotalItems() },
    { icon: "📦", label: "Pesanan", path: "/orders" },
    { icon: "👤", label: "Profil", path: "/profile" },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Toko Gerabah</h2>
          <button
            className="close-btn"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              className="menu-item"
              onClick={() => handleNavigate(item.path)}
            >
              <span className="menu-icon">
                {item.isImage ? (
                  <img src={item.icon} alt={item.label} className="menu-logo" />
                ) : (
                  item.icon
                )}
              </span>
              <span className="menu-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🏃 Logout
          </button>
        </div>
      </div>
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(false)}
      />
    </>
  );
}

export default Sidebar;
