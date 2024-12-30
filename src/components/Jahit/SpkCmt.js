import React, { useEffect, useState } from 'react';
import './Penjahit.css';

const SpkCmt = () => {
  const [spkCmtData, setSpkCmtData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSpk, setNewSpk] = useState({
    nama_produk: '',
    jumlah_produk: '',
    deadline: '',
    id_penjahit: '',
    keterangan: '',
    tgl_spk: '',
    status: 'Pending',
    nomor_seri: '',
    tanggal_ambil: '',
    catatan: '',
    markeran: '',
    aksesoris: '',
    handtag: '',
    merek: '',
    gambar_produk: null, // Tambahkan ini
  });

  useEffect(() => {
    const fetchSpkCmtData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/spkcmt');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setSpkCmtData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpkCmtData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSpk((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

// Filter data berdasarkan pencarian
const filteredSpk = spkCmtData.filter((spk) =>
    spk.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e) => {
    setNewSpk((prev) => ({
      ...prev,
      gambar_produk: e.target.files[0], // Menyimpan file gambar
    }));
  };
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Masukkan semua field ke FormData
    Object.keys(newSpk).forEach((key) => {
      formData.append(key, newSpk[key]);
    });
  
    if (newSpk.gambar_produk) {
      formData.append('gambar_produk', newSpk.gambar_produk);
    }
  
    try {
      const response = await fetch('http://localhost:8000/api/spkcmt', {
        method: 'POST',
        body: formData, // Kirim sebagai FormData
      });
  
      if (!response.ok) {
        throw new Error('Failed to save data');
      }
  
      const savedSpk = await response.json();
      setSpkCmtData((prev) => [...prev, savedSpk.data]);
      setShowForm(false);
      alert('SPK berhasil disimpan!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };
  const downloadPdf = (id) => {
    const url = `http://localhost:8000/api/spk-cmt/${id}/download-pdf`;
    window.open(url, '_blank'); // Membuka file PDF di tab baru
};

  return (
    <div className="penjahit-container">
      <h1>Data SPK CMT</h1>

         {/* Search Bar */}
         <div className="search-bar">
        <input
          type="text"
          placeholder="Cari data SPK..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-button" onClick={() => setShowForm(true)}>
          Tambah 
        </button>
      </div>

       <table className="penjahit-table">
         <thead>
           <tr>
             <th>ID</th>
             <th>Nama Produk</th>
             <th>Jumlah Produk</th>
             <th>Deadline </th>
             <th>ID Penjahit</th>
             <th>Keterangan </th>
             <th>Tanggal SPK </th>
             <th>Status </th>
             <th>Nomor Seri </th>
             <th>Tanggal Ambil </th>
             <th>Catatan </th>
             <th>Markeran </th>
             <th>Aksesoris</th>
             <th>Handtag </th>
             <th>Merek</th>
             <th>Gambar</th>
             <th>Download PDF</th>
           </tr>
         </thead>
         <tbody>
           {filteredSpk.map((spk) => (
             <tr key={spk.id_spk}>
             <td>{spk.id_spk}</td>
             <td>{spk.nama_produk}</td>
             <td>{spk.jumlah_produk}</td>
             <td>{spk.deadline}</td>
             <td>{spk.id_penjahit}</td>
             <td>{spk.keterangan}</td>
             <td>{spk.tgl_spk}</td>
             <td>{spk.status}</td>
            <td>{spk.nomor_seri}</td>
            <td>{spk.tanggal_ambil}</td>
            <td>{spk.catatan}</td>
            <td>{spk.markeran}</td>
            <td>{spk.aksesoris}</td>
            <td>{spk.handtag}</td>
            <td>{spk.merek}</td>
            <td>
            {spk.gambar_produk ? (
            <img
              src={`http://localhost:8000/storage/${spk.gambar_produk}`}  // Pastikan path benar
              alt="Gambar Produk"
              style={{ width: '100px', height: '100px' }}
            />
          ) : (
            'Tidak ada gambar'
          )}
        </td>
        <td>
        <button
          onClick={() => downloadPdf(spk.id_spk)}
          className="btn btn-download"
        >
          Download PDF
        </button>
      </td>

           </tr>
           ))}
         </tbody>
       </table>

      {/* Modal Form */}
{showForm && (
  <div className="modal">
    <div className="modal-content">
      <h2>Tambah Data SPK</h2>
      <form onSubmit={handleSubmit} className="modern-form">
        <div className="form-group">
          <label>Nama Produk</label>
          <input
            type="text"
            name="nama_produk"
            value={newSpk.nama_produk}
            onChange={handleInputChange}
            placeholder="Masukkan nama produk"
            required
          />
        </div>

        <div className="form-group">
          <label>Jumlah Produk</label>
          <input
            type="number"
            name="jumlah_produk"
            value={newSpk.jumlah_produk}
            onChange={handleInputChange}
            placeholder="Masukkan jumlah produk"
            required
          />
        </div>

        <div className="form-group">
          <label>Deadline</label>
          <input
            type="date"
            name="deadline"
            value={newSpk.deadline}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>ID Penjahit</label>
          <input
            type="number"
            name="id_penjahit"
            value={newSpk.id_penjahit}
            onChange={handleInputChange}
            placeholder="Masukkan ID penjahit"
            required
          />
        </div>

        <div className="form-group">
          <label>Keterangan</label>
          <textarea
            name="keterangan"
            value={newSpk.keterangan}
            onChange={handleInputChange}
            placeholder="Tambahkan keterangan..."
          ></textarea>
        </div>

        <div className="form-group">
          <label>Tanggal SPK</label>
          <input
            type="date"
            name="tgl_spk"
            value={newSpk.tgl_spk}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={newSpk.status}
            onChange={handleInputChange}
            required
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nomor Seri</label>
          <input
            type="text"
            name="nomor_seri"
            value={newSpk.nomor_seri}
            onChange={handleInputChange}
            placeholder="Masukkan nomor seri"
            required
          />
        </div>

        <div className="form-group">
          <label>Tanggal Ambil</label>
          <input
            type="date"
            name="tanggal_ambil"
            value={newSpk.tanggal_ambil}
            onChange={handleInputChange}
            required
          />
        </div>

        
        <div className="form-group">
          <label>Catatan</label>
          <textarea
            name="catatan"
            value={newSpk.catatan}
            onChange={handleInputChange}
            placeholder="Tambahkan catatan.."
          ></textarea>
        </div>

        <div className="form-group">
          <label>Markeran</label>
          <input
            type="text"
            name="markeran"
            value={newSpk.markeran}
            onChange={handleInputChange}
            placeholder="Masukkan markeran"
            required
          />
        </div>

        <div className="form-group">
          <label>aksesoris</label>
          <input
            type="text"
            name="aksesoris"
            value={newSpk.aksesoris}
            onChange={handleInputChange}
            placeholder="Masukkan aksesoris"
            required
          />
        </div>

        <div className="form-group">
          <label>Handtag</label>
          <input
            type="text"
            name="handtag"
            value={newSpk.handtag}
            onChange={handleInputChange}
            placeholder="Masukkan handtag"
            required
          />
        </div>

        <div className="form-group">
          <label>merek</label>
          <input
            type="text"
            name="merek"
            value={newSpk.merek}
            onChange={handleInputChange}
            placeholder="Masukkan merek"
            required
          />
        </div>

        <div className="form-group">
          <label>Gambar Produk</label>
          <input
            type="file"
            name="gambar_produk"
            onChange={handleFileChange}
            accept="image/*"
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
 </div>
  );
};

export default SpkCmt;
