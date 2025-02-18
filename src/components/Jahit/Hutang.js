import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaRegEye, FaClock,FaInfoCircle,FaClipboard , FaList,FaMoneyBillWave  } from 'react-icons/fa';
import "./Penjahit.css";
import API from "../../api"; 

const Hutang = () => {
  const [hutangs, setHutangs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [penjahitList, setPenjahitList] = useState([]); 
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
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
    const fetchHutangs = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem("token"); 
        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }
  
        const response = await API.get(`/hutang?page=${currentPage}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("Data Hutang:", response.data); // Debugging
  
        setHutangs(response.data.data); // Ambil data dari pagination Laravel
        setLastPage(response.data.last_page); // Set total halaman
      } catch (error) {
        setError(error.response?.data?.message || "Gagal mengambil data hutang.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchHutangs();
  }, [currentPage]); // Perbaikan: sekarang data diperbarui saat currentPage berubah
  



const [logHistory, setLogHistory] = useState([]); // Untuk menyimpan log pembayaran
const [selectedDetailHutang, setSelectedDetailHutang] = useState(null); // Untuk menyimpan detail cashbon yang dipilih

useEffect(() => {
  const fetchPenjahits = async () => {
    try {
      setLoading(true);
      const response = await API.get("/penjahit"); 
      setPenjahitList(response.data);
    } catch (error) {
      setError("Gagal mengambil data penjahit.");
    } finally {
      setLoading(false);
    }
  };

  fetchPenjahits();
}, []);


const handleFormSubmit = async (e) => {
  e.preventDefault(); // Mencegah refresh halaman

  try {
      const response = await API.post("/hutang", JSON.stringify(newHutang), {
          headers: {
              "Content-Type": "application/json",
          },
      });

      alert(response.data.message); // Tampilkan pesan sukses

      // Perbarui daftar hutang dengan data baru
      setHutangs([...hutangs, response.data.data]);
      setShowForm(false); // Tutup form modal

      // Reset form input
      setNewHutang({
          id_penjahit: "",
          jumlah_hutang: "",
          status_pembayaran: "",
          tanggal_jatuh_tempo: "",
          tanggal_hutang: "",
      });
  } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);

      // Tampilkan pesan error dari backend jika ada
      alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data hutang.");
  }
};

     // Handle klik bayar
  const handleBayarClick = (hutang) => {
    setSelectedHutang(hutang); // Set hutang yang dipilih untuk pembayaran
  };

  // Handle submit untuk form pembayaran
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await API.post(
        `/log-pembayaran-hutang/${selectedHutang.id_hutang}`,
        JSON.stringify(logPembayaran)
      );
  
      alert(response.data.message || "Pembayaran berhasil dicatat!");
      
      setSelectedHutang(null); // Tutup form pembayaran
      setLogPembayaran({
        jumlah_dibayar: "",
        tanggal_bayar: "",
        catatan: "",
      }); // Reset form pembayaran
    } catch (error) {
      alert(error.response?.data?.message || "Terjadi kesalahan saat mencatat pembayaran.");
    }
  };
  
  const handleDetailClick = async (hutang) => {
    try {
      const response = await API.get(`/log-pembayaran-hutang/${hutang.id_hutang}`);
  
      setLogHistory(response.data.data || []); // Simpan data log pembayaran
      setSelectedDetailHutang(hutang); // Tampilkan detail hutang yang dipilih
    } catch (error) {
      console.error("Error fetching payment logs:", error);
    }
  };
  

  const getFilteredPenjahit = async (selectedId, page = 1) => {
    try {
        const response = await API.get(`/hutang`, {
            params: { penjahit: selectedId, page: page }
        });

        console.log("Filtered Data:", response.data); // Debugging

        setHutangs(Array.isArray(response.data.data) ? response.data.data : []);
        setLastPage(response.data.last_page);
    } catch (error) {
        console.error("Error fetching data:", error);

        // Tampilkan pesan error jika ada respons dari backend
        const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat mengambil data hutang.";
        alert(errorMessage);
    }
};

  
  const formatTanggal = (tanggal) => {
    const date = new Date(tanggal);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const getStatusColor = (status_pembayaran) => {
    switch (status_pembayaran) {
      case "belum lunas":
        return "#DCA5A0"; // Kategori A: hijau
      case "dibayar sebagian":
        return "#EAC98D";  // Kategori B: biru
      case "lunas":
        return "#A0DCDC"; // Kategori C: oranye
      default:
        return "black";  // Default: hitam jika kategori tidak dikenali
    }
    
  };

  return (
    <div>
      <div className="penjahit-container">
        <h1>Daftar Hutang</h1>
      </div>
      <div className="table-container">
      <div className="filter-header1">
      <button 
        onClick={() => setShowForm(true)}>
          Tambah
        </button>
        <label htmlFor="penjahitFilter" className="filter-label"></label>
        <select
          id="penjahitFilter"
          className="filter-select1"
          onChange={(e) => getFilteredPenjahit(e.target.value)}
        >
          <option value="">All</option>
          {penjahitList.map((penjahit) => (
            <option key={penjahit.id_penjahit} value={penjahit.id_penjahit}>
              {penjahit.nama_penjahit}
            </option>
          ))}
        </select>

      </div>
        <table className="penjahit-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAMA PENJAHIT</th>
              <th>TANGGAL HUTANG</th>
              <th>TANGGAL JATUH TEMPO</th>
              <th>JUMLAH HUTANG</th>
              <th>STATUS PEMBAYARAN</th>
              
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
                  <td data-label="Id Hutang : ">{hutang.id_hutang}</td>
                  <td data-label="Penjahit : ">
                    {
                      penjahitList.find(penjahit => penjahit.id_penjahit === hutang.id_penjahit)?.nama_penjahit || 'Tidak Diketahui'
                    }
                  </td>
                  <td data-label=" Tanggal Hutang : ">{formatTanggal(hutang.tanggal_hutang)}</td>
                  <td data-label = "Tanggal Jatuh Tempo : ">{formatTanggal(hutang.tanggal_jatuh_tempo)}</td>
                  <td data-label= "Jumlah Hutang : ">{hutang.jumlah_hutang}</td>
                  
                  <td>
                    <span
                      style={{
                        backgroundColor: getStatusColor(hutang.status_pembayaran),
                        color: "white",
                        padding: "3px 5px",
                        borderRadius: "5px",
                      
                    }}
                    >
                    {hutang.status_pembayaran}
                    </span>
                  </td>
                      
                 
                  <td>
                  <div className="action-card">
                  <button 
                    className="btn1-icon"
                    onClick={() => handleBayarClick(hutang)}
                    >
                        <FaMoneyBillWave className="icon" />
                        </button>
                  
                  <button 
                    className="btn1-icon" 
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
        {/* Pagination */}
        <div className="pagination-container">
          <button 
            className="pagination-button" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ◀ Prev
          </button>

          <span className="pagination-info">Halaman {currentPage} dari {lastPage}</span>

          <button 
            className="pagination-button" 
            disabled={currentPage === lastPage} 
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Tambah Data Hutang</h2>
            <form onSubmit={handleFormSubmit} className="modern-form">
              <div className="form-group">
              <label>ID Penjahit:</label>
            <select
              value={newHutang.id_penjahit}
              onChange={(e) =>
                setNewHutang({ ...newHutang, id_penjahit: e.target.value })
              }
              required
            >
              <option value="" disabled>
                Pilih Penjahit
              </option>
              {penjahitList.map((penjahit) => (
                <option key={penjahit.id_penjahit} value={penjahit.id_penjahit}>
                  {penjahit.nama_penjahit}
                </option>
              ))}
            </select>
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
