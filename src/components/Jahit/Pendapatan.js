import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaRegEye, FaClock,FaInfoCircle,FaClipboard , FaList,FaMoneyBillWave  } from 'react-icons/fa';
import "./Penjahit";
import axios from "axios";

const Pendapatan = () => {
  const [pendapatans, setPendapatans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedPendapatan, setSelectedPendapatan] = useState(null);
  const [detailPengiriman, setDetailPengiriman] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [penjahitList, setPenjahitList] = useState([]); // State untuk menyimpan data penjahit
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
    fetch("http://localhost:8000/api/pendapatan")
      .then((response) => response.json())
      .then((data) => setPendapatans(data.data || []))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  
useEffect(() => {
  const fetchPenjahit = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/penjahit'); // URL API penjahit
      if (!response.ok) {
        throw new Error('Gagal mengambil data penjahit');
      }
      const data = await response.json();
      setPenjahitList(data); // Asumsikan `data` berisi array penjahit
    } catch (error) {
      console.error('Error:', error.message);
      setError(error.message);
    }
  };

  fetchPenjahit();
}, []);


  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:8000/api/pendapatan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPendapatan),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Pendapatan berhasil disimpan.") {
          setPendapatans([...pendapatans, data.data]);
          setShowForm(false);
          resetForm();
        } else {
          console.error("Error adding data:", data);
        }
      })
      .catch((error) => console.error("Error adding data:", error));
  };

  const handleLoadData = () => {
    const { id_penjahit, periode_awal, periode_akhir } = newPendapatan;
    fetch("http://localhost:8000/api/pendapatan/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_penjahit, periode_awal, periode_akhir }),
    })
      .then((response) => response.json())
      .then((data) => {
        setNewPendapatan((prev) => ({
          ...prev,
          total_pendapatan: data.total_pendapatan || 0,
          total_claim: data.total_claim || 0,
          total_refund_claim: data.total_refund_claim || 0,
          total_cashbon: data.total_cashbon || 0,
          total_hutang: data.total_hutang || 0,
          total_transfer: calculateTotalTransfer(data),
        }));
      })
      .catch((error) => console.error("Error loading data:", error));
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
      const response = await axios.get(
        `http://localhost:8000/api/pendapatan/${pendapatan.id_pendapatan}/pengiriman`
      );
      setDetailPengiriman(response.data.pengiriman); // Simpan detail pengiriman ke state
    } catch (err) {
      setError("Gagal memuat detail pengiriman.");
    } finally {
      setLoading(false);
    }
  };

  
  const closeModal = () => {
    setSelectedPendapatan(null);
    setDetailPengiriman([]);
  };
  return (
    <div>
      <div className="penjahit-container">
        <h1>Daftar Pendapatan</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Cari ID Penjahit..."
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
              <th>ID Penjahit</th>
              <th>Periode Awal</th>
              <th>Periode Akhir</th>
              <th>Total Pendapatan</th>
              <th>Total Claim</th>
              <th>Total Refund Claim</th>
              <th>Cashbon</th>
              <th>Hutang</th>
              <th>Handtag</th>
              <th>Transportasi</th>
              <th>Total Transfer</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pendapatans
              .filter((pendapatan) =>
                pendapatan.id_penjahit
                  ?.toString()
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((pendapatan) => (
                <tr key={pendapatan.id_penjahit}>
                  <td>
                    {
                      penjahitList.find(penjahit => penjahit.id_penjahit === pendapatan.id_penjahit)?.nama_penjahit || 'Tidak Diketahui'
                    }
                  </td>
                  <td>{formatTanggal(pendapatan.periode_awal)}</td>
                  <td>{formatTanggal(pendapatan.periode_akhir)}</td>
                  <td>{pendapatan.total_pendapatan}</td>
                  <td>{pendapatan.total_claim}</td>
                  <td>{pendapatan.total_refund_claim}</td>
                  <td>{pendapatan.total_cashbon}</td>
                  <td>{pendapatan.total_hutang}</td>
                  <td>{pendapatan.handtag}</td>
                  <td>{pendapatan.transportasi}</td>
                  <td>{pendapatan.total_transfer}</td>
                  <td>
                    
                  <div className="form-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => handleDetailClick(pendapatan)}
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
         <h2>Detail Pengiriman untuk Pendapatan ID: {selectedPendapatan.id_pendapatan}</h2>
         {loading && <p>Memuat detail...</p>}
         {error && <p className="error">{error}</p>}
         {!loading && !error && (
           <table className="table-pendapatan">
             <thead>
               <tr>
                 <th>ID Pengiriman</th>
                 <th>Tanggal Pengiriman</th>
                 <th>Total Bayar</th>
                 <th>Claim</th>
                 <th>Refund Claim</th>
               </tr>
             </thead>
             <tbody>
               {detailPengiriman.map((pengiriman) => (
                 <tr key={pengiriman.id_pengiriman}>
                   <td>{pengiriman.id_pengiriman}</td>
                   <td>{pengiriman.tanggal_pengiriman}</td>
                   <td>{pengiriman.total_bayar}</td>
                   <td>{pengiriman.claim}</td>
                   <td>{pengiriman.refund_claim}</td>
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
  );
};

export default Pendapatan;
