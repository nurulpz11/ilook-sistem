import React, { useEffect, useState } from "react";
import "./Penjahit.css";
import API from "../../api"; 
import {FaInfoCircle, FaPlus, FaEdit, FaClock } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import { QRCodeSVG } from 'qrcode.react';


const PesananPetugasC = () => {
    const [petugasC, setPetugasC] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showForm, setShowForm] = useState(false);  // Form untuk tambah pesanan
    const [showFormPetugasD, setShowFormPetugasD] = useState(false);  // Form untuk verifikasi Petugas D    
    const [selectedPesanan, setSelectedPesanan] = useState(null);
    const [penjahitList, setPenjahitList] = useState([]);
    const [aksesorisList, setAksesorisList] = useState([]);
     const [verifikasiList, setVerifikasiList] = useState([]);

    const [newData, setNewData] = useState({
      penjahit_id: "",
      detail_pesanan: [], // array of { aksesoris_id, jumlah_dipesan }
    });
  const [newDataPetugasD, setNewDataPetugasD] = useState({
      petugas_c_id: "",
      barcode: [], // array berisi string barcode
    });

    const [barcodeInput, setBarcodeInput] = useState("");

useEffect(() => {
    const fetchPetugasC = async () => {
        try {
            setLoading(true);
            const response = await API.get('/petugas-c');
            setPetugasC(response.data);
        }catch (error){
            setError("Gagal mengambil data");
        }finally{
            setLoading(false);
        }
    }
    fetchPetugasC();
}, []);

const handleOpenModal = (item) => {
  setSelectedPesanan(item);
  setShowModal(true);
};

const handleCloseModal = () => {
  setShowModal(false);
  setSelectedPesanan(null);
};


const handleFormSubmit = async (e) => {
  e.preventDefault();

  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("User tidak ditemukan. Silakan login ulang.");
    return;
  }

  // Buat payload untuk dikirim ke backend
  const payload = {
    user_id: userId,
    penjahit_id: newData.penjahit_id,
    detail_pesanan: newData.detail_pesanan, // array of { aksesoris_id, jumlah_dipesan }
  };
  
  console.log("Payload yang dikirim:", payload);
  try {
    const response = await API.post("/petugas-c", payload);

    console.log("Pesanan berhasil disimpan:", response.data);
    alert("Pesanan berhasil disimpan!");

    // Tambahkan ke list atau refresh data
    setPetugasC((prev) => [...prev, response.data]);

    // Reset form
    setNewData({
      penjahit_id: "",
      detail_pesanan: [],
    });

    // Tutup form/modal
    setShowForm(false);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    alert(error.response?.data?.error || "Gagal menyimpan pesanan.");
  }
};



useEffect(() => {
  // Fetch data penjahit
  const fetchPenjahitList = async () => {
    try {
      const response = await API.get("/penjahit"); // Sesuaikan dengan endpoint API penjahit
      setPenjahitList(response.data);
    } catch (error) {
      console.error("Error fetching penjahit list:", error);
    }
  };

  // Fetch data aksesoris
  const fetchAksesorisList = async () => {
    try {
      const response = await API.get("/aksesoris"); // Sesuaikan dengan endpoint API aksesoris
      setAksesorisList(response.data);
    } catch (error) {
      console.error("Error fetching aksesoris list:", error);
    }
  };

  fetchPenjahitList();
  fetchAksesorisList();
}, []); // Hanya jalankan sekali ketika komponen di-render



// Fungsi untuk menangani perubahan input
const handleInputChange = (e) => {
  const { name, value } = e.target;

  // Menangani perubahan input untuk form utama (penjahit_id, jumlah, harga_satuan, dll)
  if (name !== "detail_pesanan") {
    setNewData({
      ...newData,
      [name]: value,
    });
  }
};

// Fungsi untuk menangani perubahan dalam detail pesanan (aksesoris_id, jumlah_dipesan)
const handleDetailChange = (index, field, value) => {
  const updatedDetails = [...newData.detail_pesanan];
  updatedDetails[index][field] = value;
  setNewData({
    ...newData,
    detail_pesanan: updatedDetails,
  });
};
const handleRemoveDetail = (index) => {
  const updatedDetails = newData.detail_pesanan.filter((_, i) => i !== index);
  setNewData({ ...newData, detail_pesanan: updatedDetails });
};
const handleAddDetail = () => {
  setNewData({
    ...newData,
    detail_pesanan: [
      ...newData.detail_pesanan,
      { aksesoris_id: "", jumlah_dipesan: "" },
    ],
  });
};


const handlePetugasDFormSubmit = async (e) => {
  e.preventDefault();

  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("User tidak ditemukan. Silakan login ulang.");
    return;
  }

  // Cek apakah jumlah barcode sesuai
  if (newDataPetugasD.barcode.length !== selectedPesanan.jumlah_dipesan) {
    alert(`Jumlah barcode harus sama dengan ${selectedPesanan.jumlah_dipesan}`);
    return;
  }

  const payload = {
    user_id: userId,
    petugas_c_id: selectedPesanan.id,
    barcode: newDataPetugasD.barcode,
  };

  try {
    const response = await API.post("/verifikasi-aksesoris", payload);

    console.log("Verifikasi berhasil disimpan:", response.data);
    alert("Verifikasi berhasil disimpan!");

    setVerifikasiList((prev) => [...prev, response.data]);
    setNewDataPetugasD({ barcode: [] });
    setShowFormPetugasD(false);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    alert(error.response?.data?.error || "Gagal menyimpan verifikasi.");
  }
};


const handleOpenPetugasDForm = (petugasC) => {
  if (petugasC.status === 'pending') {
    setSelectedPesanan(petugasC);
    setShowFormPetugasD(false);  // Menyembunyikan form Petugas C
    setShowFormPetugasD(true);   // Menampilkan form Petugas D
  }
};
const handleBarcodeChange = (e) => {
  setBarcodeInput(e.target.value); // hanya update input sementara
};


const addBarcode = () => {
  const trimmedBarcode = barcodeInput.trim();
  if (trimmedBarcode && !newDataPetugasD.barcode.includes(trimmedBarcode)) {
    setNewDataPetugasD((prev) => ({
      ...prev,
      barcode: [...prev.barcode, trimmedBarcode],
    }));
    setBarcodeInput(""); // reset input setelah ditambahkan
  }
};



  return (
    <div>
    <div className="penjahit-container">
      <h1>Data Aksesoris</h1>
    </div>

    <div className="table-container">
         <div className="filter-header1">
           <button 
           onClick={() => setShowForm(true)}>
             Tambah
           </button>
       
        <div className="search-bar1">
          <input
            type="text"
            placeholder="Cari nama aksesoris..."
           
          />
        </div>
      </div>
      
        <div className="table-container">
        <table className="penjahit-table">
          <thead>
            <tr>
              <th>id</th>
              <th>Nama Petugas </th>
              <th>penjahit</th>
              <th>Banyak Produk</th>
              <th>Waktu</th>
              <th>Status</th>
             <th> Pesanan</th>
            

            </tr>
          </thead>
          <tbody>
            {petugasC.map((petugasC) => (
              <tr key={petugasC.id}>
                <td data-label="ID: ">{petugasC.id}</td>
                <td data-label="User : ">{petugasC.user?.name || 'Tidak Diketahui'}</td>
                <td data-label="Penjahit  : ">{petugasC.penjahit?.nama_penjahit || 'Tidak Diketahui'}</td>
                <td data-label="Banyak : ">{petugasC.jumlah_jenis_aksesoris}</td>
                <td data-label="Waktu:">
                  {new Date(petugasC.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  {new Date(petugasC.created_at).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>


                <td data-label="Status:">
                  {petugasC.status === "pending" ? (
                    <button
                      className="link-button green"
                      onClick={() => handleOpenPetugasDForm(petugasC)}
                    >
                      Verifikasi
                    </button>
                  ) : (
                    <span
                      className={`status-link ${petugasC.status} ${
                        petugasC.status === "pending" ? "underline" : ""
                      }`}
                    >
                      {petugasC.status}
                    </span>
                  )}
                </td>


                <td data-label="Pesanan:">
                  <button className="link-button blue" onClick={() => handleOpenModal(petugasC)}>
                    Detail Pesanan
                  </button>
                </td>


              </tr>
            ))}
          </tbody>
        </table>
        </div>
 </div>




   
 {/* Modal */}
 {showModal && selectedPesanan && (
       <div className="modal-pengiriman">
    <div className="modal-content-pengiriman">
         
            <h3>Detail Pesanan - ID #{selectedPesanan.id}</h3>
            <table>
              <thead>
                <tr>
                  <th>Aksesoris ID</th>
                  <th>Jumlah Dipesan</th>
                </tr>
              </thead>
              <tbody>
                {selectedPesanan.detail_pesanan.map((dp, i) => (
                  <tr key={i}>
                    <td>{dp.aksesoris.nama_aksesoris}</td>
                    <td>{dp.jumlah_dipesan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleCloseModal}>Tutup</button>
          </div>
     </div>
      )}




        {/* Modal Form */}
        {showForm && (
      <div className="modal">
        <div className="modal-content">
          <h2>Tambah Pesanan</h2>
          <form onSubmit={handleFormSubmit} className="modern-form">
            {/* PENJAHIT ID (Dropdown dari daftar penjahit) */}
            <div className="form-group">
          <label>Petugas:</label>
          <input
            type="text"
            value={localStorage.getItem("userId")} // Mengambil user_id dari localStorage
            disabled
          />
        </div>
            <div className="form-group">
              <label>Pilih Penjahit:</label>
              <select
                name="penjahit_id"
                value={newData.penjahit_id}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Pilih Penjahit --</option>
                {penjahitList.map((penjahit) => (
                  <option key={penjahit.id_penjahit} value={penjahit.id_penjahit}>
                    {penjahit.nama_penjahit}
                  </option>
                ))}
              </select>

            </div>

            {/* DETAIL PESANAN */}
            <div className="form-group">
              <label>Detail Pesanan:</label>
              {newData.detail_pesanan.map((item, index) => (
                <div key={index} className="detail-item">
                  <div>
                    {/* Aksesoris ID */}
                    <label>Aksesoris:</label>
                    <select
                      name={`aksesoris_id-${index}`}
                      value={item.aksesoris_id}
                      onChange={(e) =>
                        handleDetailChange(index, "aksesoris_id", e.target.value)
                      }
                      required
                    >
                      <option value="">-- Pilih Aksesoris --</option>
                      {aksesorisList.map((aksesoris) => (
                        <option key={aksesoris.id} value={aksesoris.id}>
                          {aksesoris.nama_aksesoris}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    {/* Jumlah Dipesan */}
                    <label>Jumlah Dipesan:</label>
                    <input
                      type="number"
                      name={`jumlah_dipesan-${index}`}
                      value={item.jumlah_dipesan}
                      onChange={(e) =>
                        handleDetailChange(index, "jumlah_dipesan", e.target.value)
                      }
                      placeholder="Masukkan jumlah"
                      required
                    />
                  </div>

                  {/* Hapus detail pesanan */}
                  <button
                    type="button"
                    onClick={() => handleRemoveDetail(index)}
                    className="btn btn-remove"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              {/* Tambah detail pesanan */}
              <button type="button" onClick={handleAddDetail} className="btn btn-add">
                Tambah Detail Pesanan
              </button>
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


{showFormPetugasD && selectedPesanan && ( 
  <div className="modal">
    <div className="modal-content">
      <h2>Verifikasi Pesanan - Petugas D</h2>
      <form onSubmit={handlePetugasDFormSubmit} className="modern-form">
        <input
          type="hidden"
          name="petugas_c_id"
          value={selectedPesanan.id}
        />
          {/* Petugas (userId dari localStorage) */}
          <div className="form-group">
          <label>Petugas:</label>
          <input
            type="text"
            value={localStorage.getItem("userId")}
            disabled
          />
        </div>

        {/* Barcode (input satuan yang nanti ditambahkan ke array) */}
        <div className="form-group">
          <label>Barcode yang Discan:</label>
          <input
            type="text"
            name="barcode"
            value={barcodeInput}              // <- pakai barcodeInput
            onChange={handleBarcodeChange}
            placeholder="Masukkan Barcode"
          
          />
          <button type="button" onClick={addBarcode}>
            Tambah Barcode
          </button>
        </div>

       {/* Daftar barcode yang sudah dimasukkan */}
<div className="form-group">
  <label>Barcode yang Dimasukkan:</label>
  <ul>
    {newDataPetugasD.barcode.map((barcode, index) => (
      <li key={index}>{barcode}</li>
    ))}
  </ul>

  {/* Info jumlah barcode */}
  {selectedPesanan && (
    <div className="barcode-info">
      <p>
        Total barcode dimasukkan: <strong>{newDataPetugasD.barcode.length}</strong> dari{' '}
        <strong>{selectedPesanan.jumlah_dipesan}</strong>
      </p>
      {newDataPetugasD.barcode.length < selectedPesanan.jumlah_dipesan && (
        <p style={{ color: "orange" }}>
          Masukkan <strong>{selectedPesanan.jumlah_dipesan - newDataPetugasD.barcode.length}</strong> barcode lagi.
        </p>
      )}
    </div>
  )}
</div>

        {/* Tombol aksi */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-submit"
            disabled={newDataPetugasD.barcode.length !== selectedPesanan.jumlah_dipesan}
          >
            Verifikasi
          </button>

          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => setShowFormPetugasD(false)}
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
}

export default PesananPetugasC