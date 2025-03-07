import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaRegEye, FaClock,FaInfoCircle,FaClipboard , FaList,FaMoneyBillWave  } from 'react-icons/fa';
import "./Penjahit.css";
import API from "../../api"; 


const Cashbon = () => {
  const [cashbons, setCashbons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [penjahitList, setPenjahitList] = useState([]);
  const [error, setError] = useState("");
  const [newCashbon, setNewCashbon] = useState({
    id_penjahit: "",
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
      const fetchCasbons = async () => {
        try {
          setLoading(true);

          const token = localStorage.getItem("token"); 
          if (!token) {
              setError("Token tidak ditemukan. Silakan login kembali.");
              setLoading(false);
              return;
          }

          const response = await API.get(`/cashboan?page=${currentPage}`,{
            headers: { Authorization: `Bearer ${token}` },
          });
    

          console.log("Data Cashbon:", response.data); // Debugging
  
          setCashbons(response.data.data || []); // Set data pendapatan
          setLastPage(response.data.last_page); // Set total halaman
        } catch (error) {
          setError(error.response?.data?.message || "Gagal mengambil data pendapatan.");
        } finally {
          setLoading(false);
        }
      };
    
      fetchCasbons();
    }, [currentPage]); // Perbaikan: sekarang data diperbarui saat currentPage berubah
    
  
  
  
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
    
  const [logHistory, setLogHistory] = useState([]); // Untuk menyimpan log pembayaran
  const [selectedDetailCashbon, setSelectedDetailCashbon] = useState(null); // Untuk menyimpan detail cashbon yang dipilih
   
  // Handle submit form
  const handleFormSubmit= async (e) => {
    e.preventDefault(); // Mencegah refresh halaman

    try {
        const response = await API.post("/cashboan", JSON.stringify(newCashbon), {
            headers: {
                "Content-Type": "application/json",
            },
        });
  
        alert(response.data.message); // Tampilkan pesan sukses
  
        // Perbarui daftar hutang dengan data baru
        setCashbons([...cashbons, response.data.data]);
        setShowForm(false); // Tutup form modal
  
        // Reset form input
        setNewCashbon({
            id_penjahit: "",
            jumlah_cashboan: "",
            status_pembayaran: "",
            tanggal_jatuh_tempo: "",
            tanggal_cashboan: "",
          });
        } catch (error) {
            console.error("Error:", error.response?.data?.message || error.message);
      
            // Tampilkan pesan error dari backend jika ada
            alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data hutang.");
        }
      };
      
  const handleBayarClick = (cashbon) => {
    setSelectedCashbon(cashbon); // Set hutang yang dipilih untuk pembayaran
  };

  // Handle submit untuk form pembayaran
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await API.post(
        `/log-pembayaran-cashboan/${selectedCashbon.id_cashboan}`,
        JSON.stringify(logPembayaran)
      );
  
      alert(response.data.message || "Pembayaran berhasil dicatat!");
      
      setSelectedCashbon(null); // Tutup form pembayaran
      setLogPembayaran({
        jumlah_dibayar: "",
        tanggal_bayar: "",
        catatan: "",
      }); // Reset form pembayaran
    } catch (error) {
      alert(error.response?.data?.message || "Terjadi kesalahan saat mencatat pembayaran.");
    }
  };


  const handleDetailClick = async (cashbon) => {
    try {
      const response = await API.get(`/log-pembayaran-cashboan/${cashbon.id_cashboan}`);
  
      setLogHistory(response.data.data || []); // Simpan data log pembayaran
      setSelectedDetailCashbon(cashbon); // Tampilkan detail hutang yang dipilih
    } catch (error) {
      console.error("Error fetching payment logs:", error);
    }
  };
  
  const getFilteredPenjahit = async (selectedId, page = 1) => {
    try {
        const response = await API.get(`/cashboan`, {
            params: { penjahit: selectedId, page: page }
        });

        console.log("Filtered Data:", response.data); // Debugging

        setCashbons(Array.isArray(response.data.data) ? response.data.data : []);
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
        <h1>Daftar Cashbon</h1>   
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
      <div className="table-container">
      <table className="penjahit-table">
        <thead>
          <tr>
            <th>ID </th>
            <th>Nama Penjahit</th>
            <th>TANGGAL CASHBON</th>
            <th>TANGGAL JATUH TEMPO</th>
            <th>STATUS PEMBAYRAN</th>
            <th>JUMLAH CASHBON</th>
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
              <td data-label="Id Cashbon : ">{cashbon.id_cashboan}</td>
              <td data-label="Penjahit : ">
                    {
                      penjahitList.find(penjahit => penjahit.id_penjahit === cashbon.id_penjahit)?.nama_penjahit || 'Tidak Diketahui'
                    }
                  </td>
              <td data-label="Tanggal Cashbon : ">{formatTanggal(cashbon.tanggal_cashboan)}</td>
              <td data-label="Tanggal Jatuh Tempo : ">{formatTanggal(cashbon.tanggal_jatuh_tempo)}</td>
              <td data-label="Jumlah Cashbon : ">{cashbon.jumlah_cashboan}</td>
              <td   data-label=" ">
                    <span
                      style={{
                        backgroundColor: getStatusColor(cashbon.status_pembayaran),
                        color: "white",
                        padding: "3px 5px",
                        borderRadius: "5px",
                        textTransform: "capitalize", 
                      
                    }}
                    >
                    {cashbon.status_pembayaran}
                    </span>
                  </td>
             
             
              <td  data-label=" ">
              <div className="action-card">
                  <button 
                    className="btn1-icon"
                    onClick={() => handleBayarClick(cashbon)}
                    >
                         <FaMoneyBillWave className="icon" />
                   </button>
                    <button 
                      className="btn1-icon"
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
                <p><strong>ID Penjahit:</strong> {selectedDetailCashbon.id_penjahit}</p>
                <p><strong>Jumlah Cashbon:</strong> Rp {selectedDetailCashbon.jumlah_cashboan}</p>
                <p><strong>Status Pembayaran:</strong> {selectedDetailCashbon.status_pembayaran}</p>
                <p><strong>Tanggal Jatuh Tempo:</strong> {selectedDetailCashbon.tanggal_jatuh_tempo}</p>
                <p><strong>Tanggal Cashbon:</strong> {selectedDetailCashbon.tanggal_cashboan}</p>
                <p><strong>Sisa Cashbon:</strong> Rp {selectedDetailCashbon.sisa_cashboan ?? 0}</p>
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
              <label>ID Penjahit:</label>
                <select
                  value={newCashbon.id_penjahit}
                  onChange={(e) =>
                    setNewCashbon({ ...newCashbon, id_penjahit: e.target.value })
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
    </div>
  );
};

export default Cashbon