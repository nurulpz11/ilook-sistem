import React, { useEffect, useState } from "react"
import "../Jahit/Penjahit.css";
import API from "../../api"; 
import {FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Fungsi ambil tanggal hari ini (format yyyy-mm-dd)
  const today = new Date().toISOString().slice(0, 10);

  // 🔹 Ambil data logs
  const fetchLogs = async () => {
    try {
      const response = await API.get("/orders/logs");
      setLogs(response.data);
    } catch (error) {
      setError("Gagal mengambil data logs.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Ambil summary
  const fetchSummary = async (start = today, end = today) => {
    try {
      setLoadingSummary(true);
      const response = await API.post("/orders/summary", {
        start_date: start,
        end_date: end,
      });
      if (response.data.data.length > 0) {
        setSummary(response.data.data[0]);
      } else {
        setSummary({ total_order: 0, total_items: 0, total_amount: 0 });
      }
    } catch (error) {
      console.error(error);
      setError("Gagal mengambil summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // 🔹 Saat pertama kali halaman load → tampilkan data hari ini
  useEffect(() => {
    setStartDate(today);
    setEndDate(today);
    fetchLogs();
    fetchSummary(today, today);
  }, []);

  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Silakan pilih tanggal awal dan akhir!");
      return;
    }
    fetchSummary(startDate, endDate);
  };
  
 return (
   <div>
     <div className="penjahit-container">
      <h1>logs Order</h1>
    </div>

     <div className="table-container">
        <div className="filter-header1">
         <div className="logs-container">
      

      {/* Filter tanggal */}
      <div className="filter-container">
        <div className="filter-group">
          <label>
            <FaCalendarAlt className="calendar-icon" /> Dari:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label>
            <FaCalendarAlt className="calendar-icon" /> Sampai:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button onClick={handleFilter} className="btn-summary">
            Tampilkan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card-summary card-blue">
          <h3>Total Pesanan</h3>
          <p>{loadingSummary ? "..." : summary?.total_order || 0}</p>
        </div>

        <div className="card-summary card-green">
          <h3>Total Produk</h3>
          <p>{loadingSummary ? "..." : summary?.total_items || 0}</p>
        </div>

        <div className="card-summary card-orange">
          <h3>Total Pendapatan Kotor</h3>
          <p>
            {loadingSummary
              ? "..."
              : `Rp ${parseFloat(summary?.total_amount || 0).toLocaleString(
                  "id-ID"
                )}`}
          </p>
        </div>
      </div>
      </div>
          
      </div>
        <div className="table-container">
        <table className="penjahit-table">
          <thead>
            <tr>
              <th>Tracking Number</th>
              <th>Kasir</th>
              <th>Total Item</th>
              <th>Total Harga</th>
              <th>Tanggal</th>
            
            
            
            </tr>
          </thead>
          <tbody>
            {logs.map((tc) => (
              <tr key={tc.id}>
                <td data-label="tracking number : ">{tc.order?.tracking_number}</td>
                <td data-label="Kasir : ">{tc.performed_by}</td>
                 <td data-label="Total : ">{tc.order?.total_items}</td>
                  <td data-label="Total : ">Rp. {tc.order?.total_amount}</td>
                <td data-label="tanggal : ">{tc.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

   
        </div>
</div>
  );
};

export default Logs