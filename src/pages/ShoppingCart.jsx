import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { formatRupiah } from "../utils/formatCurrency";
import "./ShoppingCart.css";

function ShoppingCart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalPrice, createOrder } =
    useContext(CartContext);

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
    try {
      const newOrder = createOrder();
      if (newOrder) {
        navigate("/orders");
      }
    } catch (error) {
      console.error("Checkout error:", error.message);
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>🛒 Keranjang Belanja</h1>
        <p>{cart.length} item dalam keranjang</p>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Keranjang belanja Anda kosong</p>
              <button
                className="continue-shopping"
                onClick={() => navigate("/products")}
              >
                ← Lanjut Belanja
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="item-details">
                    <h3>{item.title}</h3>
                    <p className="item-author">{item.author}</p>
                    <p className="item-price">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                  <div className="item-quantity">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <div className="item-total">
                    <p>{formatRupiah(item.price * item.quantity)}</p>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(getTotalPrice())}</span>
                </div>
                <div className="summary-row">
                  <span>Pajak (10%):</span>
                  <span>{formatRupiah(getTotalPrice() * 0.1)}</span>
                </div>
                <div className="summary-row">
                  <span>Ongkos Kirim:</span>
                  <span>{formatRupiah(25000)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>
                    {formatRupiah(getTotalPrice() + getTotalPrice() * 0.1 + 25000)}
                  </span>
                </div>
              </div>

              <div className="cart-actions">
                <button
                  className="continue-shopping"
                  onClick={() => navigate("/products")}
                >
                  ← Lanjut Belanja
                </button>
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  ✓ Checkout
                </button>
              </div>
            </>
          )}
        </div>

        <div className="cart-sidebar">
          <div className="promo-card">
            <h3>🎁 Promosi</h3>
            <p>Gratis ongkir untuk pembelian di atas Rp 500.000</p>
          </div>
          <div className="tips-card">
            <h3>💡 Tips</h3>
            <p>Kumpulkan poin loyalty setiap pembelian untuk diskon eksklusif!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCart;
