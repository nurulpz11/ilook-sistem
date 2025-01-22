import React, { useEffect, useState } from "react";
import "./Penjahit.css";
import { FaPlus, FaTrash, FaSave, FaTimes, FaRegEye, FaEdit, FaClock,FaInfoCircle,FaClipboard , FaList,  } from 'react-icons/fa';

const Pengiriman = () => {
    const [pengirimans, setPengirimans] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
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
        fetch("http://localhost:8000/api/pengiriman")
            .then((response) => response.json())
            .then((data) => {
                console.log("Data pengiriman:", data);
            const sortedData = data.data.sort((a, b) => a.id_spk - b.id_spk);
            setPengirimans(sortedData); 
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    // Filter data berdasarkan pencarian
    const filteredPengirimans = pengirimans
    .filter((pengiriman) =>
        pengiriman.id_spk.toString().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.id_spk - b.id_spk); // Urutkan dari kecil ke besar


    // Handle submit form
    const handleFormSubmit = (e) => {
        e.preventDefault();
    
        // Validasi frontend
        if (!newPengiriman.tanggal_pengiriman || !newPengiriman.warna.length) {
            alert("Tanggal pengiriman dan warna tidak boleh kosong.");
            return;
        }
    
        // Kirim data ke backend
        fetch("http://localhost:8000/api/pengiriman", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPengiriman),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error); // Tampilkan error dari backend
                } else {
                    setPengirimans([...pengirimans, data.data]); // Tambahkan data baru
                    setShowForm(false); // Tutup modal
                    setNewPengiriman({
                        tanggal_pengiriman: "",
                        warna: [], // Reset array warna
                        total_barang_dikirim: "",
                        sisa_barang: "",
                        total_bayar: "",
                    });
                }
            })
            .catch((error) => {
                console.error("Error adding data:", error);
                alert("Terjadi kesalahan saat menambahkan pengiriman.");
            });
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
            {/* Tabel Pengiriman */}
            <div className="table-container">
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
            </div>

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
                            value={warnaItem.jumlah_dikirim || ""}
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
                                const response = await fetch(`http://localhost:8000/api/spk-cmt/${newPengiriman.id_spk}/warna`);
                                const spkData = await response.json();
                                console.log(spkData); // Periksa apakah warna ada di sini

                                // Pastikan data warna ada dalam spkData.warna
                                if (spkData?.warna && Array.isArray(spkData.warna)) {
                                    const warnaDetails = spkData.warna.map((item) => ({
                                        warna: item.nama_warna,
                                        jumlah_dikirim: 0,
                                    }));
                                    setNewPengiriman({ ...newPengiriman, warna: warnaDetails });
                                } else {
                                    alert("Tidak ada warna ditemukan untuk ID SPK ini.");
                                }
                            } catch (error) {
                                console.error("Error fetching warna:", error);
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
