import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaRegEye, FaClock,FaInfoCircle,FaClipboard , FaList,FaMoneyBillWave  } from 'react-icons/fa';
import "./Penjahit.css";

const Hutang = () => {
  const [hutangs, setHutangs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newHutang, setNewHutang] = useState({
    id_penjahit: "",
    jumlah_hutang: "",
    status_pembayaran: "",
    tanggal_jatuh_tempo: "",
    tanggal_hutang: "",
  });
  const [selectedHutang, setSelectedHutang] = useState(null); // Form pembayaran hutang
  const [logPembayaran, setLogPembayaran] = useState({
    jumlah_dibayar: "",
    tanggal_bayar: "",
    catatan: "",
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/hutang")
      .then((response) => response.json())
      .then((data) => {
        console.log("Data fetched:", data); // Debugging
        setHutangs(data.data || []);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const [logHistory, setLogHistory] = useState([]); // Untuk menyimpan log pembayaran
const [selectedDetailHutang, setSelectedDetailHutang] = useState(null); // Untuk menyimpan detail cashbon yang dipilih


    const handleFormSubmit = (e) => {
      e.preventDefault(); // Mencegah refresh halaman
    
      // Melakukan POST ke endpoint API
      fetch("http://localhost:8000/api/hutang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHutang), // Data yang dikirim ke API
      })
        .then(async (response) => {
          // Periksa jika respons tidak berhasil
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal menyimpan data hutang.");
          }
          return response.json(); // Parsing respons JSON
        })
        .then((data) => {
          // Jika berhasil, tambahkan data baru ke state
          if (data.success) {
            alert(data.message); // Tampilkan pesan sukses
    
            setHutangs([...hutangs, data.data]); // Perbarui daftar hutang
            setShowForm(false); // Tutup form modal
            setNewHutang({
              id_penjahit: "",
              jumlah_hutang: "",
              status_pembayaran: "",
              tanggal_jatuh_tempo: "",
              tanggal_hutang: "",
            }); // Reset form input
          } else {
            alert(data.message || "Gagal menambahkan data.");
          }
        })
        .catch((error) => {
          console.error("Error:", error.message);
          alert(`Terjadi kesalahan: ${error.message}`); // Tampilkan pesan kesalahan
        });
    };
     // Handle klik bayar
  const handleBayarClick = (hutang) => {
    setSelectedHutang(hutang); // Set hutang yang dipilih untuk pembayaran
  };

  // Handle submit untuk form pembayaran
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:8000/api/log-pembayaran-hutang/${selectedHutang.id_hutang}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logPembayaran),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal mencatat pembayaran.");
        }
        return response.json();
      })
      .then((data) => {
        alert(data.message || "Pembayaran berhasil dicatat!");
        setSelectedHutang(null); // Tutup form pembayaran
        setLogPembayaran({
          jumlah_dibayar: "",
          tanggal_bayar: "",
          catatan: "",
        }); // Reset form pembayaran
      })
      .catch((error) => alert(`Terjadi kesalahan: ${error.message}`));
  };
  const handleDetailClick = (hutang) => {
    fetch(`http://localhost:8000/api/log-pembayaran-hutang/${hutang.id_hutang}`)
      .then((response) => response.json())
      .then((data) => {
        setLogHistory(data.data || []); // Simpan data log pembayaran
        setSelectedDetailHutang(hutang); // Tampilkan detail hutang yang dipilih
      })
      .catch((error) => console.error("Error fetching payment logs:", error));
  };
  

  return (
    <div>
      <div className="penjahit-container">
        <h1>Daftar Hutang</h1>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Cari nama penjahit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="add-button" onClick={() => setShowForm(true)}>
            Tambah
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="penjahit-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID PENJAHIT</th>
              <th>JUMLAH HUTANG</th>
              <th>STATUS PEMBAYARAN</th>
              <th>TANGGAL JATUH TEMPO</th>
              <th>TANGGAL HUTANG</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
          {hutangs
              .filter((hutang) =>
                hutang.status_pembayaran.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((hutang) => (
                <tr key={hutang.id_hutang}>
                  <td>{hutang.id_hutang}</td>
                  <td>{hutang.id_penjahit}</td>
                  <td>{hutang.jumlah_hutang}</td>
                  <td>{hutang.status_pembayaran}</td>
                  <td>{hutang.tanggal_jatuh_tempo}</td>
                  <td>{hutang.tanggal_hutang}</td>
                  <td>
                  <div className="action-card">
                  <button 
                    className="btn-icon"
                    onClick={() => handleBayarClick(hutang)}
                    >
                        <FaMoneyBillWave className="icon" />
                        </button>
                  
                  <button 
                    className="btn-icon" 
                     onClick={() => handleDetailClick(hutang)}
                     >
                     <FaInfoCircle className="icon" />
                     </button>
                  </div>
                </td>

                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Tambah Data Hutang</h2>
            <form onSubmit={handleFormSubmit} className="modern-form">
              <div className="form-group">
                <label>ID Penjahit</label>
                <input
                  type="text"
                  value={newHutang.id_penjahit}
                  onChange={(e) =>
                    setNewHutang({ ...newHutang, id_penjahit: e.target.value })
                  }
                  placeholder="Masukkan ID Penjahit"
                  required
                />
              </div>

              <div className="form-group">
                <label>Jumlah Hutang</label>
                <input
                  type="number"
                  value={newHutang.jumlah_hutang}
                  onChange={(e) =>
                    setNewHutang({ ...newHutang, jumlah_hutang: e.target.value })
                  }
                  placeholder="Masukkan jumlah hutang"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status Pembayaran</label>
                <select
                  type="text"
                  value={newHutang.status_pembayaran}
                  onChange={(e) =>
                    setNewHutang({
                      ...newHutang,
                      status_pembayaran: e.target.value,
                    })
                  }
                  placeholder="Masukkan status pembayaran"
                  required
                  >
                  <option value="">Pilih Status Pembayaran</option>
                  <option value="belum lunas">Belum Lunas</option>
                  <option value="lunas">Lunas</option>
                  <option value="dibayar sebagian">Dibayar Sebagian</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tanggal Jatuh Tempo</label>
                <input
                  type="date"
                  value={newHutang.tanggal_jatuh_tempo}
                  onChange={(e) =>
                    setNewHutang({
                      ...newHutang,
                      tanggal_jatuh_tempo: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Tanggal Hutang</label>
                <input
                  type="date"
                  value={newHutang.tanggal_hutang}
                  onChange={(e) =>
                    setNewHutang({
                      ...newHutang,
                      tanggal_hutang: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-submit">
                  Simpan
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    {selectedDetailHutang && (
          <div className="modal">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Detail Hutang</h3>
                <button
                  className="close-button"
                  onClick={() => setSelectedDetailHutang(null)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <h4>ID Hutang: {selectedDetailHutang.id_hutang}</h4>
                <p><strong>ID Penjahit:</strong> {selectedDetailHutang.id_penjahit}</p>
                <p><strong>Jumlah Hutang:</strong> Rp {selectedDetailHutang.jumlah_hutang}</p>
                <p><strong>Status Pembayaran:</strong> {selectedDetailHutang.status_pembayaran}</p>
                <p><strong>Tanggal Jatuh Tempo:</strong> {selectedDetailHutang.tanggal_jatuh_tempo}</p>
                <p><strong>Tanggal Cashbon:</strong> {selectedDetailHutang.tanggal_hutang}</p>
                <h4>Log Pembayaran:</h4>
                {logHistory.length > 0 ? (
                  logHistory.map((log, index) => (
                    <div key={index} className="log-item">
                      <p><strong>Jumlah Dibayar:</strong> Rp {log.jumlah_dibayar}</p>
                      <p><strong>Tanggal Bayar:</strong> {log.tanggal_bayar}</p>
                      <p><strong>Catatan:</strong> {log.catatan}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-logs">Tidak ada log pembayaran.</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-close" onClick={() => setSelectedDetailHutang(null)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      

      {/* Modal Form Pembayaran */}
      {selectedHutang && (
        <div className="modal">
          <div className="modal-content">
            <h2>Pembayaran Hutang (ID: {selectedHutang.id_hutang})</h2>
            <form onSubmit={handlePaymentSubmit} className="modern-form">
              <div className="form-group">
                <label>Jumlah Dibayar</label>
                <input
                  type="number"
                  value={logPembayaran.jumlah_dibayar}
                  onChange={(e) =>
                    setLogPembayaran({ ...logPembayaran, jumlah_dibayar: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Tanggal Bayar</label>
                <input
                  type="date"
                  value={logPembayaran.tanggal_bayar}
                  onChange={(e) =>
                    setLogPembayaran({ ...logPembayaran, tanggal_bayar: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Catatan</label>
                <textarea
                  value={logPembayaran.catatan}
                  onChange={(e) =>
                    setLogPembayaran({ ...logPembayaran, catatan: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-submit">
                  Simpan Pembayaran
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => setSelectedHutang(null)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
  

export default Hutang;
