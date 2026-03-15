import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import Products from "./pages/Products";
import ShoppingCart from "./pages/ShoppingCart";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Login
                onLoginSuccess={() => {
                  setIsLoggedIn(true);
                }}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? (
                <ProtectedLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <Dashboard />
                </ProtectedLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin"
            element={
              isLoggedIn ? (
                <ProtectedLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <AdminPage />
                </ProtectedLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/products"
            element={
              isLoggedIn ? (
                <ProtectedLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <Products />
                </ProtectedLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/cart"
            element={
              isLoggedIn ? (
                <ProtectedLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <ShoppingCart />
                </ProtectedLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/orders"
            element={
              isLoggedIn ? (
                <ProtectedLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <OrderHistory />
                </ProtectedLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isLoggedIn ? (
                <ProtectedLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <Profile />
                </ProtectedLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

function ProtectedLayout({ children, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    window.location.href = "/";
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Determine if we should show back button (not on dashboard)
  const showBackButton = location.pathname !== "/dashboard";

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onLogout={handleLogout} />
      <div className="main-content">
        <header className="top-bar">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          {showBackButton && (
            <button 
              className="back-btn" 
              onClick={handleBack}
              title="Kembali"
            >
              ← Kembali
            </button>
          )}
          <h1>Toko Gerabah Online</h1>
          <button className="logout-top" onClick={handleLogout} title="Logout">
            🏃
          </button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

export default App;
