import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaRegEye, FaClock,FaInfoCircle,FaClipboard , FaList,FaMoneyBillWave  } from 'react-icons/fa';
import "./Penjahit";
import axios from "axios";
import API from "../../api"; 

const Pendapatan = () => {
  const [pendapatans, setPendapatans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedPendapatan, setSelectedPendapatan] = useState(null);
  const [detailPengiriman, setDetailPengiriman] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [penjahitList, setPenjahitList] = useState([]);
  const [newPendapatan, setNewPendapatan] = useState({
    id_pendapatan:"",
    id_penjahit: "",
    periode_awal: "",
    periode_akhir: "",
    handtag: "",
    transportasi: "",
    total_pendapatan: 0,
    total_claim: 0,
    total_refund_claim: 0,
    total_cashbon: 0,
    total_hutang: 0,
    total_transfer: 0,
  });

  useEffect(() => {
    const fetchPendapatans = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }
  
        const response = await API.get(`/pendapatan?page=${currentPage}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("Data Pendapatan:", response.data); // Debugging
  
        setPendapatans(response.data.data || []); // Set data pendapatan
        setLastPage(response.data.last_page); // Set total halaman
      } catch (error) {
        setError(error.response?.data?.message || "Gagal mengambil data pendapatan.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchPendapatans();
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
  
  

const handleFormSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await API.post("/pendapatan", newPendapatan);

    if (response.data.message === "Pendapatan berhasil disimpan.") {
      // Tambahkan data baru di awal array
      setPendapatans([response.data.data, ...pendapatans]);
      setShowForm(false);
      resetForm();
    } else {
      console.error("Error adding data:", response.data);
    }
  } catch (error) {
    console.error("Error adding data:", error);
  }
};



const handleLoadData = async () => {
  try {
    const { id_penjahit, periode_awal, periode_akhir } = newPendapatan;

    const response = await API.post("/pendapatan/calculate", {
      id_penjahit,
      periode_awal,
      periode_akhir,
    });

    setNewPendapatan((prev) => ({
      ...prev,
      total_pendapatan: response.data.total_pendapatan || 0,
      total_claim: response.data.total_claim || 0,
      total_refund_claim: response.data.total_refund_claim || 0,
      total_cashbon: response.data.total_cashbon || 0,
      total_hutang: response.data.total_hutang || 0,
      total_transfer: calculateTotalTransfer(response.data),
    }));
  } catch (error) {
    console.error("Error loading data:", error);
  }
};


  const calculateTotalTransfer = (data) => {
    const { total_pendapatan, total_claim, total_refund_claim, total_cashbon, total_hutang } = data;
    const { handtag, transportasi } = newPendapatan;
    return (
      (total_pendapatan || 0) +
      (total_refund_claim || 0) -
      (total_claim || 0) -
      (total_cashbon || 0) -
      (total_hutang || 0) -
      (handtag || 0) -
      (transportasi || 0)
    );
  };

  const resetForm = () => {
    setNewPendapatan({
      id_penjahit: "",
      periode_awal: "",
      periode_akhir: "",
      handtag: "",
      transportasi: "",
      total_pendapatan: 0,
      total_claim: 0,
      total_refund_claim: 0,
      total_cashbon: 0,
      total_hutang: 0,
      total_transfer: 0,
    });
  };
  
  const formatTanggal = (tanggal) => {
    const date = new Date(tanggal);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const handleDetailClick = async (pendapatan) => {
    setSelectedPendapatan(pendapatan);
    setLoading(true);
    setError("");
  
    try {
      // Panggil API untuk mendapatkan detail pengiriman
      const response = await API.get(`/pendapatan/${pendapatan.id_pendapatan}/pengiriman`);
      setDetailPengiriman(response.data.pengiriman || []); // Simpan detail pengiriman ke state
    } catch (error) {
      console.error("Error fetching detail pengiriman:", error);
      setError(error.response?.data?.message || "Gagal memuat detail pengiriman.");
    } finally {
      setLoading(false);
    }
  };
  

  
  const closeModal = () => {
    setSelectedPendapatan(null);
    setDetailPengiriman([]);
  };

  const getFilteredPenjahit = async (selectedId, page = 1) => {
    try {
        const response = await API.get(`/pendapatan`, {
            params: { penjahit: selectedId, page: page }
        });

        console.log("Filtered Data:", response.data); // Debugging

        setPendapatans(Array.isArray(response.data.data) ? response.data.data : []);
        setLastPage(response.data.last_page);
    } catch (error) {
        console.error("Error fetching data:", error);

        // Tampilkan pesan error jika ada respons dari backend
        const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat mengambil data hutang.";
        alert(errorMessage);
    }
};
const handleDownload = async (idPendapatan) => {
  try {
    const response = await API.get(`/pendapatan/${idPendapatan}/download-nota`, {
      responseType: "blob", // Pastikan menerima file sebagai blob
    });

    // Buat URL blob dari response data
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", `nota_pendapatan_${idPendapatan}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Hapus URL blob setelah selesai
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading file:", error);
    alert(error.response?.data?.message || "Gagal mengunduh nota.");
  }
};
  
  
  
  return (
    <div>
      <div className="penjahit-container">
        <h1>Daftar Pendapatan</h1>
       
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
              <th>ID</th>
              <th>Nama Penjahit</th>
              <th>Periode Awal</th>
              <th>Periode Akhir</th>
              <th>Total Pendapatan</th>
              <th>Total Transfer</th>
              <th>Aksi</th>
              <th>DOWNLOAD</th>
            </tr>
          </thead>
          <tbody>
            {pendapatans
              .filter((pendapatan) =>
                pendapatan.id_penjahit?.toString().toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((pendapatan) => (
                <tr key={pendapatan.id_penjahit}>
                  <td data-label="Id Pendapatan : ">{pendapatan.id_pendapatan}</td>
                   <td data-label="Penjahit : ">
                    {
                      penjahitList.find(penjahit => penjahit.id_penjahit === pendapatan.id_penjahit)?.nama_penjahit || 'Tidak Diketahui'
                    }
                  </td>
                  <td data-label="Periode Awal : ">{formatTanggal(pendapatan.periode_awal)}</td>
                  <td data-label="Periode Akhir : ">{formatTanggal(pendapatan.periode_akhir)}</td>
                  <td data-label="Total Pendapatan : ">{pendapatan.total_pendapatan}</td>
                
                  <td data-label="Total Transfer : ">{pendapatan.total_transfer}</td>
                  <td data-label=" ">
                  <div className="action-card">
                    <button 
                      className="btn1-icon" 
                      onClick={() => handleDetailClick(pendapatan)}
                      >
                      <FaInfoCircle className="icon" />
                     </button>   
                     
                  </div>
                     </td> 
                  <td  data-label=" ">
                    <div className="action-card">
                     <button
                      onClick={() => handleDownload(pendapatan.id_pendapatan)}
                      className="btn1-icon3" 
                      >
                            <FaSave className="icon" />

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


      {/* Section untuk detail pengiriman */}
 {/* Modal Section */}
 {selectedPendapatan && (
       <div
       className={`modal-pendapatan ${selectedPendapatan ? "show" : ""}`}
       onClick={closeModal}
     >
       <div
         className="modal-pendapatan-content"
         onClick={(e) => e.stopPropagation()} // Mencegah modal menutup jika area konten di-klik
       >
         <button className="modal-pendapatan-close" onClick={closeModal}>
           &times;
         </button>
         <h2>Detail Pendapatan  {selectedPendapatan.id_pendapatan}</h2>
         
        <p><strong>Total Claim :</strong> <span>Rp {selectedPendapatan.total_claim}</span></p>
        <p><strong>Total Refund Claim :</strong> <span>Rp {selectedPendapatan.total_refund_claim}</span></p>
        <p><strong>Total Cashbon :</strong> <span>Rp {selectedPendapatan.total_cashbon}</span></p>
        <p><strong>Total Hutang :</strong> <span>Rp {selectedPendapatan.total_hutang}</span></p>
        <p><strong>Handtag :</strong> <span>Rp. {selectedPendapatan.handtag}</span></p>
        <p><strong>Transportasi :</strong> <span>Rp. {selectedPendapatan.transportasi}</span></p>
        <br></br>
        <h2
>Detail Pengiriman untuk Pendapatan ID: {selectedPendapatan.id_pendapatan}</h2>
         
         {loading && <p>Memuat detail...</p>}
         {error && <p className="error">{error}</p>}
         {!loading && !error && (
           <table className="penjahit-table">
             <thead>
               <tr>
                 <th>ID Pengiriman</th>
                 <th>Tanggal Pengiriman</th>
                 <th>Total Pengiriman</th>
                 <th>Gaji </th>
                 <th>Claim</th>
                 <th>Refund Claim</th>
               </tr>
             </thead>
             <tbody>
               {detailPengiriman.map((pengiriman) => (
                 <tr key={pengiriman.id_pengiriman}>
                   <td data-label="ID Kirim">{pengiriman.id_pengiriman}</td>
                   <td data-label="tanggal Kirim">{pengiriman.tanggal_pengiriman}</td>
                   <td data-label="Total Kirim">{pengiriman.total_barang_dikirim}</td>
                   <td data-label="Gaji">{pengiriman.total_bayar}</td>
                   <td data-label="Claim">{pengiriman.claim}</td>
                   <td data-label="Refund Claim">{pengiriman.refund_claim}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}
       </div>
     </div>

      )}

      {showForm && (
        <div className="modal">
            <div className="modal-content">
            <h2>Tambah Data Pendapatan</h2>
          <form onSubmit={handleFormSubmit} className="modern-form">
          <div className="form-group">
          <label>ID Penjahit:</label>
          <select
            value={newPendapatan.id_penjahit}
            onChange={(e) =>
              setNewPendapatan({ ...newPendapatan, id_penjahit: e.target.value })
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
            <label>Periode Awal:</label>
            <input
              type="date"
              value={newPendapatan.periode_awal}
              onChange={(e) =>
                setNewPendapatan({ ...newPendapatan, periode_awal: e.target.value })
              }
              required
            />
            </div>

            <div className="form-group">
            <label>Periode Akhir:</label>
            <input
              type="date"
              value={newPendapatan.periode_akhir}
              onChange={(e) =>
                setNewPendapatan({ ...newPendapatan, periode_akhir: e.target.value })
              }
              required
            />
            </div>
            <button 
            type="button" 
            className="btn btn-load-warna" 
            onClick={handleLoadData}>
              Load
            </button>
            <div className="form-group">
            <label>Total Pendapatan: </label>
            <input 
                type="number"
                value= {newPendapatan.total_pendapatan}
                readOnly
             />
            </div>
            <div className="form-group">
            <label>Total Claim: </label>
            <input 
                type="number"
                value= {newPendapatan.total_claim}
                readOnly
            />
            </div>
            <div className="form-group">
            <label>Total Refund Claim: </label>
            <input 
                type="number"
                value= {newPendapatan.total_refund_claim}
                readOnly
            />
            </div>

            <div className="form-group">
            <label>Total Cashbon: </label>
            <input 
                type="number"
                value= {newPendapatan.total_cashbon}
                readOnly
             />    
            </div>
            <div classname="form-group">
            <label>Total Hutang:</label>
            <input 
                type="number"
                value={newPendapatan.total_hutang}
                readOnly
            />
            </div>
            <label>Handtag:</label>
            <input
              type="number"
              value={newPendapatan.handtag}
              onChange={(e) =>
                setNewPendapatan({ ...newPendapatan, handtag: parseFloat(e.target.value) || 0 })
              }
            />
            <label>Transportasi:</label>
            <input
              type="number"
              value={newPendapatan.transportasi}
              onChange={(e) =>
                setNewPendapatan({ ...newPendapatan, transportasi: parseFloat(e.target.value) || 0 })
              }
            />
             <div className="form-group">
            <label>Total Transfer:</label>
            <input
              type="number"
              value= {newPendapatan.total_transfer}
              readOnly
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
    
    </div>
    </div>
  );
};

export default Pendapatan;
