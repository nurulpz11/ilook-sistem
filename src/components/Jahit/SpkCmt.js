import React, { useEffect, useState } from 'react';
import './Penjahit.css';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const SpkCmt = () => {
  const [spkCmtData, setSpkCmtData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpk, setSelectedSpk] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [penjahitList, setPenjahitList] = useState([]); // State untuk menyimpan data penjahit
  const [newSpk, setNewSpk] = useState({
    nama_produk: '',
    jumlah_produk: 0, // Akan dihitung secara otomatis
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
    gambar_produk: null,
    warna: [{ nama_warna: '', qty: 0 }], // Array warna dengan qty default 0
  });

  useEffect(() => {
    const fetchSpkCmtData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/spkcmt');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        console.log('Data SPK:', data);  // Cek apakah data warna ada di sini
        setSpkCmtData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSpkCmtData();
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
  
    // Hitung ulang jumlah_produk sebelum mengirim data
    const totalJumlahProduk = newSpk.warna.reduce((sum, warna) => sum + Number(warna.qty || 0), 0);
  
    const formData = new FormData();
  
    // Tambahkan semua field kecuali 'warna'
    Object.keys(newSpk).forEach((key) => {
      if (key !== 'warna') {
        formData.append(key, key === 'jumlah_produk' ? totalJumlahProduk : newSpk[key]);
      }
    });
  
    // Tambahkan data warna ke FormData
    if (newSpk.warna && newSpk.warna.length > 0) {
      newSpk.warna.forEach((warna, index) => {
        formData.append(`warna[${index}][nama_warna]`, warna.nama_warna);
        formData.append(`warna[${index}][qty]`, warna.qty);
      });
    }
  
    // Tambahkan file gambar_produk jika ada
    if (newSpk.gambar_produk) {
      formData.append('gambar_produk', newSpk.gambar_produk);
    }
  
    try {
      const response = await fetch('http://localhost:8000/api/spkcmt', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to save data');
      }
  
      const savedSpk = await response.json();
  
      // Tambahkan data baru ke list SPK
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


const handleWarnaChange = (e, index) => {
  const { name, value } = e.target;
  const updatedWarna = [...newSpk.warna];
  
 // Update nilai nama_warna atau qty
 if (name.includes('nama_warna')) {
  updatedWarna[index].nama_warna = value;
} else if (name.includes('qty')) {
  updatedWarna[index].qty = value;
}

// Hitung ulang jumlah_produk
const totalProduk = calculateJumlahProduk(updatedWarna);

setNewSpk({
  ...newSpk,
  warna: updatedWarna,
  jumlah_produk: totalProduk, // Perbarui jumlah_produk secara otomatis
});
};

const handleAddWarna = () => {
  const updatedWarna = [...newSpk.warna, { nama_warna: '', qty: 0 }];
  const totalProduk = calculateJumlahProduk(updatedWarna);

  setNewSpk({
    ...newSpk,
    warna: updatedWarna,
    jumlah_produk: totalProduk,
  });
};

const handleRemoveWarna = (index) => {
  const updatedWarna = newSpk.warna.filter((_, i) => i !== index);
  const totalProduk = calculateJumlahProduk(updatedWarna);

  setNewSpk({
    ...newSpk,
    warna: updatedWarna,
    jumlah_produk: totalProduk,
  });
};



const handleDetailClick = (spk) => {
  setSelectedSpk(spk); // Simpan detail SPK yang dipilih
  setShowPopup(true);  // Tampilkan pop-up
};

const closePopup = () => {
  setShowPopup(false); // Sembunyikan pop-up
  setSelectedSpk(null); // Reset data SPK
};

const formatTanggal = (tanggal) => {
  const date = new Date(tanggal);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const calculateJumlahProduk = (warnaArray) => {
  const total = warnaArray.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  return total;
};

return (
  <div>
    <div className="penjahit-container">
      <h1>Data SPK CMT</h1>
      {/* Tampilkan pesan error jika terjadi error saat fetch */}
      {error && <p className="error-message">{error}</p>}

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
    </div>

    <div className="table-container">
      <table className="penjahit-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>NAMA PRODUK</th>
            <th>JUMLAH PRODUK</th>
            <th>DEADLINE</th>
            <th>NAMA PENJAHIT</th>
            <th>TANGGAL SPK</th>
            <th>STATUS</th>
            <th>NOMOR SERI</th>
            <th>TANGGAL AMBIL</th>
            <th>GAMBAR</th>
            <th>AKSI</th>
            <th>DOWNLOAD</th>
          </tr>
        </thead>
        <tbody>
          {filteredSpk.map((spk) => (
            <tr key={spk.id_spk}>
              <td>{spk.id_spk}</td>
              <td>{spk.nama_produk}</td>
              <td>{spk.jumlah_produk}</td>
              <td>{formatTanggal(spk.deadline)}</td>
              <td>
                {
                  penjahitList.find(penjahit => penjahit.id_penjahit === spk.id_penjahit)?.nama_penjahit || 'Tidak Diketahui'
                }
              </td>
              <td>{formatTanggal(spk.tgl_spk)}</td>
              <td>{spk.status}</td>
              <td>{spk.nomor_seri}</td>
              <td>{formatTanggal(spk.tanggal_ambil)}</td>
              <td>
                {spk.gambar_produk ? (
                  <img
                    src={`http://localhost:8000/storage/${spk.gambar_produk}`}
                    alt="Gambar Produk"
                    className="gambar-produk"
                  />
                ) : (
                  'Tidak ada gambar'
                )}
              </td>
              <td>
                <button
                  className="btn btn-detail"
                  onClick={() => handleDetailClick(spk)}
                >
                  Detail
                </button>
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
    </div>

    {/* Pop-Up Card */}
    {showPopup && (
  <div className="popup-overlay">
    <div className="popup-card">
      {selectedSpk && (
        <>
          <div className="popup-header">
            <img
              src={`http://localhost:8000/storage/${selectedSpk.gambar_produk}`}
              alt="Gambar Produk"
              className="popup-image"
            />
            <span className="status-badge">{selectedSpk.status}</span>
          </div>
          <h2>Order #{selectedSpk.id_spk}</h2>
          <div className="popup-details">
            <div>
              <p><strong>Item</strong></p>
              <p>{selectedSpk.nama_produk}</p>
            </div>
            
            <div>
              <p><strong>Start time</strong></p>
              <p>{selectedSpk.tgl_spk}</p>
            </div>
            <div>
              <p><strong>Address</strong></p>
              <p>4517 Washington Ave. Manchester, Kentucky</p>
            </div>
          </div>
         
        </>
      )}
      <button onClick={closePopup} className="close-btn">Tutup</button>
    </div>
  </div>
)}



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
          <label>Penjahit</label>
          <select
            name="id_penjahit"
            value={newSpk.id_penjahit}
            onChange={handleInputChange}
            required
          >
            <option value="">Pilih Penjahit</option>
            {penjahitList.map((penjahit) => (
              <option key={penjahit.id_penjahit} value={penjahit.id_penjahit}>
                {penjahit.nama_penjahit}
              </option>
            ))}
          </select>
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


        <div className="form-group">
        <label>Warna Produk</label>
        {newSpk.warna.map((item, index) => (
          <div key={index} className="warna-item">
            <input
              type="text"
              name={`nama_warna_${index}`}
              value={item.nama_warna}
              onChange={(e) => handleWarnaChange(e, index)}
              placeholder="Masukkan nama warna"
              required
            />
            <input
              type="number"
              name={`qty_${index}`}
              value={item.qty}
              onChange={(e) => handleWarnaChange(e, index)}
              placeholder="Masukkan jumlah"
              required
            />
            <button
              type="button"
              onClick={() => handleRemoveWarna(index)}
            >
             <FaTrash /> Hapus Warna
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddWarna}>
        <FaPlus /> Tambah Warna
        </button>
      </div>
      
      <div className="form-group">
        <label>Jumlah Produk</label>
        <input
          type="number"
          name="jumlah_produk"
          value={newSpk.jumlah_produk}
          readOnly
        />
      </div>


        <div className="form-actions">
        <button type="submit" className="btn btn-submit">
            <FaSave /> Simpan
          </button>
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => setShowForm(false)}
          >
            <FaTimes /> Batal
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
