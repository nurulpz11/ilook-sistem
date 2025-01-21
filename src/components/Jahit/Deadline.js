import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaRegEye, FaClock,FaInfoCircle,FaClipboard , FaList,FaMoneyBillWave  } from 'react-icons/fa';
import "./Penjahit.css";

const Deadline = () => {
  const [logsDeadline, setLogsDeadline] = useState([]);
 
  useEffect(() => {
    fetch("http://localhost:8000/api/log-deadlines")
      .then((response) => response.json())
      .then((data) => {
        console.log("Data log deadlines:", data); // Debugging
        setLogsDeadline(data || []);
      })
      .catch((error) => console.error("Error fetching log deadlines:", error));
  }, []);
  

  return (
    <div>
    <div className="penjahit-container">
      <h1>Log Deadlines</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Cari ..."
        
        />
        
      </div>
    </div>
 <div className="penjahit-container">
  <table className="penjahit-table">
    <thead>
      <tr>
        <th>ID Log</th>
        <th>ID SPK</th>
        <th>Deadline Lama</th>
        <th>Deadline Baru</th>
        <th>waktu perubahan</th>
        <th>Keterangan</th>
      </tr>
    </thead>
    <tbody>
      {logsDeadline.map((log) => (
        <tr key={log.id_log}>
          <td>{log.id_log}</td>
          <td>{log.id_spk}</td>
          <td>{log.deadline_lama}</td>
          <td>{log.deadline_baru}</td>
          <td>{log.tanggal_aktivitas}</td>
          <td>{log.keterangan}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
</div>

  )
}

export default Deadline