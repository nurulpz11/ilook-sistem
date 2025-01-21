import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaRegEye, FaClock,FaInfoCircle,FaClipboard , FaList,FaMoneyBillWave  } from 'react-icons/fa';
import "./Penjahit.css";


const Cashbon = () => {
  const [cashbons, setCashbons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newCashbon, setNewCashbon] = useState({
    id_spk: "",
    jumlah_cashboan: "",
    status_pembayaran: "",
    tanggal_jatuh_tempo: "",
    tanggal_cashboan: "",
  });

  const [selectedCashbon, setSelectedCashbon] = useState(null); // Form pembayaran hutang
    const [logPembayaran, setLogPembayaran] = useState({
      jumlah_dibayar: "",
      tanggal_bayar: "",
      catatan: "",
    });
  

  useEffect(() => {
    fetch("http://localhost:8000/api/cashboan")
      .then((response) => response.json())
      .then((data) => {
        console.log("Data fetched:", data); // Debugging
        setCashbons(data.data || []); // Pastikan respons adalah array
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const [logHistory, setLogHistory] = useState([]); // Untuk menyimpan log pembayaran
  const [selectedDetailCashbon, setSelectedDetailCashbon] = useState(null); // Untuk menyimpan detail cashbon yang dipilih

   // Handle submit form
   const handleFormSubmit= (e) => {
    e.preventDefault(); // Mencegah refresh halaman
  
    // Melakukan POST ke endpoint API
    fetch("http://localhost:8000/api/cashboan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCashbon), // Data yang dikirim ke API
    })
      .then(async (response) => {
        // Periksa jika respons tidak berhasil
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal menyimpan data cashbon.");
        }
        return response.json(); // Parsing respons JSON
      })
      .then((data) => {
        // Jika berhasil, tambahkan data baru ke state
        if (data.success) {
          alert(data.message); // Tampilkan pesan sukses
  
          setCashbons([...cashbons, data.data]); // Perbarui daftar cashbon
          setShowForm(false); // Tutup form modal
          setNewCashbon({
            id_spk: "",
            jumlah_cashboan: "",
            status_pembayaran: "",
            tanggal_jatuh_tempo: "",
            tanggal_cashboan: "",
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

  const handleBayarClick = (cashbon) => {
    setSelectedCashbon(cashbon); // Set hutang yang dipilih untuk pembayaran
  };

  // Handle submit untuk form pembayaran
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:8000/api/log-pembayaran-cashboan/${selectedCashbon.id_cashboan}`, {
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
        setSelectedCashbon(null); // Tutup form pembayaran
        setLogPembayaran({
          jumlah_dibayar: "",
          tanggal_bayar: "",
          catatan: "",
        }); // Reset form pembayaran
      })
      .catch((error) => alert(`Terjadi kesalahan: ${error.message}`));
  };
  const handleDetailClick = (cashbon) => {
    console.log("Detail click triggered for cashbon:", cashbon); // Debug input
    fetch(`http://localhost:8000/api/log-pembayaran-cashboan/${cashbon.id_cashboan}`)
  .then((response) => response.json())
  .then((data) => {
    console.log("Fetched payment logs:", data); // Debug output dari API
    setLogHistory(data.data || []); // Simpan data log pembayaran
    setSelectedDetailCashbon(cashbon); // Tampilkan detail hutang yang dipilih
  })
  .catch((error) => console.error("Error fetching payment logs:", error));

  };
  
  
  


  
  return (
    <div>
   <div className="penjahit-container">
    <h1>Daftar Cashbon</h1>
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
            <th>ID SPK</th>
            <th>JUMLAH CASHBON</th>
            <th>STATUS PEMBAYRAN</th>
            <th>TANGGAL JATUH TEMPO</th>
            <th>TANGGAL CASHBON</th>
            <th>AKSI</th>
          </tr>
        </thead>
        <tbody>
        {cashbons
              .filter((cashbon) =>
                cashbon.status_pembayaran.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((cashbon) => (
            <tr key={cashbon.id_cashboan}>
              <td>{cashbon.id_cashboan}</td>
              <td>{cashbon.id_spk}</td>
              <td>{cashbon.jumlah_cashboan}</td>
              <td>{cashbon.status_pembayaran}</td>
              <td>{cashbon.tanggal_jatuh_tempo}</td>
              <td>{cashbon.tanggal_cashboan}</td>
              <td>
              <div className="action-card">
                  <button 
                    className="btn-icon"
                    onClick={() => handleBayarClick(cashbon)}
                    >
                         <FaMoneyBillWave className="icon" />
                   </button>
                    <button 
                      className="btn-icon"
                      onClick={() => handleDetailClick(cashbon)}
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
      
      {selectedDetailCashbon && (
          <div className="modal">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Detail Cashbon</h3>
                <button
                  className="close-button"
                  onClick={() => setSelectedDetailCashbon(null)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <h4>ID Cashbon: {selectedDetailCashbon.id_cashboan}</h4>
                <p><strong>ID SPK:</strong> {selectedDetailCashbon.id_spk}</p>
                <p><strong>Jumlah Cashbon:</strong> Rp {selectedDetailCashbon.jumlah_cashboan}</p>
                <p><strong>Status Pembayaran:</strong> {selectedDetailCashbon.status_pembayaran}</p>
                <p><strong>Tanggal Jatuh Tempo:</strong> {selectedDetailCashbon.tanggal_jatuh_tempo}</p>
                <p><strong>Tanggal Cashbon:</strong> {selectedDetailCashbon.tanggal_cashboan}</p>
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
                <button className="btn-close" onClick={() => setSelectedDetailCashbon(null)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Modal Form */}
        {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Tambah Data Casbon</h2>
            <form onSubmit={handleFormSubmit} className="modern-form">
              <div className="form-group">
                <label>ID SPK</label>
                <input
                  type="text"
                  value={newCashbon.id_spk}
                  onChange={(e) =>
                    setNewCashbon({ ...newCashbon, id_spk: e.target.value })
                  }
                  placeholder="Masukkan ID SPK"
                  required
                />
              </div>

              <div className="form-group">
                <label>Jumlah Cashbon</label>
                <input
                  type="number"
                  value={newCashbon.jumlah_cashboan}
                  onChange={(e) =>
                    setNewCashbon({ ...newCashbon, jumlah_cashboan: e.target.value })
                  }
                  placeholder="Masukkan jumlah cashbon"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status Pembayaran</label>
                <select
                  type="text"
                  value={newCashbon.status_pembayaran}
                  onChange={(e) =>
                    setNewCashbon({
                      ...newCashbon,
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
                  value={newCashbon.tanggal_jatuh_tempo}
                  onChange={(e) =>
                    setNewCashbon({
                      ...newCashbon,
                      tanggal_jatuh_tempo: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Tanggal Cashbon</label>
                <input
                  type="date"
                  value={newCashbon.tanggal_cashboan}
                  onChange={(e) =>
                    setNewCashbon({
                      ...newCashbon,
                      tanggal_cashboan: e.target.value,
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
     {/* Modal Form Pembayaran */}
     {selectedCashbon && (
        <div className="modal">
          <div className="modal-content">
            <h2>Pembayaran Casbon (ID: {selectedCashbon.id_cashboan})</h2>
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
                  onClick={() => setSelectedCashbon(null)}
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

export default Cashbon