import React, { useEffect, useState } from "react";
import "./Penjahit.css";
import API from "../../api"; 
import {FaInfoCircle, FaPlus, FaEdit, FaClock } from 'react-icons/fa';

const Produk = () => {
  const [produks, setProduks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [showForm, setShowForm] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [showCustomJenis, setShowCustomJenis] = useState(false);


  const [newProduk, setNewProduk] = useState({
    nama_produk: "",
    kategori_produk: "",
    jenis_produk:"",
    gambar_produk: null,
  });

  const [selectedProduk, setSelectedProduk] = useState(null);
const [editProduk, setEditProduk] = useState({
  id: "",
  nama_produk: "",
  kategori_produk: "",
  jenis_produk: "",
  gambar_produk: null,
});
const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    const fetchProduks = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/produk`, {
          params: { 
            kategori_produk: selectedKategori 
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
  }, [selectedKategori]);


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
  
  if (newProduk.gambar_produk) {
      formData.append("gambar_produk", newProduk.gambar_produk);
  }

  try {
      const response = await API.post("/produk", formData, {
          headers: {
              "Content-Type": "multipart/form-data",
          },
      });

      console.log("Response API:", response);
      console.log("Response Data:", response.data); // Debugging

      alert("Produk berhasil ditambahkan!");

      // Tambahkan produk baru ke state
      setProduks((prevProduks) => [...prevProduks, response.data]); 

      setShowForm(false); // Tutup modal

      // Reset form input
      setNewProduk({ nama_produk: "", kategori_produk: "", gambar_produk: null, kategori_produk: "" });

  } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);

      alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan produk.");
  }
};

const handleFormUpdate = async (e) => {
  e.preventDefault(); // Mencegah reload halaman

  const formData = new FormData();
  formData.append("nama_produk", editProduk.nama_produk);
  formData.append("kategori_produk", editProduk.kategori_produk);
  formData.append("jenis_produk", editProduk.jenis_produk);
  
  if (editProduk.gambar_produk) {
      formData.append("gambar_produk", editProduk.gambar_produk);
  }

  // Karena route update hanya menerima PUT, tambahkan _method untuk spoofing
  formData.append("_method", "PUT");

  try {
      const response = await API.post(`/produk/${editProduk.id}`, formData, {
          headers: {
              "Content-Type": "multipart/form-data",
          },
      });

      console.log("Response API:", response.data);
      alert("Produk berhasil diperbarui!");

      // Perbarui state produk setelah edit
      setProduks((prevProduks) =>
          prevProduks.map((produk) =>
              produk.id === editProduk.id ? response.data : produk
          )
      );

      setShowEditForm(false); // Tutup modal edit
  } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Terjadi kesalahan saat mengupdate produk.");
  }
};



  const handleFileChange = (e) => {
    setNewProduk((prev) => ({
      ...prev,
      gambar_produk: e.target.files[0], // Menyimpan file gambar
    }));
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
    setSelectedProduk(produk); // Simpan produk yang akan diedit
    setEditProduk({ 
        id: produk.id,
        nama_produk: produk.nama_produk,
        kategori_produk: produk.kategori_produk,
        jenis_produk: produk.jenis_produk,
        gambar_produk: null, // Gambar diatur null karena hanya diperbarui jika diunggah baru
    });
    setShowEditForm(true); // Tampilkan form edit
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
      setNewProduk(prev => ({ ...prev, jenis_produk: value }));
    }
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

            <option value="" >All Status</option>
            <option value="Urgent">Urgent</option>
            <option value="Normal">Normal</option>
          
          </select>
   
      </div>
      
        <div className="table-container">
        <table className="penjahit-table">
          <thead>
            <tr>
              <th>ID Produk</th>
              <th>Nama Produk</th>
              <th>Kategori Produk</th> 
              <th>Status Produk</th>
              <th>Gambar Produk </th>
              <th>Aksi</th>

            </tr>
          </thead>
          <tbody>
            {filteredProduk.map((produk) => (
              <tr key={produk.id_produk}>
                <td data-label="Id Produk : ">{produk.id}</td>
                <td data-label="Nama Produk : ">{produk.nama_produk}</td>
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
              <td data-label="Gambar Produk">
    <img src={produk.gambar_produk} alt="Gambar Produk" />
  </td>

                
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
  
              </tr>
            ))}
          </tbody>
        </table>
        </div>


         {/* Modal Form */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Tambah Produk </h2>
            <form onSubmit={handleFormSubmit} className="modern-form">
              <div className="form-group">
                <label>Nama Produk:</label>
                <input
                  type="text"
                  name="nama_produk"
                  value={newProduk.nama_produk}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama produk"
                  required
                />
              </div>
              <div className="form-group">
              <label>Status Produk</label>
                <select 
                name="kategori_produk" 
                value={newProduk.kategori_produk} 
                onChange={handleInputChange}>
                  <option value="">Pilih Kategori</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Norma">Normal</option>
                </select>
            </div>
            <div className="form-group">
              <label>Jenis Produk</label>
              <select 
                name="jenis_produk" 
                value={showCustomJenis ? 'custom' : newProduk.jenis_produk}
                onChange={handleJenisChange}>
                <option value="">Pilih Jenis</option>
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
                  <img src={`http://localhost:8000/storage/${newProduk.gambar_produk}`} alt="Gambar Produk" width="100" />
                </div>
              )}
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
       <label>Status Produk:</label>
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
       <label>Kategori Produk:</label>
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

        </div>
        </div>
       
  )
}


export default Produk