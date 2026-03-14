import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { formatRupiah } from "../utils/formatCurrency";
import "./OrderHistory.css";

function OrderHistory() {
  const { orders } = useContext(CartContext);

  const getStatusColor = (status) => {
    if (status === "Terkirim") return "delivered";
    if (status === "Dalam Pengiriman") return "pending";
    return "cancelled";
  };

  return (
    <div className="order-container">
      <div className="order-header">
        <h1>📦 Riwayat Pesanan</h1>
        <p>Lihat semua pesanan Anda</p>
      </div>

      <div className="order-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header-section">
              <div className="order-id">
                <h3>{order.order_number}</h3>
                <p>{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
              </div>
              <div className="order-status">
                <span className={`status-badge ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="order-items-grid">
              {order.items.map((item, idx) => (
                <div key={idx} className="item-thumbnail">
                  <img src={item.image} alt={item.title} />
                  <div className="item-info-small">
                    <p className="item-title">{item.title}</p>
                    <p className="item-qty">x{item.quantity}</p>
                    <p className="item-price">{formatRupiah(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-total">
                <p className="total-label">Total</p>
                <p className="total-amount">{formatRupiah(order.total)}</p>
              </div>
              <button className="track-btn">🔍 Lacak</button>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="no-orders">
          <p>Anda belum memiliki pesanan</p>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
