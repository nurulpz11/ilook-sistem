import React, { useEffect, useState } from "react";
import { FaInfoCircle,  FaTasks, FaChartLine } from 'react-icons/fa';
import "./Penjahit.css";
import { useLocation } from "react-router-dom";
import API from "../../api"; 

const KemampuanCmt = () => {
    const [kemampuanCmt, setKemampuanCmt] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPenjahit, setSelectedPenjahit] = useState(null);
    const [kemampuanDetails, setKemampuanDetails] = useState([]);
   
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalData, setModalData] = useState([]); // Untuk menyimpan data modal
    const [modalType, setModalType] = useState(""); 
    const [showModal, setShowModal] = useState(false);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const filterCategory = queryParams.get("filter");

    useEffect(() => {
        const fetchKemampuanCmt = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token"); 
                if (!token) {
                    setError("Token tidak ditemukan. Silakan login kembali.");
                    setLoading(false);
                    return;
                }

                const response = await fetch("http://localhost:8000/api/kemampuan-cmt", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil data");
                }
                const data = await response.json();
                setKemampuanCmt(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchKemampuanCmt();
    }, []);

    const filteredData = Object.keys(kemampuanCmt).filter((nama) =>
        nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDetailClick = (nama, data) => {
        setSelectedPenjahit(nama);
        setModalData(data.kemampuan_per_minggu);
        setModalType("kemampuan"); // Tandai modal ini untuk kemampuan per minggu
        setShowModal(true);
    };
    
    const handleDetailSpk = (nama, data) => {
        setSelectedPenjahit(nama);
        setModalData(data.spks);
        setModalType("spks"); // Tandai modal ini untuk daftar SPK
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPenjahit(null);
    };
    const getKategoriColor = (kategori) => {
        switch (kategori) {
          case "A":
            return "#A0DCDC"; // Kategori A: hijau
          case "B":
            return "#EAC98D";  // Kategori B: biru
          case "C":
            return "#E4B255"; // Kategori C: oranye
          case "D":
            return "#ED9292";    // Kategori D: merah
          default:
            return "black";  // Default: hitam jika kategori tidak dikenali
        }
        
      };

    return (
        <div>
            <div className="penjahit-container">
                <h1>Kemampuan CMT</h1>
            </div>
            <div className="table-container">
                <div className="filter-header">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Cari nama penjahit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <table className="penjahit-table">
                    <thead>
                        <tr>
                            <th>Nama CMT</th>
                           
                            <th>Rata-rata /Minggu</th>
                            <th>Produk Belum dikirim</th>
                            <th>Total SPK</th>
                            <th>Nilai Kinerja /100</th>
                            <th>Aksi</th>
                          
                          
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((namaPenjahit) => {
                            const data = kemampuanCmt[namaPenjahit];
                            return (
                                <tr key={namaPenjahit}>
                                    <td>{namaPenjahit}</td>     
                                    <td>{data.rata_rata_perminggu}</td>
                                    <td className={
                                data.kategori_sisa_produk === "Overload" ? "text-red" :
                                data.kategori_sisa_produk === "Underload" ? "text-yellow" :
                                "text-green"
                            }>
                                {data.total_sisa_produk}
                            </td>

                                    <td>{data.total_spk}</td>
                                    <td>{data.rata_rata}</td>
                            
                                   
                                    <td>
                                    <div className="action-card">
                                        <button 
                                            className="btn1-icon" 
                                            onClick={() => handleDetailClick(namaPenjahit, data)}>
                                            <FaChartLine className="icon" />
                                        </button>
                                     
                                        <button 
                                            className="btn1-icon" 
                                            onClick={() => handleDetailSpk(namaPenjahit, data)}>
                                            <FaTasks className="icon" />
                                        </button>
                                       </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
    <div className="modal-pengiriman">
        <div className="modal-content-pengiriman">
            <h3>Detail {modalType === "kemampuan" ? "Kemampuan Per Minggu" : "SPKs"} - {selectedPenjahit}</h3>
            
            {modalType === "kemampuan" ? (
                <table>
                    <thead>
                        <tr>
                            <th>Minggu</th>
                            <th>ID SPK</th>
                            <th>Total Barang Dikirim</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modalData.map((item, index) => 
                            item.data.map((subItem, subIndex) => (
                                <tr key={`${index}-${subIndex}`}>
                                    <td>{item.minggu}</td>
                                    <td>{subItem.id_spk}</td>
                                    <td>{subItem.total_barang_dikirim}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID SPK</th>
                            <th>Total Barang Dikirim</th>
                            <th>Waktu Pengerjaan (hari)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modalData.map((spk, index) => (
                            <tr key={index}>
                                <td>{spk.id_spk}</td>
                                <td>{spk.total_barang_dikirim}</td>
                                <td>{spk.waktu_pengerjaan_terakhir}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <button onClick={() => setShowModal(false)}>Tutup</button>
        </div>
    </div>
)}


        </div>
    );
};

export default KemampuanCmt;