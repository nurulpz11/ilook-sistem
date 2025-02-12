import React, { useEffect, useState } from "react";
import "./Pengiriman.css";
import API from "../../api"; 
import { FaPlus, FaTrash, FaSave, FaTimes, FaRegEye, FaEdit, FaClock,FaInfoCircle,FaClipboard , FaList,  } from 'react-icons/fa';

const Pengiriman = () => {
    const [pengirimans, setPengirimans] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
      const [lastPage, setLastPage] = useState(1);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedPengiriman, setSelectedPengiriman] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [newPengiriman, setNewPengiriman] = useState({
        tanggal_pengiriman: "",
        total_barang_dikirim: "",
        sisa_barang: "",
        total_bayar: "",
        warna: [] // Inisialisasi warna dengan array kosong
    });

    useEffect(() => {
    const fetchPengirimans = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token"); 
            if (!token) {
                setError("Token tidak ditemukan. Silakan login kembali.");
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:8000/api/pengiriman?page=${currentPage}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                }
            });
            
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();

            // Pastikan data tetap terurut sebelum disimpan ke state
            const sortedData = data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setPengirimans(sortedData);
            setLastPage(data.last_page);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    fetchPengirimans();
}, [currentPage]);

      
      
     // Filter data berdasarkan pencarian
     const filteredPengirimans = Array.isArray(pengirimans) 
     ? pengirimans
         .filter((pengiriman) =>
           pengiriman.id_spk.toString().includes(searchTerm.toLowerCase())
         )
         .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Tetap urut dari terbaru
     : [];
   
    
    // Handle submit form
    const handleFormSubmit = async (e) => {
        e.preventDefault();
      
        // Validasi frontend
        if (!newPengiriman.tanggal_pengiriman || !newPengiriman.warna.length) {
          alert("Tanggal pengiriman dan warna tidak boleh kosong.");
          return;
        }
      
        try {
          const response = await API.post("/pengiriman", newPengiriman);
      
          setPengirimans([...pengirimans, response.data.data]); // Tambahkan data baru
          setShowForm(false); // Tutup modal
      
          // Reset form
          setNewPengiriman({
            tanggal_pengiriman: "",
            warna: [],
            total_barang_dikirim: "",
            sisa_barang: "",
            total_bayar: "",
          });
        } catch (error) {
          console.error("Error adding data:", error);
          alert(error.response?.data?.message || "Terjadi kesalahan saat menambahkan pengiriman.");
        }
      };
      
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPengiriman((prev) => ({ ...prev, [name]: value }));
    };

    const formatTanggal = (tanggal) => {
        const date = new Date(tanggal);
        return new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date);
      };

      const handleDetailClick = (pengiriman) => {
        setSelectedPengiriman(pengiriman); // Simpan detail SPK yang dipilih
        setShowPopup(true);  // Tampilkan pop-up
      };
      const closePopup = () => {
        setShowPopup(false); // Sembunyikan pop-up
        setSelectedPengiriman(null); // Reset data SPK
      };
      
    return (
        <div>
            <div className="penjahit-container">
        <h1>Daftar Pengiriman</h1>
      </div>
            <div className="table-container">
                <div className="filter-header">
                <button 
                onClick={() => setShowForm(true)}>
                    Tambah 
                </button>
                <div className="search-bar">
                <input
                    type="text"
                    placeholder="Cari id spk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
            </div>
                <table className="penjahit-table">
                    <thead>
                        <tr>
                           
                            <th>ID SPK</th>
                            <th>NAMA CMT</th>
                            <th>Tanggal Pengiriman</th>
                            <th>Total Barang Dikirim</th>
                            <th>Sisa Barang</th>
                            <th>Total Bayar</th>
                          
                            <th>AKSI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPengirimans.map((pengiriman) => (
                            <tr key={pengiriman.id_pengiriman}>
                                
                                <td>{pengiriman.id_spk}</td>
                                <td>{pengiriman.nama_penjahit}</td>
                                <td>{formatTanggal(pengiriman.tanggal_pengiriman)}</td>
                                
                                <td>{pengiriman.total_barang_dikirim}</td>
                                <td style={{ color: pengiriman.sisa_barang > 0 ? 'red' : 'black'}}>
                                    {pengiriman.sisa_barang}
                                </td>

                                <td>{pengiriman.total_bayar}</td>
                              
                                
                                <td>
                                <div className="action-card">
                                <button 
                                    className="btn1-icon" 
                                    onClick={() => handleDetailClick(pengiriman)}
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


 {/* Pop-Up Card */}
 {showPopup && selectedPengiriman && (
  <div className="popup-overlay">
      <div className="popup-card">
      <div className="popup-header">
        <h2>Detail Pengiriman</h2>
        <button className="btn-close" onClick={closePopup}>
          &times;
        </button>
      </div>
            <div className="popup-content">
            {selectedPengiriman ? (
                <div className="popup-details">
                    <table>
                        <thead>
                            <tr>
                                
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span>ID SPK:</span></td>
                                <td>{selectedPengiriman.id_spk}</td>
                            </tr>
                            <tr>
                                <td><span>Tanggal Pengiriman:</span></td>
                                <td>{selectedPengiriman.tanggal_pengiriman}</td>
                            </tr>
                            <tr>
                                <td><span>Total Barang:</span></td>
                                <td>{selectedPengiriman.total_barang_dikirim}</td>
                            </tr>
                            <tr>
                                <td><span>Sisa Barang:</span></td>
                                <td>{selectedPengiriman.sisa_barang}</td>
                            </tr>
                            <tr>
                                <td><span>Total Bayar:</span></td>
                                <td>{selectedPengiriman.total_bayar}</td>
                            </tr>
                            <tr>
                                <td><span>Detail warna dikirim:</span></td>
                                <td>{selectedPengiriman.warna.map((warnaDetail) => (
                                        <div key={warnaDetail.id_pengiriman_warna}>
                                            {warnaDetail.warna}: {warnaDetail.jumlah_dikirim} pcs
                                        </div>
                                    ))}</td>
                            </tr>
                            <tr>
                                <td><span>Detail sisa warna:</span></td>
                                <td>{selectedPengiriman.warna.map((warnaDetail) => (
                                        <div key={warnaDetail.id_pengiriman_warna}>
                                            {warnaDetail.warna}: {warnaDetail.sisa_barang_per_warna} pcs
                                        </div>
                                    ))}</td>
                            </tr>
                            <tr>
                                <td><span>Total Claim:</span></td>
                                <td>{selectedPengiriman.claim}</td>
                            </tr>
                            <tr>
                                <td><span>Total Refund Claim:</span></td>
                                <td>{selectedPengiriman.refund_claim}</td>
                            </tr>
                        </tbody>
                    </table>

                    
                </div>
            ) : (
                <p>Loading...</p> // Menampilkan loading atau pesan saat data belum ada
            )}
        </div>
        </div>
</div>
)}




            {/* Modal Form */}
            {showForm && (
            <div className="modal">
                <div className="modal-content">
                <h2>Tambah Data Pengiriman</h2>
                <form onSubmit={handleFormSubmit} className="modern-form">
                    {/* Input ID SPK */}
                    <div className="form-group">
                    <label>ID SPK</label>
                    <input
                        type="number"
                        value={newPengiriman.id_spk || ""}
                        onChange={(e) => setNewPengiriman({ ...newPengiriman, id_spk: e.target.value })}
                        required
                    />
                    </div>
                    
                    <div className="form-group">
                    <label>Tanggal SPK</label>
                    <input
                        type="date"
                        name="tanggal_pengiriman"
                        value={newPengiriman.tanggal_pengiriman}
                        onChange={handleInputChange}
                        required
                    />
                    </div>
                    {/* Warna dan Jumlah Dikirim */}
                    {newPengiriman.warna && newPengiriman.warna.map((warnaItem, index) => (
                    <div key={index} className="form-group">
                        <label>
                            {`Warna: ${warnaItem.warna}`} {/* Ubah warna menjadi nama_warna */}
                        </label>
                        <input
                            type="number"
                            value={warnaItem.jumlah_dikirim !== undefined ? warnaItem.jumlah_dikirim : ""} // Tampilkan kosong jika undefined
                            onChange={(e) => {
                                const updatedWarna = [...newPengiriman.warna];
                                updatedWarna[index].jumlah_dikirim = parseInt(e.target.value, 10) || 0;
                                setNewPengiriman({ ...newPengiriman, warna: updatedWarna });
                            }}
                            placeholder={`Jumlah untuk ${warnaItem.warna}`} 
                            required
                        />
                    </div>
))}


                 
                    {/* Tombol untuk Memuat Data Warna Berdasarkan ID SPK */}
                    <button
                        type="button"
                        className="btn btn-load-warna"
                        onClick={async () => {
                            try {
                                const response = await API.get(`/spk-cmt/${newPengiriman.id_spk}/warna`);
                                console.log("Response API:", response); // Debugging API Response
                        
                                if (response.data?.warna && Array.isArray(response.data.warna)) {
                                    const warnaDetails = response.data.warna.map((item) => ({
                                        warna: item.nama_warna,
                                        jumlah_dikirim: 0,
                                    }));
                                    setNewPengiriman({ ...newPengiriman, warna: warnaDetails });
                                    console.log("Warna Loaded:", warnaDetails); // Debugging hasil mapping warna
                                } else {
                                    alert("Tidak ada warna ditemukan untuk ID SPK ini.");
                                }
                            } catch (error) {
                                console.error("Error fetching warna:", error);
                                alert("Gagal memuat warna. Periksa koneksi dan coba lagi.");
                            }
                        }}
                        
                    >
                        Load Warna
                    </button>



                    {/* Kalkulasi Total Barang */}
                    <div className="form-group">
                    <label>Total Barang</label>
                    <input
                        type="number"
                        value={newPengiriman.warna?.reduce((total, item) => total + (item.jumlah_dikirim || 0), 0) || 0}
                        readOnly
                    />
                    </div>

                    <div className="form-group">
                    <label>Total Bayar</label>
                    <input
                        type="number"
                       
                        readOnly
                    />
                    </div>


                    {/* Aksi */}
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
    );
};

export default Pengiriman;
