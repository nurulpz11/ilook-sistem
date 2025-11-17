import React, { useEffect, useState } from "react";
import "./Penjahit.css";
import API from "../../api"; 
import {FaInfoCircle, FaPlus, FaEdit, FaClock } from 'react-icons/fa';

const Aksesoris = () => {
    const [aksesoris, setAksesoris] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCustomJenisAksesoris, setShowCustomJenisAksesoris] = useState(false);


 const [newAksesoris, setNewAksesoris] =useState({
        nama_aksesoris: "",
        jenis_aksesoris: "",
        satuan: "",
    })

    const SATUAN_AKSESORIS = {
        pcs: 'Pcs',
        pack: 'Pack',
        lusin: 'Lusin',
        kodi: 'Kodi',
        roll: 'Roll',
        gross: 'Gross',
      };
      
      const JENIS_AKSESORIS = {
        handtag: 'Handtag',
        renda: 'Renda',
        kancing: 'Kancing',
        resleting: 'Resetling',
      };


const handleJenisAksesorisChange = (e) => {
  const value = e.target.value;

  if (value === "custom") {
    setShowCustomJenisAksesoris(true);
    setNewAksesoris(prev => ({ ...prev, jenis_aksesoris: "" }));
  } else {
    setShowCustomJenisAksesoris(false);
    setNewAksesoris(prev => ({ ...prev, jenis_aksesoris: value }));
  }
};



      
useEffect(() => {
    const fetchAksesoris = async () => {
        try {
            setLoading(true);
            const response = await API.get('/aksesoris');
            setAksesoris(response.data);
        }catch (error){
            setError("Gagal mengambil data");
        }finally{
            setLoading(false);
        }
    }
    fetchAksesoris();
}, []);

const filteredAksesoris = aksesoris.filter((item) =>
    item.nama_aksesoris.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Mencegah refresh halaman
  
    console.log("Form data yang dikirim:");
    console.log({
      nama_aksesoris: newAksesoris.nama_aksesoris,
      jenis_aksesoris: newAksesoris.jenis_aksesoris,
      satuan: newAksesoris.satuan,
    });
    const formData = new FormData();
    formData.append("nama_aksesoris", newAksesoris.nama_aksesoris);
    formData.append("jenis_aksesoris", newAksesoris.jenis_aksesoris);
    formData.append("satuan", newAksesoris.satuan);
    
 
  
    try {
        const response = await API.post("/aksesoris", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
  
        console.log("Response API:", response);
        console.log("Response Data:", response.data); // Debugging
  
        alert("Produk berhasil ditambahkan!");
  
        // Tambahkan produk baru ke state
        setAksesoris((prevAksesoris) => [...prevAksesoris, response.data]); 
  
        setShowForm(false); // Tutup modal
  
        // Reset form input
        setNewAksesoris({ nama_aksesoris: "", jenis_aksesoris: "",  satuan: "" });
  
    } catch (error) {
        console.error("Error:", error.response?.data?.message || error.message);
  
        alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan produk.");
    }
  };

  


    
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAksesoris((prev) => ({
        ...prev,
        [name]: value, 
    }));
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
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>

      
         </div>
         
           <div className="table-container">
           <table className="penjahit-table">
             <thead>
               <tr>
                 <th>Id Aksesoris</th>
                 <th>Nama Aksesoris</th>
                 <th>Jenis Aksesoris</th>
                 <th>Satuan</th>
                 <th>Jumlah Stok</th>
              
   
               </tr>
             </thead>
             <tbody>
               {filteredAksesoris.map((aksesoris) => (
                 <tr key={aksesoris.id}>
                   <td data-label="Id Aksesoris : ">{aksesoris.id}</td>
                   <td data-label="Nama Aksesoris : ">{aksesoris.nama_aksesoris}</td>
                   <td data-label="Jenis Produk : ">{aksesoris.jenis_aksesoris}</td>
                   <td data-label="Satuan : ">{aksesoris.satuan}</td>
                   <td data-label="Stok : ">{aksesoris.jumlah_stok}</td>

                 </tr>
               ))}
             </tbody>
           </table>
           </div>
    </div>


        {/* Modal Form */}
        {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Tambah Aksesoris </h2>
            <form onSubmit={handleFormSubmit} className="modern-form">
              <div className="form-group">
                <label>Nama Aksesoris:</label>
                <input
                  type="text"
                  name="nama_aksesoris"
                  value={newAksesoris.nama_aksesoris}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama aksesoris"
                  required
                />
              </div>
             <div className="form-group">
              <label>Jenis Aksesoris</label>
              <select
                name="jenis_aksesoris"
                value={showCustomJenisAksesoris ? "custom" : newAksesoris.jenis_aksesoris}
                onChange={handleJenisAksesorisChange}
              >
                <option value="">Pilih Jenis</option>
                {Object.keys(JENIS_AKSESORIS).map((key) => (
                  <option key={key} value={key}>
                    {JENIS_AKSESORIS[key]}
                  </option>
                ))}
                <option value="custom">Lainnya...</option>
              </select>

              {/* Muncul kalau user pilih “custom” */}
              {showCustomJenisAksesoris && (
                <input
                  type="text"
                  name="jenis_aksesoris"
                  placeholder="Masukkan jenis aksesoris baru"
                  value={newAksesoris.jenis_aksesoris}
                  onChange={handleInputChange}
                  className="form-control mt-2"
                />
              )}
            </div>


                <div className="form-group">
                <label>Satuan Aksesoris</label>
                <select
                    name="satuan"
                    value={newAksesoris.satuan}
                    onChange={handleInputChange}
                >
                    <option value="">Pilih Satuan</option>
                    {Object.keys(SATUAN_AKSESORIS).map((key) => (
                    <option key={key} value={key}>
                        {SATUAN_AKSESORIS[key]}
                    </option>
                    ))}
                </select>
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
  )
}

export default Aksesoris