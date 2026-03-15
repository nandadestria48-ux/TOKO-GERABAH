import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { formatRupiahShort } from "../utils/formatCurrency";
import "./AdminPage.css";

function AdminPage() {
  const { user, token } = useContext(CartContext);
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  const API_BASE_URL = "http://localhost:5577/api";

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === "products") fetchProducts();
    else if (activeTab === "users") fetchUsers();
    else if (activeTab === "orders") fetchAllOrders();
  }, [activeTab]);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    // For admin, we need to fetch all orders. Since API doesn't have admin endpoint for all orders,
    // we'll fetch from products and users for now, and note that orders are per user
    setLoading(true);
    try {
      // This is a limitation - admin can't see all orders easily. For now, show empty
      setOrders([]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(productData)
      });
      if (response.ok) {
        fetchProducts();
        setShowAddProduct(false);
      } else {
        alert("Gagal menambah produk");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleUpdateProduct = async (productId, productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(productData)
      });
      if (response.ok) {
        fetchProducts();
        setEditingProduct(null);
      } else {
        alert("Gagal update produk");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (response.ok) {
        fetchProducts();
      } else {
        alert("Gagal menghapus produk");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleAddUser = async (userData) => {
    // Note: Registration is separate, admin might need different endpoint
    alert("Fitur tambah user belum diimplementasi di backend");
  };

  const handleUpdateUser = async (userId, userData) => {
    // Note: No admin endpoint for updating users
    alert("Fitur update user belum tersedia");
  };

  const handleDeleteUser = async (userId) => {
    // Note: No admin endpoint for deleting users
    alert("Fitur hapus user belum tersedia");
  };

  if (user?.role !== "admin") {
    return <div className="admin-denied">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</div>;
  }

  return (
    <div className="admin-page">
      <h1>🏗️ Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          Produk
        </button>
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Pengguna
        </button>
        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          Pesanan
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "products" && (
          <div className="products-admin">
            <div className="admin-header">
              <h2>Kelola Produk</h2>
              <button onClick={() => setShowAddProduct(true)}>Tambah Produk</button>
            </div>

            {showAddProduct && (
              <ProductForm
                onSubmit={handleAddProduct}
                onCancel={() => setShowAddProduct(false)}
              />
            )}

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="products-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Judul</th>
                      <th>Harga</th>
                      <th>Kategori</th>
                      <th>Rating</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.title}</td>
                        <td>{formatRupiahShort(product.price)}</td>
                        <td>{product.category}</td>
                        <td>{product.rating}</td>
                        <td>
                          <button onClick={() => setEditingProduct(product)}>Edit</button>
                          <button onClick={() => handleDeleteProduct(product.id)}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {editingProduct && (
              <ProductForm
                product={editingProduct}
                onSubmit={(data) => handleUpdateProduct(editingProduct.id, data)}
                onCancel={() => setEditingProduct(null)}
              />
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-admin">
            <div className="admin-header">
              <h2>Kelola Pengguna</h2>
              <button onClick={() => setShowAddUser(true)}>Tambah User</button>
            </div>

            {showAddUser && (
              <UserForm
                onSubmit={handleAddUser}
                onCancel={() => setShowAddUser(false)}
              />
            )}

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <button onClick={() => setEditingUser(user)}>Edit</button>
                          <button onClick={() => handleDeleteUser(user.id)}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {editingUser && (
              <UserForm
                user={editingUser}
                onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
                onCancel={() => setEditingUser(null)}
              />
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="orders-admin">
            <h2>Kelola Pesanan</h2>
            <p>Fitur kelola pesanan admin belum diimplementasi sepenuhnya.</p>
            <p>Untuk melihat semua pesanan, perlu endpoint admin khusus.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductForm({ product, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: product?.title || "",
    author: product?.author || "",
    description: product?.description || "",
    price: product?.price || "",
    category: product?.category || "",
    image: product?.image || "",
    rating: product?.rating || 0,
    reviews: product?.reviews || 0,
    discount: product?.discount || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h3>{product ? "Edit Produk" : "Tambah Produk"}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Judul"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="author"
            placeholder="Pengrajin"
            value={formData.author}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Deskripsi"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Harga"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Kategori"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="image"
            placeholder="URL Gambar"
            value={formData.image}
            onChange={handleChange}
          />
          <input
            type="number"
            name="rating"
            placeholder="Rating"
            value={formData.rating}
            onChange={handleChange}
            step="0.1"
          />
          <input
            type="number"
            name="reviews"
            placeholder="Jumlah Review"
            value={formData.reviews}
            onChange={handleChange}
          />
          <input
            type="number"
            name="discount"
            placeholder="Diskon (%)"
            value={formData.discount}
            onChange={handleChange}
          />
          <div className="form-buttons">
            <button type="submit">{product ? "Update" : "Tambah"}</button>
            <button type="button" onClick={onCancel}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "user"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h3>{user ? "Edit User" : "Tambah User"}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div className="form-buttons">
            <button type="submit">{user ? "Update" : "Tambah"}</button>
            <button type="button" onClick={onCancel}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPage;