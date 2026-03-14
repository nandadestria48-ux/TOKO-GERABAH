import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

const API_BASE_URL = "http://localhost:5577/api";

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Load token dan user dari localStorage saat app start
  useEffect(() => {
    const savedToken = localStorage.getItem("toko_gerabah_token");
    const savedUser = localStorage.getItem("toko_gerabah_user");
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Fetch orders dengan token yang valid
      fetchOrders();
    }
  }, []);

  // Helper: Get API headers dengan token
  const getHeaders = () => ({
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  });

  // Login
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login gagal");
      }

      const data = await response.json();
      const { token: newToken, user: userData } = data;

      // Simpan token dan user ke localStorage
      localStorage.setItem("toko_gerabah_token", newToken);
      localStorage.setItem("toko_gerabah_user", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      // Fetch orders untuk user ini
      await fetchOrders();

      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (username, email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registrasi gagal");
      }

      const data = await response.json();
      return { message: "Registrasi berhasil", user: data };
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error("Gagal fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setOrders([]);
    setCart([]);
    localStorage.removeItem("toko_gerabah_token");
    localStorage.removeItem("toko_gerabah_user");
  };

  const addToCart = (book) => {
    const existingItem = cart.find((item) => item.id === book.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...book, quantity: 1 }]);
    }
  };

  const removeFromCart = (bookId) => {
    setCart(cart.filter((item) => item.id !== bookId));
  };

  const updateQuantity = (bookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === bookId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    if (!Array.isArray(cart) || cart.length === 0) return 0;
    return cart.reduce((total, item) => {
      const price = item?.price || 0;
      const quantity = item?.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getTotalItems = () => {
    if (!Array.isArray(cart) || cart.length === 0) return 0;
    return cart.reduce((total, item) => total + (item?.quantity || 0), 0);
  };

  const createOrder = async () => {
    if (!cart || cart.length === 0 || !user) {
      console.warn("Cannot create order: cart is empty or user not logged in");
      return null;
    }

    setIsLoading(true);
    try {
      const subtotal = getTotalPrice();
      const tax = subtotal * 0.1;
      const shipping = 25000;
      const total = subtotal + tax + shipping;

      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          title: item.title || "Unknown",
          image: item.image || "",
          quantity: item.quantity || 1,
          price: item.price || 0
        })),
        total: total
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal membuat pesanan");
      }

      const newOrder = await response.json();
      
      // Update orders list
      setOrders([newOrder, ...orders]);
      setCart([]);
      return newOrder;
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData) => {
    if (!user || !token) return null;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal update profil");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem("toko_gerabah_user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        user,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalPrice,
        getTotalItems,
        createOrder,
        login,
        register,
        logout,
        fetchOrders,
        updateUser,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
