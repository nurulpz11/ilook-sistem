import React, { useState } from "react";
import "./Packing.css";
import "../Jahit/Penjahit.css";
import API from "../../api";
import { FaBarcode, FaCheck, FaTimes } from "react-icons/fa";

const Packing = () => {
 const [trackingNumber, setTrackingNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [scannedSku, setScannedSku] = useState("");
  const [scannedItems, setScannedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  

  const playSound = (type) => {
    const soundMap = {
      success: "/sounds/success.mp3",
      error: "/sounds/failed.mp3",
      scanproduk: "/sounds/scanprodukberhasil.mp3",
      noproduk: "/sounds/produktidaksesuai.mp3",
      sudahpacking: "/sounds/orderansudahpacking.mp3",
      validasiok: "/sounds/validasiberhasil.mp3",
      
    };
    const audio = new Audio(soundMap[type]);
    audio.play();
};


  // 🔸 1. Cek Tracking Number
  // 🔸 1. Cek Tracking Number
const handleSearchOrder = async () => {
  if (!trackingNumber) return;
  setLoading(true);
  setMessage("");

  try {
    const response = await API.get(`/orders/tracking/${trackingNumber}`);
    const orderData = response.data;

    if (orderData.status === "packed") {
      setMessage("⚠️ Order ini sudah berstatus packed dan tidak bisa discan ulang.");
      playSound("sudahpacking");
      setLoading(false);
      return;
    }

    const initialScan = orderData.items.map((item) => ({
      sku: item.sku,
      product_name: item.product_name,
      ordered_qty: item.quantity,
      scanned_qty: 0,
      image: item.image,
    }));

    setOrder(orderData);
    setScannedItems(initialScan);
  } catch (error) {
    setOrder(null);
    setScannedItems([]);

    const msg = error.response?.data?.message || "Order tidak ditemukan";
    setMessage(msg);

    // 🔊 Tambahan: mainkan sound berdasarkan pesan
    if (msg.includes("sudah di packing")) {
      playSound("sudahpacking");
    } else {
      playSound("error");
    }
  } finally {
    setLoading(false);
  }
};


  // 🔸 2. Scan SKU produk (barcode / manual)
  const handleScanSku = (e) => {
    e.preventDefault();
    const sku = scannedSku.trim();
    if (!sku) return;

    const itemIndex = scannedItems.findIndex((item) => item.sku == sku);

    if (itemIndex === -1) {
       setMessage(`❌ SKU ${sku} tidak ditemukan dalam order`);
         playSound("noproduk");
       setScannedSku("");
    return;
  
    }
    const updatedItems = [...scannedItems];
    const target = updatedItems[itemIndex];

    // Cek apakah sudah melebihi jumlah order
    if (target.scanned_qty >= target.ordered_qty) {
      setMessage(`⚠️ SKU ${sku} discan melebihi jumlah pesanan`);
      playSound("error");
    } else {
      target.scanned_qty += 1;
      setMessage(`✅ SKU ${sku} berhasil discan`);
      playSound("scanproduk");
    }

    setScannedItems(updatedItems);
    setScannedSku("");
  };



  // 🔸 3. Submit Validasi ke Backend
  const handleSubmitValidation = async () => {
    if (!order) return;

    try {
      const payload = {
        items: scannedItems.map((item) => ({
          sku: item.sku,
          quantity: item.scanned_qty,
        })),
      };

      const response = await API.post(
        `/orders/scan/${trackingNumber}`,
        payload
      );
      setMessage(response.data.message || "✅ Order berhasil divalidasi");
       playSound("validasiok");
      setOrder(null);
      setScannedItems([]);
      setTrackingNumber("");
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ Validasi gagal");
      playSound("error"); 
    }
  };
  

  return (
    <div>
    <div className="penjahit-container">
      <h1>Packing Scan</h1>
    </div>

    <div className="tracking-card">
      {/* Input Tracking Number */}
      <div className="tracking-input-wrapper">
        <input
          type="text"
          placeholder="Scan / masukkan Tracking Number..."
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchOrder()}
          autoFocus
          className="tracking-input-modern"
        />
        <button 
          onClick={handleSearchOrder} 
          disabled={loading}
          className="btn-search-modern"
          >
          {loading ? "Loading..." : "Cari Order"}
        </button>
     
      {message && <div className="packing-message">{message}</div>}
  </div>
      {/* Tabel Item Order */}
      {order && (
        <div className="order-section">
          <h2>Order #{order.order_number}</h2>
          <p>
            <strong>Nama Customer:</strong> {order.customer_name} <br />
            <strong>No. HP:</strong> {order.customer_phone}  <br />
             <strong>Total Produk:</strong> {order.total_qty}

          </p>

          <table className="packing-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nama Produk</th>
                <th>Qty Pesanan</th>
                <th>Qty Scan</th>
                <th>Gambar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {scannedItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.sku}</td>
                  <td>{item.product_name}</td>
                  <td className="qty-cell ordered">{item.ordered_qty}</td>
                  <td className="qty-cell scanned">{item.scanned_qty}</td>

                   <td>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="product-image"
                      />
                    ) : (
                      <span style={{ color: "#aaa", fontSize: "13px" }}>No Image</span>
                    )}
                  </td>
                  <td>
                    {item.scanned_qty === item.ordered_qty ? (
                      <span className="status-ok">
                        <FaCheck /> OK
                      </span>
                    ) : (
                      <span className="status-wait">
                        <FaBarcode /> Scan...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Input Scan SKU */}
          <form onSubmit={handleScanSku} className="sku-input">
            <input
              type="text"
              placeholder="Scan SKU Produk..."
              value={scannedSku}
              onChange={(e) => setScannedSku(e.target.value)}
              autoFocus
            />
            <button type="submit">Scan</button>
          </form>

          {/* Submit Validasi */}
          <div className="packing-actions">
            <button onClick={handleSubmitValidation} className="btn-validate">
              Submit Validasi
            </button>
            <button
              onClick={() => {
                setOrder(null);
                setScannedItems([]);
              }}
              className="btn-cancel"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
     </div>

  );
};

export default Packing;