import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { formatRupiah } from "../utils/formatCurrency";
import "./Products.css";

// Shopping cart and product category filtering
function Products() {
  const { addToCart } = useContext(CartContext);
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products dari API saat component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5050/api/products");
        
        if (!response.ok) {
          throw new Error("Gagal fetch produk");
        }

        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Gagal memuat produk. Pastikan backend running di port 5050");
        // Fallback ke data lokal jika backend tidak berjalan
        setProducts([
          {
            id: 1,
            title: "Vas Bunga Tradisional Besar",
            author: "Pengrajin Jawa Tengah",
            price: 299000,
            category: "vas",
            image: "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=400&fit=crop",
            rating: 4.9,
            reviews: 87,
            discount: 20,
          },
          {
            id: 2,
            title: "Mangkuk Keramik Besar Berkualitas",
            author: "Studio Gerabah Bali",
            price: 245000,
            category: "mangkuk",
            image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop",
            rating: 4.8,
            reviews: 62,
            discount: 15,
          },
          {
            id: 3,
            title: "Pot Tanaman Kreatif Modern",
            author: "Desainer Yogyakarta",
            price: 175000,
            category: "pot",
            image: "https://images.unsplash.com/photo-1578943214027-8063dd2e29ba?w=400&h=400&fit=crop",
            rating: 4.7,
            reviews: 54,
            discount: 10,
          },
          {
            id: 4,
            title: "Kendi Air Klasik Tradisional",
            author: "Pengrajin Surabaya",
            price: 189000,
            category: "peralatan",
            image: "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=400&fit=crop",
            rating: 4.9,
            reviews: 78,
            discount: 25,
          },
          {
            id: 5,
            title: "Piala Penghargaan Keramik Eksklusif",
            author: "Pengrajin Tangan Profesional",
            price: 325000,
            category: "vas",
            image: "https://images.unsplash.com/photo-1605331179666-ab7d7468b51d?w=400&h=400&fit=crop",
            rating: 4.8,
            reviews: 45,
            discount: 0,
          },
          {
            id: 6,
            title: "Piring Hias Batik Gerabah",
            author: "Artisan Lokal Indonesia",
            price: 125000,
            category: "peralatan",
            image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop",
            rating: 4.6,
            reviews: 38,
            discount: 30,
          },
          {
            id: 7,
            title: "Patung Dekorasi Figur Abstrak",
            author: "Seniman Contemporer",
            price: 450000,
            category: "vas",
            image: "https://images.unsplash.com/photo-1578500434004-8f89e46e3aa6?w=400&h=400&fit=crop",
            rating: 4.7,
            reviews: 52,
            discount: 12,
          },
          {
            id: 8,
            title: "Pot Gantung Minimalis Cantik",
            author: "Desainer Inovatif",
            price: 165000,
            category: "pot",
            image: "https://images.unsplash.com/photo-1578943214027-8063dd2e29ba?w=400&h=400&fit=crop",
            rating: 4.8,
            reviews: 61,
            discount: 18,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    { value: "semua", label: "Semua Gerabah" },
    { value: "vas", label: "Vas & Hiasan" },
    { value: "mangkuk", label: "Mangkuk" },
    { value: "pot", label: "Pot Tanaman" },
    { value: "peralatan", label: "Peralatan" },
  ];

  const filteredProducts =
    selectedCategory === "semua"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const getDiscountedPrice = (price, discount) => {
    return Math.round(price * (1 - discount / 100));
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Koleksi Gerabah Kami</h1>
        <p>Temukan berbagai pilihan gerabah handmade favorit Anda</p>
      </div>

      <div className="products-filter">
        <h3>Kategori</h3>
        <div className="filter-buttons">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`filter-btn ${
                selectedCategory === cat.value ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="book-card">
            <div className="book-image-wrapper">
              <img
                src={product.image}
                alt={product.title}
                className="book-image"
              />
              {product.discount > 0 && (
                <div className="discount-badge">-{product.discount}%</div>
              )}
              <div className="book-overlay">
                <button
                  className="quick-view-btn"
                >
                  👁️ Lihat Detail
                </button>
              </div>
            </div>

            <div className="book-info">
              <h3>{product.title}</h3>
              <p className="author">{product.author}</p>

              <div className="rating">
                <span className="stars">⭐ {product.rating}</span>
                <span className="reviews">({product.reviews})</span>
              </div>

              <div className="price-section">
                {product.discount > 0 ? (
                  <>
                    <p className="original-price">
                      {formatRupiah(product.price)}
                    </p>
                    <p className="discounted-price">
                      {formatRupiah(getDiscountedPrice(product.price, product.discount))}
                    </p>
                  </>
                ) : (
                  <p className="price">
                    {formatRupiah(product.price)}
                  </p>
                )}
              </div>

              <button
                className="add-cart-btn"
                onClick={() => handleAddToCart(product)}
              >
                🛒 Tambah Keranjang
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-results">
          <p>Tidak ada gerabah dalam kategori ini</p>
        </div>
      )}
    </div>
  );
}

export default Products;
