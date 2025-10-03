import React, { useEffect, useState } from "react";
import "../Jahit/Penjahit.css";
import API from "../../api"; 
import {FaInfoCircle,FaEye, FaPlus, FaEdit, FaClock } from 'react-icons/fa';


const HppProduk = () => {
  const [produks, setProduks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [showForm, setShowForm] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
   const [selectedStatus, setSelectedStatus] = useState("");
  const [showCustomJenis, setShowCustomJenis] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editKomponenList, setEditKomponenList] = useState([]);
  const [newProduk, setNewProduk] = useState({
    nama_produk: "",
    kategori_produk: "",
    jenis_produk:"",
    gambar_produk: null,
    status_produk: "sementara", 
    harga_jasa_cutting: "",
    harga_jasa_cmt: "",
    harga_jasa_aksesoris: "",
    harga_overhead: "",
    });
  const [editProduk, setEditProduk] = useState({
    id: "",
    nama_produk: "",
    kategori_produk: "",
    jenis_produk: "",
    gambar_produk: null,
    status_produk: "",
    harga_jasa_cutting: "",
    harga_jasa_cmt: "",
    harga_jasa_aksesoris: "",
    harga_overhead: "",
  });
  const [komponenList, setKomponenList] = useState([
  { jenis_komponen: "", 
    nama_bahan: "", 
    harga_bahan: "", 
    jumlah_bahan: "", 
    satuan_bahan: "" }
]);



  useEffect(() => {
    const fetchProduks = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/produk`, {
          params: { 
            kategori_produk: selectedKategori || "",
            status_produk: selectedStatus || "" 
          }, 
            
        });
        setProduks(response.data.data);
      } catch (error) {
        setError("Gagal mengambil data produk.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduks();
  }, [selectedKategori, selectedStatus]);


  const filteredProduk = (produks || []).filter((produk) =>
    !searchTerm || produk?.nama_produk?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  


const handleFormSubmit = async (e) => {
  e.preventDefault(); // Mencegah refresh halaman

  // Buat FormData untuk mengirim data dengan file
  const formData = new FormData();
  formData.append("nama_produk", newProduk.nama_produk);
  formData.append("kategori_produk", newProduk.kategori_produk);
  formData.append("jenis_produk", newProduk.jenis_produk);
  formData.append("harga_jasa_cutting", newProduk.harga_jasa_cutting);
  formData.append("harga_jasa_cmt", newProduk.harga_jasa_cmt);
  formData.append("harga_jasa_aksesoris", newProduk.harga_jasa_aksesoris);
  formData.append("harga_overhead", newProduk.harga_overhead);

  formData.append("status_produk", "sementara");

  if (newProduk.gambar_produk) {
      formData.append("gambar_produk", newProduk.gambar_produk);
  }
  komponenList.forEach((komp, index) => {
    formData.append(`komponen[${index}][jenis_komponen]`, komp.jenis_komponen);
    formData.append(`komponen[${index}][nama_bahan]`, komp.nama_bahan);
    formData.append(`komponen[${index}][harga_bahan]`, komp.harga_bahan);
    formData.append(`komponen[${index}][jumlah_bahan]`, komp.jumlah_bahan);
    formData.append(`komponen[${index}][satuan_bahan]`, komp.satuan_bahan);
  });
  try {
      const response = await API.post("/produk", formData, {
          headers: {
              "Content-Type": "multipart/form-data",
          },
      });

      console.log("Response API:", response);
      console.log("Response Data:", response.data); // Debugging

      alert("Produk berhasil ditambahkan!");
      setProduks((prevProduks) => [...prevProduks, response.data]); 
      setShowForm(false); // Tutup modal

      // Reset form input
      setNewProduk({
          nama_produk: "",
          kategori_produk: "",
          jenis_produk: "",
          gambar_produk: null,
          status_produk: "Sementara",
          harga_jasa_cutting: "",
          harga_jasa_cmt: "",
          harga_jasa_aksesoris: "",
          harga_overhead: "",
        });
        setKomponenList([{ jenis_komponen: "", nama_bahan: "", harga_bahan: "", jumlah_bahan: "", satuan_bahan: "" }]);
        setShowForm(false);

      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan produk.");
      }
  };

const handleFormUpdate = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("nama_produk", editProduk.nama_produk);
  formData.append("kategori_produk", editProduk.kategori_produk);
  formData.append("jenis_produk", editProduk.jenis_produk);
  formData.append("harga_jasa_cutting", editProduk.harga_jasa_cutting || 0);
  formData.append("harga_jasa_cmt", editProduk.harga_jasa_cmt || 0);
  formData.append("harga_jasa_aksesoris", editProduk.harga_jasa_aksesoris || 0);
  formData.append("harga_overhead", editProduk.harga_overhead || 0);


  formData.append("status_produk", editProduk.status_produk);
  // gambar (kalau ada yang baru dipilih)
  if (editProduk.gambar_produk instanceof File) {
    formData.append("gambar_produk", editProduk.gambar_produk);
  }

  // komponen (serialisasi array)
  editKomponenList.forEach((komp, index) => {
    formData.append(`komponen[${index}][jenis_komponen]`, komp.jenis_komponen);
    formData.append(`komponen[${index}][nama_bahan]`, komp.nama_bahan);
    formData.append(`komponen[${index}][harga_bahan]`, komp.harga_bahan);
    formData.append(`komponen[${index}][jumlah_bahan]`, komp.jumlah_bahan);
    formData.append(`komponen[${index}][satuan_bahan]`, komp.satuan_bahan);
  });

  formData.append("_method", "PUT");

  try {
    const response = await API.post(`/produk/${editProduk.id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Produk berhasil diperbarui!");
    setProduks(prev =>
      prev.map(p => (p.id === editProduk.id ? response.data : p))
    );
    setShowEditForm(false);
  } catch (error) {
    console.error("Update error:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Terjadi kesalahan saat update produk.");
  }
};


const handleKomponenChange = (index, field, value) => {
  const updatedKomponen = [...komponenList];
  updatedKomponen[index][field] = value;
  setKomponenList(updatedKomponen);
};

const addKomponen = () => {
  setKomponenList([...komponenList, { jenis_komponen: "", nama_bahan: "", harga_bahan: "", jumlah_bahan: "", satuan_bahan: "" }]);
};

const removeKomponen = (index) => {
  const updatedKomponen = [...komponenList];
  updatedKomponen.splice(index, 1);
  setKomponenList(updatedKomponen);
};



const handleFileChange = (e) => {
  const file = e.target.files[0];

  if (showEditForm) {
    setEditProduk((prev) => ({
      ...prev,
      gambar_produk: file,
    }));
  } else {
    setNewProduk((prev) => ({
      ...prev,
      gambar_produk: file,
    }));
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // Jika untuk newProduk
    setNewProduk((prev) => ({
      ...prev,
      [name]: value, // Menggunakan name dari input untuk mengubah state
    }));
  
    // Jika untuk editProduk
    setEditProduk((prev) => ({
      ...prev,
      [name]: value, 
    }));
  };
  

  const handleEditClick = (produk) => {
    console.log("Produk yang dipilih untuk diedit:", produk);  // Tambahkan log untuk memastikan data yang dikirim
   
    setEditProduk({
        id: produk.id,
        nama_produk: produk.nama_produk,
        kategori_produk: produk.kategori_produk,
        jenis_produk: produk.jenis_produk,
        status_produk: produk.status_produk ?? "", 
        gambar_produk: produk.gambar_produk,  harga_jasa_cutting: produk.harga_jasa_cutting || "",
        harga_jasa_cmt: produk.harga_jasa_cmt || "",
        harga_jasa_aksesoris: produk.harga_jasa_aksesoris || "",
        harga_overhead: produk.harga_overhead || "",
      });
  setEditKomponenList(produk.komponen || []);
  setShowEditForm(true);
};

const handleCancelEdit = () => {
  setShowEditForm(false);
};
const handleJenisChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomJenis(true);
      // kosongkan dulu biar input manual ambil alih
      setNewProduk(prev => ({ ...prev, jenis_produk: '' }));
    } else {
      setShowCustomJenis(false);
      setNewProduk(prev => ({ 
        ...prev, 
        jenis_produk: value,
      nama_produk:prev.nama_produk?.startsWith(prev.jenis_produk) ? value + " " : value + "" }));
    }
  };
const handleEditKomponenChange = (index, field, value) => {
  setEditKomponenList(prev => {
    const updated = [...prev];
    updated[index][field] = value;
    return updated;
  });
};

const addEditKomponen = () => {
  setEditKomponenList(prev => [
    ...prev,
    { jenis_komponen: "", nama_bahan: "", harga_bahan: "", jumlah_bahan: "", satuan_bahan: "" }
  ]);
};

const removeEditKomponen = (index) => {
  setEditKomponenList(prev => prev.filter((_, i) => i !== index));
};

  const handleDetailClick = (produk) => {
    setSelectedProduk(produk);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduk(null);
  };

  return (
    <div>
    <div className="penjahit-container">
      <h1>Data Produk</h1>
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
            placeholder="Cari nama produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>
      <label htmlFor="statusFilter" className="filter-label"></label>
          <select value={selectedKategori} onChange={(e) => setSelectedKategori(e.target.value)}  className="filter-select1" >

            <option value="" >All Status Produk</option>
            <option value="Urgent">Urgent</option>
            <option value="Normal">Normal</option>
          
          </select>
      <label htmlFor="statusFilter" className="filter-label"></label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="filter-select1"
        >
          <option value="">All Status Hpp</option>
          <option value="sementara">Sementara</option>
          <option value="fix">Fix</option>
          <option value="bermasalah">Bermasalah</option>
        </select>

      </div>
      
        <div className="table-container">
        <table className="penjahit-table">
          <thead>
            <tr>
              <th>ID Produk</th>
              <th>Nama Produk</th>
              <th>Gambar Produk </th>
              <th>Kategori Produk</th> 
              <th>Status Produk</th>
              <th>Status HPP</th>
              <th>HPP</th>
              <th>Aksi</th>
              <th>Detail</th>

            </tr>
          </thead>
          <tbody>
            {filteredProduk.map((produk) => (
              <tr key={produk.id_produk}>
                <td data-label="Id Produk : ">{produk.id}</td>
                <td data-label="Nama Produk : ">{produk.nama_produk}</td>

                 <td data-label="Gambar Produk">
                <img src={produk.gambar_produk} alt="Gambar Produk" />
              </td>
                <td data-label="Jenis Produk : ">{produk.jenis_produk}</td>
                <td data-label="Kategori : ">
                    {produk.kategori_produk === 'Urgent' ? (
                      <button   className="status-link dibatalkan" disabled>
                       Urgent
                      </button>
                    ) : (
                      <button   className="status-link selesai" disabled >
                       Normal
                      </button>
                    )}
                  </td>
             
               <td data-label="Status : ">
                {produk.status_produk === 'Sementara' ? (
                  <button className="status-link sementara" disabled>
                    Sementara
                  </button>
                ) : produk.status_produk === 'Fix' ? (
                  <button className="status-link fix" disabled>
                    Fix
                  </button>
                ) : produk.status_produk === 'Bermasalah' ? (
                  <button className="status-link bermasalah" disabled>
                    Bermasalah
                  </button>
                ) : (
                  <button className="status-link" disabled>
                    -
                  </button>
                )}
              </td>


              <td data-label="harga jasa : ">Rp. {produk.hpp}</td>

              <td data-label="">
                  <div className="action-card">  
                    <button 
                      className="btn1-icon" 
                      onClick={() =>handleEditClick(produk)}
                      >
                     <FaEdit className="icon" />
                   </button>
                 </div>
            </td>

             <td data-label="Detail">
               <div className="action-card">  
                <button
                  className="btn1-icon"
                  onClick={() => handleDetailClick(produk)}
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
     {/* Modal Form */}
{showForm && (
  <div className="modal">
    <div className="modal-content">
      <h2>Tambah Produk</h2>
      <form onSubmit={handleFormSubmit} className="modern-form">

        {/* Jenis Produk */}
        <div className="form-group">
          <label>Jenis Produk</label>
          <select
            name="jenis_produk"
            value={showCustomJenis ? "custom" : newProduk.jenis_produk}
            onChange={handleJenisChange}
          >
            <option value="">Pilih Jenis Produk</option>
            <option value="Gamis">Gamis</option>
            <option value="Kaos">Kaos</option>
            <option value="Celana">Celana</option>
            <option value="custom">Lainnya...</option>
          </select>

          {showCustomJenis && (
            <input
              type="text"
              name="jenis_produk"
              placeholder="Masukkan jenis produk baru"
              value={newProduk.jenis_produk}
              onChange={handleInputChange}
              className="form-control mt-2"
            />
          )}
        </div>

        {/* Nama Produk */}
        <div className="form-group">
          <label>Nama Produk</label>
          <input
            type="text"
            name="nama_produk"
            value={newProduk.nama_produk}
            onChange={handleInputChange}
            placeholder="Masukkan nama produk"
            required
          />
        </div>

        {/* Gambar Produk */}
        <div className="form-group">
          <label>Gambar Produk</label>
          <input
            type="file"
            name="gambar_produk"
            onChange={handleFileChange}
            accept="image/*"
          />
          {newProduk.gambar_produk && !(newProduk.gambar_produk instanceof File) && (
            <div>
              <p>Gambar Saat Ini:</p>
              <img
                src={`${process.env.REACT_APP_API_URL}/storage/${newProduk.gambar_produk}`}
                alt="Gambar Produk"
                width="100"
              />
            </div>
          )}
        </div>

        {/* Harga Jasa & Overhead */}
        <div className="form-group">
          <label>Harga Jasa Cutting</label>
          <input
            type="number"
            name="harga_jasa_cutting"
            value={newProduk.harga_jasa_cutting}
            onChange={handleInputChange}
            placeholder="Masukkan harga jasa cutting"
          />
        </div>

        <div className="form-group">
          <label>Harga Jasa CMT</label>
          <input
            type="number"
            name="harga_jasa_cmt"
            value={newProduk.harga_jasa_cmt}
            onChange={handleInputChange}
            placeholder="Masukkan harga jasa CMT"
          />
        </div>

        <div className="form-group">
          <label>Harga Jasa Aksesoris</label>
          <input
            type="number"
            name="harga_jasa_aksesoris"
            value={newProduk.harga_jasa_aksesoris}
            onChange={handleInputChange}
            placeholder="Masukkan harga jasa aksesoris"
          />
        </div>

        <div className="form-group">
          <label>Harga Overhead</label>
          <input
            type="number"
            name="harga_overhead"
            value={newProduk.harga_overhead}
            onChange={handleInputChange}
            placeholder="Masukkan harga overhead"
          />
        </div>
        <div className="form-group">
        <label>Status Produk</label>
        <select
          name="kategori_produk"
          value={newProduk.kategori_produk}
          onChange={handleInputChange}
          required
        >
          <option value="">Pilih Status</option>
          <option value="Normal">Normal</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

        {/* Komponen Dinamis */}
        <h3>Komponen Produk</h3>
        {komponenList.map((komp, index) => (
          <div key={index} className="komponen-row">
            <select
              value={komp.jenis_komponen}
              onChange={(e) => handleKomponenChange(index, "jenis_komponen", e.target.value)}
            >
              <option value="">Pilih Jenis Komponen</option>
              <option value="atasan">Atasan</option>
              <option value="bawahan">Bawahan</option>
              <option value="fullbody">Fullbody</option>
              <option value="aksesoris">Aksesoris</option>
            </select>

            <input
              type="text"
              placeholder="Nama Bahan"
              value={komp.nama_bahan}
              onChange={(e) => handleKomponenChange(index, "nama_bahan", e.target.value)}
            />
            <input
              type="number"
              placeholder="Harga Bahan"
              value={komp.harga_bahan}
              onChange={(e) => handleKomponenChange(index, "harga_bahan", e.target.value)}
            />
            <input
              type="number"
              placeholder="Jumlah"
              value={komp.jumlah_bahan}
              onChange={(e) => handleKomponenChange(index, "jumlah_bahan", e.target.value)}
            />
            <select
              value={komp.satuan_bahan}
              onChange={(e) => handleKomponenChange(index, "satuan_bahan", e.target.value)}
            >
              <option value="">Pilih Satuan</option>
              <option value="atasan">Kg</option>
              <option value="bawahan">Yard</option>
              <option value="fullbody">Gross</option>
            </select>
            <button type="button" onClick={() => removeKomponen(index)}>Hapus</button>
          </div>
        ))}
        <button type="button" onClick={addKomponen}>Tambah Komponen</button>

        {/* Action Buttons */}
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


  {showEditForm && (
  <div className="modal">
  <div className="modal-content">
    <h2>Edit Produk </h2>
    <form onSubmit={handleFormUpdate} className="modern-form">
      <div className="form-group">
        <label>Nama Produk:</label>
            <input
          type="text"
          name="nama_produk" // Pastikan ada name
          value={editProduk.nama_produk}
          onChange={handleInputChange}
          placeholder="Nama Produk"
      />

                </div>
            <div className="form-group">
        <label>Kategori Produk:</label>
            <select 
              name="kategori_produk" 
              value={editProduk.kategori_produk} 
              onChange={handleInputChange}
            >
              <option value="">Pilih Status</option>
              <option value="Urgent">Urgent</option>
              <option value="Normal">Normal</option>
            </select>
            </div>
            
            <div className="form-group">
        <label>Jenis Produk:</label>
            <select 
              name="jenis_produk" 
              value={editProduk.jenis_produk} 
              onChange={handleInputChange}
            >
              <option value="">Pilih Status</option>
              <option value="Gamis">Gamis</option>
              <option value="Kaos">Kaos</option>
              <option value="Celana">Celana</option>
            </select>
            </div>

            <div className="form-group">
            <label>Gambar Produk:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            
          </div>
          {/* Harga Jasa */}
        <div className="form-group">
          <label>Harga Jasa Cutting</label>
          <input
            type="number"
            name="harga_jasa_cutting"
            value={editProduk.harga_jasa_cutting}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Harga Jasa CMT</label>
          <input
            type="number"
            name="harga_jasa_cmt"
            value={editProduk.harga_jasa_cmt}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Harga Jasa Aksesoris</label>
          <input
            type="number"
            name="harga_jasa_aksesoris"
            value={editProduk.harga_jasa_aksesoris}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Harga Overhead</label>
          <input
            type="number"
            name="harga_overhead"
            value={editProduk.harga_overhead}
            onChange={handleInputChange}
          />
        </div>

        {/* Komponen */}
        <h3>Edit Komponen Produk</h3>
        {editKomponenList.map((komp, index) => (
          <div key={index} className="komponen-row">
            <select
              value={komp.jenis_komponen}
              onChange={(e) => handleEditKomponenChange(index, "jenis_komponen", e.target.value)}
            >
              <option value="">Pilih Jenis Komponen</option>
              <option value="atasan">Atasan</option>
              <option value="bawahan">Bawahan</option>
              <option value="fullbody">Fullbody</option>
              <option value="aksesoris">Aksesoris</option>
            </select>

            <input
              type="text"
              value={komp.nama_bahan}
              onChange={(e) => handleEditKomponenChange(index, "nama_bahan", e.target.value)}
              placeholder="Nama Bahan"
            />
            <input
              type="number"
              value={komp.harga_bahan}
              onChange={(e) => handleEditKomponenChange(index, "harga_bahan", e.target.value)}
              placeholder="Harga Bahan"
            />
            <input
              type="number"
              value={komp.jumlah_bahan}
              onChange={(e) => handleEditKomponenChange(index, "jumlah_bahan", e.target.value)}
              placeholder="Jumlah"
            />
            <input
              type="text"
              value={komp.satuan_bahan}
              onChange={(e) => handleEditKomponenChange(index, "satuan_bahan", e.target.value)}
              placeholder="Satuan"
            />
            <button type="button" onClick={() => removeEditKomponen(index)}>Hapus</button>
          </div>
        ))}
        <button type="button" onClick={addEditKomponen}>Tambah Komponen</button>

        {/* Tombol */}
        <div className="form-group">
          <label>Status HPP:</label>
          <select
            name="status_produk"
            value={editProduk.status_produk}
            onChange={handleInputChange}
          >
            <option value="">Pilih Status</option>
            <option value="Sementara">Sementara</option>
            <option value="Fix">Fix</option>
            <option value="Bermasalah">Bermasalah</option>
          </select>
        </div>


            <div className="form-actions">
                  <button type="submit" className="btn btn-submit">
                    Simpan Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={handleCancelEdit}
                    >Batal</button>
                    </div>
          
          </form>
        
    </div>
    </div>
  )}

 {/* Modal Detail */}
      {isModalOpen && selectedProduk && (
         <div className="modal">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Detail </h3>
              
              </div>
             <div className="modal-body">
             
                <p><strong>Harga Jasa CMT:</strong><span>Rp.   {selectedProduk.harga_jasa_cmt}</span></p>
                <p><strong>Harga Jasa Cutting:</strong><span> Rp.  {selectedProduk.harga_jasa_cutting}</span></p>
                <p><strong>Harga Jasa Aksesoris:</strong><span>  Rp. {selectedProduk.harga_jasa_aksesoris}</span></p>
                <p><strong>Harga Overhead:</strong><span> Rp.  {selectedProduk.harga_overhead}</span></p>
                <p><strong>Total Harga Komponen:</strong><span> Rp.  {selectedProduk.total_komponen}.00</span></p>
<br></br>
<h4>Detail Komponen:</h4>
        
            {/* Misal komponen disimpan di selectedProduk.komponen */}
           {selectedProduk.komponen && selectedProduk.komponen.length > 0 ? (
              <table className="komponen-table">
                <thead>
                  <tr>
                    <th>Jenis Komponen</th>
                    <th>Nama Bahan</th>
                    <th>Harga Bahan</th>
                    <th>Jumlah</th>
                    <th>Satuan</th>
                    <th>Total Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProduk.komponen.map((k, idx) => (
                    <tr key={idx}>
                      <td>{k.jenis_komponen}</td>
                      <td>{k.nama_bahan}</td>
                      <td>{k.harga_bahan}</td>
                      <td>{k.jumlah_bahan}</td>
                      <td>{k.satuan_bahan}</td>
                      <td>{k.total_harga_bahan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Tidak ada data komponen untuk produk ini.</p>
            )}
 </div>

            <div className="modal-footer">
                <button className="btn-close" onClick={() => setSelectedProduk(null)}>
                  Tutup
                </button>
              </div>
          </div>
        </div>
      )}

</div>
</div>
       
  )
}

export default HppProduk