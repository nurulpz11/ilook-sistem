import React, { useEffect, useState } from "react"
import "../Jahit/Penjahit.css";
import API from "../../api"; 
import {FaInfoCircle,FaFileExcel, FaCalendarAlt } from 'react-icons/fa';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });

const fetchLogs = async (
  start = startDate,
  end = endDate,
  stat = status,
  page = 1
) => {
  try {
    setLoading(true);
    const response = await API.get("/orders/logs", {
      params: {
        page: page,
        start_date: start,
        end_date: end,
        ...(stat && { status: stat }),
      },
    });

    setLogs(response.data.data); // ⬅ data hasil paginasi
    setPagination({
      current_page: response.data.current_page,
      last_page: response.data.last_page,
    });

  } catch (error) {
    setError("Gagal mengambil data logs.");
  } finally {
    setLoading(false);
  }
};

 
  const fetchSummary = async (start = today, end = today, stat = status) => {
    try {
      setLoadingSummary(true);
      const response = await API.post("/orders/summary", {
        start_date: start,
        end_date: end,
       ...(stat && { status: stat }),
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

 useEffect(() => {
  setStartDate(today);
  setEndDate(today);
  fetchLogs(today, today); 
  fetchSummary(today, today);
}, []);


  const handleFilter = () => {
  if (!startDate || !endDate) {
    alert("Silakan pilih tanggal awal dan akhir!");
    return;
  }

  fetchSummary(startDate, endDate, status);
  fetchLogs(startDate, endDate, status, 1); 
};


  // 🔹 Fungsi Export ke Excel
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await API.get("/orders/logs/export", {
        responseType: "blob",
        params: {
          start_date: startDate,
          end_date: endDate,
           status: status || null,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `logs_order_${startDate}_to_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Gagal export:", error);
      alert("Gagal mengunduh file Excel.");
    } finally {
      setExporting(false);
    }
  };
  
 return (
   <div>
     <div className="penjahit-container">
      <h1>logs Order</h1>
    </div>

     <div className="table-container">
 
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

          
          {/* ✅ Dropdown status */}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="READY_TO_SHIP">READY_TO_SHIP</option>
            <option value="PAID">PAID</option>
            <option value="SHIPPING">SHIPPING</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button onClick={handleFilter} className="btn-summary">
            Tampilkan
          </button>
          {/* 🔹 Tombol Export Excel */}
            <button
            onClick={handleExport}
            className="btn-export"
             disabled={exporting}
           >
           <FaFileExcel style={{ marginRight: 6 }} />
           {exporting ? "Mengunduh..." : "Export Excel"}
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
              <th>Nomor Seri</th>
              <th>Status</th>
            
            
            
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
                <td data-label="tanggal : ">{tc.order?.nomor_seri}</td>
                <td data-label="Total : ">{tc.order?.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
          <div className="pagination">

        <button
          disabled={pagination.current_page === 1}
          onClick={() =>
            fetchLogs(startDate, endDate, status, pagination.current_page - 1)
          }
        >
          Prev
        </button>

        <span>
          Page {pagination.current_page} / {pagination.last_page}
        </span>

        <button
          disabled={pagination.current_page === pagination.last_page}
          onClick={() =>
            fetchLogs(startDate, endDate, status, pagination.current_page + 1)
          }
        >
          Next
        </button>
      </div>

        </div>

  
</div>
  );
};

export default Logs
