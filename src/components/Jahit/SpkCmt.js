import React, { useEffect, useState } from 'react';
import './Penjahit.css';
import { FaPlus, FaTrash, FaSave, FaTimes, FaRegEye, FaCog,
  FaEdit, FaClock,FaInfoCircle,FaClipboard , FaList, FaCheckCircle ,FaTimesCircle, FaExclamationCircle  } from 'react-icons/fa';

const SpkCmt = () => {
  const [spkCmtData, setSpkCmtData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpk, setSelectedSpk] = useState(null);
  const [selectedSpkId, setSelectedSpkId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pengirimanDetails, setPengirimanDetails] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showDeadlineForm, setShowDeadlineForm] = useState(false);  // Form Update Deadline
  const [showStatusForm, setShowStatusForm] = useState(false); 
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
    harga_per_barang: '',
    harga_per_jasa: '',
    total_harga:'',
    gambar_produk: null,
    warna: [{ nama_warna: '', qty: 0 }], // Array warna dengan qty default 0
  });
  const [newDeadline, setNewDeadline] = useState({
    deadline: '',
    keterangan: '',
  });
  const [newStatus, setNewStatus] = useState({
    status: '',
    keterangan: '',
  });
  

  //fungsi untuk input form
  const handleDeadlineChange = (e) => {
    const { name, value } = e.target;
    setNewDeadline((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Fungsi untuk input form status
  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setNewStatus((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  //fungsi untuk kirim update dadline ke API
  const updateDeadline = async (spkId) => {
    const { deadline, keterangan } = newDeadline;
    try {
      const response = await fetch(`http://localhost:8000/api/spk/${spkId}/deadline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deadline, keterangan }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update deadline');
      }
  
      const data = await response.json();
  
      // Update state lokal dengan status baru
      setSpkCmtData((prevSpkCmtData) =>
        prevSpkCmtData.map((spk) =>
          spk.id_spk === spkId
            ? { ...spk, deadline: deadline, keterangan: keterangan }
            : spk
        )
      );
  
      // Tutup popup dan form setelah pembaruan selesai
      setShowPopup(false);
      setShowForm(false);
      setShowDeadlineForm(false);
  
      alert(data.message);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };
  

   // Fungsi untuk kirim update status ke API
   const updateStatus = async (spkId) => {
    const { status, keterangan } = newStatus;
    try {
      const response = await fetch(`http://localhost:8000/api/spk/${spkId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, keterangan }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      // Update state lokal dengan status baru
      setSpkCmtData((prevSpkCmtData) =>
      prevSpkCmtData.map((spk) =>
        spk.id_spk === spkId
          ? { ...spk, status: status, keterangan: keterangan }
          : spk
      )
    );

      alert(data.message); // Menampilkan pesan sukses
      setShowPopup(false); // Menutup popup setelah status berhasil diperbarui
      setShowForm(false); // Menyembunyikan form update setelah berhasil
      setShowStatusForm(false); // Menutup form update status
    } catch (error) {
      alert('Error: ' + error.message); // Menampilkan pesan error
    }
  };
  

  //nampilin form update deadline
  const handleUpdateDeadlineClick = (spk) => {
    setSelectedSpk(spk);  // Menyimpan data SPK yang dipilih
    setShowDeadlineForm(true);  // Tampilkan form update deadline
    setShowForm(false);  // Pastikan form SPK tidak tampil
  };
 
   // Menampilkan form update status
   const handleUpdateStatusClick = (spk) => {
    setSelectedSpk(spk);  // Menyimpan data SPK yang dipilih
    setShowStatusForm(true);  // Menampilkan form update status
    setShowForm(false);  // Pastikan form SPK tidak tampil
  };
  
  
  
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
  setNewSpk((prev) => {
    const updatedData = { ...prev, [name]: value };

    // Jika yang berubah adalah harga_per_barang, hitung total_harga
    if (name === 'harga_per_barang') {
      const totalProduk = calculateJumlahProduk(updatedData.warna);
      const totalHarga = value * totalProduk; // harga_per_barang * jumlah_produk
      updatedData.total_harga = totalHarga;
    }

    return updatedData;
  });
};


const handleUpdateSubmit = async (e, spkId) => {
  e.preventDefault();

  const formData = new FormData();
  Object.keys(newSpk).forEach((key) => {
    if (key !== "warna") {
      formData.append(key, newSpk[key]);
    }
  });

  // Tambahkan data warna
  newSpk.warna.forEach((warna, index) => {
    formData.append(`warna[${index}][nama_warna]`, warna.nama_warna);
    formData.append(`warna[${index}][qty]`, warna.qty);
  });

  // Tambahkan file jika ada
  if (newSpk.gambar_produk) {
    formData.append("gambar_produk", newSpk.gambar_produk);
  }

  try {
    const response = await fetch(`http://localhost:8000/api/spkcmt/${spkId}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to update SPK");
    }

    const updatedSpk = await response.json();
    alert("SPK berhasil diupdate!");
    setShowForm(false);

    // Update state dengan data terbaru
    setSpkCmtData((prev) =>
      prev.map((spk) => (spk.id === updatedSpk.data.id ? updatedSpk.data : spk))
    );
  } catch (error) {
    alert("Error: " + error.message);
  }
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

    // Tambahkan total_harga ke dalam formData
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

const downloadStaffPdf = (id) => {
  const url = `http://localhost:8000/api/spk-cmt/${id}/download-staff-pdf`;
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

  // Hitung total_harga berdasarkan harga_per_barang dan jumlah_produk
  const totalHarga = newSpk.harga_per_barang * totalProduk;

  setNewSpk({
    ...newSpk,
    warna: updatedWarna,
    jumlah_produk: totalProduk, // Perbarui jumlah_produk secara otomatis
    total_harga: totalHarga,    // Perbarui total_harga secara otomatis
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
const handleEditClick = (spk) => {
  setSelectedSpk(spk); // Simpan data SPK yang dipilih
  setNewSpk({ ...spk, warna: spk.warna || [] }); // Isi data ke form
  setShowForm(true); // Tampilkan form
};
const statusColors = {
  Pending: "orange",
  Completed: "#74a474",
};

const getStatusColor = (status, waktuPengerjaan) => {
  if (status === "In Progress" || status === "Pending") {
    if (waktuPengerjaan <= 7) return "#d9af5e";
    if (waktuPengerjaan <= 14) return "#d96a5e";
    return "purple";
  }
  return statusColors[status] || "gray";
};
const handlePengirimanDetailClick = (spk) => {
  setSelectedSpkId(spk.id_spk); // Simpan ID SPK yang dipilih
  setPengirimanDetails(spk.pengiriman); // Ambil data pengiriman dari properti SPK
  setShowModal(true); // Tampilkan modal
};

const getFilteredSpk = async (status) => {
  const response = await fetch(`http://localhost:8000/api/spkcmt?status=${status}`);
  const data = await response.json();
  setSpkCmtData(data);  // Update state dengan data yang difilter
};


return (
  <div>
    <div className="penjahit-container">
      <h1>Data SPK CMT</h1>
      {/* Tampilkan pesan error jika terjadi error saat fetch */}
      {error && <p className="error-message">{error}</p>}

      {/* Search Bar */}
     
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
          placeholder="Cari nama produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
      </div>
          <label htmlFor="statusFilter" className="filter-label"></label>
          <select 
            id="statusFilter" 
            className="filter-select" 
            onChange={(e) => getFilteredSpk(e.target.value)}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
      </div>


      <table className="penjahit-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>NAMA PRODUK</th>
            <th>JUMLAH PRODUK</th>
            <th>DEADLINE</th>
            <th>SISA HARI</th>
            <th>WAKTU PENGERJAAN</th>
            <th>NAMA PENJAHIT</th>
            <th>JUMLAH DIKIRIM</th>
            <th>STATUS</th>
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
              <td>{spk.sisa_hari}</td> 
              <td>{spk.waktu_pengerjaan}</td> 
             
              <td>
                {
                  penjahitList.find(penjahit => penjahit.id_penjahit === spk.id_penjahit)?.nama_penjahit || 'Tidak Diketahui'
                }
              </td>
              <td>
            <button
              onClick={() => handlePengirimanDetailClick(spk)}
              className="btn-pengiriman-detail"
            >
              {spk.total_barang_dikirim || 0}
            </button>
        </td>



              <td>
              <span
                style={{
                  backgroundColor: getStatusColor(spk.status, spk.waktu_pengerjaan),
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
              >
                {spk.status}
              </span>
            </td>


   
              <td>
       
                <div className="action-card">
                  <button 
                    className="btn1-icon" 
                    onClick={() => handleDetailClick(spk)}
                  >
                    <FaInfoCircle className="icon" />
                  </button>
                  <button 
                    className="btn1-icon2" 
                    onClick={() => handleUpdateDeadlineClick(spk)}
                  >
                    <FaClock className="icon" />
                  </button>
                 
                   <button 
                    className="btn1-icon" 
                     onClick={() =>handleUpdateStatusClick(spk)}
                     > 
                     <  FaCog  className="icon" />
                   </button>

                   <button 
                    className="btn1-icon" 
                     onClick={() => handleEditClick(spk)}
                     > 
                     <FaEdit className="icon" />
                   </button>
                </div>      
              </td>
              <td>
                <button
                  onClick={() => downloadPdf(spk.id_spk)}
                  className="btn1-icon3" 
                  >
                        <FaSave className="icon" />

                </button>
              
                <button
                  onClick={() => downloadStaffPdf(spk.id_spk)}
                  className="btn1-icon3" 
                  >
                        <FaSave className="icon" />

                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>


    {showModal && (
  <div className="modal-pengiriman">
    <div className="modal-content-pengiriman">
      <h3>Detail Pengiriman untuk SPK ID: {selectedSpkId}</h3>
    
      <table>
        <thead>
          <tr>
            <th>ID Pengiriman</th>
            <th>Tanggal Pengiriman</th>
            <th>Total Barang Dikirim</th>
            <th>Sisa Barang</th>
          </tr>
        </thead>
        <tbody>
          {pengirimanDetails.map((detail) => (
            <tr key={detail.id_pengiriman}>
              <td>{detail.id_pengiriman}</td>
              <td>{detail.tanggal_pengiriman}</td>
              <td>{detail.total_barang_dikirim}</td>
              <td>{detail.sisa_barang}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setShowModal(false)}>Tutup</button>
    </div>
  </div>
)}


   
 {/* Pop-Up Card */}
{showPopup && selectedSpk && (
  <div className="popup1-overlay">
    <div className="popup1-card">
      <div className="popup1-header">
        <h2>Detail SPK</h2>
        <button className="btn-close" onClick={closePopup}>
          &times;
        </button>
      </div>

      <div className="popup1-content">
        {/* Gambar Produk */}
        <div className="popup1-image-container">
          {selectedSpk.gambar_produk ? (
            <img
              src={`http://localhost:8000/storage/${selectedSpk.gambar_produk}`}
              alt="Gambar Produk"
              className="popup1-image"
            />
          ) : (
            <div className="popup1-no-image">No Image</div>
          )}
        </div>

        {/* Detail Produk */}
        <div className="popup1-details">
          <div className="detail-group">
            <p><span>Nama Produk:</span> {selectedSpk.nama_produk}</p>
            <p><span>Jumlah Produk:</span> {selectedSpk.jumlah_produk}</p>
            <p><span>Total Harga:</span> Rp {selectedSpk.total_harga}</p>
            <p><span>Harga Barang:</span> Rp {selectedSpk.harga_per_barang}</p>
            <p><span>Harga Jasa</span> Rp {selectedSpk.harga_per_jasa}</p>
            <p><span>Warna </span> {selectedSpk.nama_warna}</p>
            
            
            
          </div>
          <div className="detail-group">
            <p><span>Tanggal SPK:</span> {selectedSpk.tgl_spk}</p>
            <p><span>Deadline:</span> {selectedSpk.deadline}</p>
            <p><span>Status:</span> {selectedSpk.status}</p>
          </div>
          <div className="detail-group">
            <p><span>Merek:</span> {selectedSpk.merek}</p>
            <p><span>Aksesoris:</span> {selectedSpk.aksesoris}</p>
            <p><span>Catatan:</span> {selectedSpk.catatan}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}






{showDeadlineForm && selectedSpk && (
  <div className="modal">
 <div className="modal-content">
 <h2>Update Deadline</h2>
    <form onSubmit={(e) => { e.preventDefault(); updateDeadline(selectedSpk.id_spk); }} className="modern-form">
    <div className="form-group">
        <label>Deadline Baru</label>
        <input
          type="date"
          name="deadline"
          value={newDeadline.deadline}
          onChange={handleDeadlineChange}
          required
        />
      </div>
      <div>
        <label>Keterangan</label>
        <input
          type="text"
          name="keterangan"
          value={newDeadline.keterangan}
          onChange={handleDeadlineChange}
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-submit">
            <FaSave /> Simpan
          </button>
        <button
            type="button"
            className="btn btn-cancel"
            onClick={() => setShowDeadlineForm(false)}
          >
            <FaTimes /> Batal
        </button>
        </div>
        </form>
    </div>
  </div>
)}



{showStatusForm && selectedSpk && (
  <div className="modal">
 <div className="modal-content">
 <h2>Update Status</h2>
    <form onSubmit={(e) => { e.preventDefault(); updateStatus(selectedSpk.id_spk); }} className="modern-form">
    <div className="form-group">
        <label>Status Baru</label>
        <select
                name="status"
                value={newStatus.status}
                onChange={handleStatusChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
      </div>
      <div>
        <label>Keterangan</label>
        <input
          type="text"
          name="keterangan"
          value={newStatus.keterangan}
          onChange={handleStatusChange}
          
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-submit">
            <FaSave /> Simpan
          </button>
        <button
            type="button"
            className="btn btn-cancel"
            onClick={() => setShowStatusForm(false)}
          >
            <FaTimes /> Batal
        </button>
        </div>
        </form>
    </div>
  </div>
)}



{/* Modal Form */}
{showForm && (
  <div className="modal">
    <div className="modal-content">
      <h2>TAMBAH DATA SPK</h2>
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
             <FaTrash /> 
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
      <div className="form-group">
          <label>Harga per barang</label>
          <input
            type="number"
            name="harga_per_barang"
            value={newSpk.harga_per_barang}
            onChange={handleInputChange}
            placeholder="Masukkan harga"
            required
          />
        </div>
        <div className="form-group">
          <label>Harga per jasa</label>
          <input
            type="number"
            name="harga_per_jasa"
            value={newSpk.harga_per_jasa}
            onChange={handleInputChange}
            placeholder="Masukkan harga"
            required
          />
        </div>
         
        <div className="form-group">
          <label>Total Harga</label>
          <input
            type="number"
             name="total_harga"
            value={newSpk.total_harga}
            readOnly // Total harga dihitung otomatis
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


{showForm && selectedSpk && (
  <div className="update-form">
    <h3>Update SPK</h3>
    <form onSubmit={(e) => handleUpdateSubmit(e, selectedSpk.id)}>
      <label>
        Nama Produk:
        <input
          type="text"
          name="nama_produk"
          value={newSpk.nama_produk}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Deadline:
        <input
          type="date"
          name="deadline"
          value={newSpk.deadline}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Harga per Barang:
        <input
          type="number"
          name="harga_per_barang"
          value={newSpk.harga_per_barang}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Penjahit:
        <select
          name="id_penjahit"
          value={newSpk.id_penjahit}
          onChange={handleInputChange}
        >
          <option value="">Pilih Penjahit</option>
          {penjahitList.map((penjahit) => (
            <option key={penjahit.id} value={penjahit.id}>
              {penjahit.nama}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Update</button>
      <button type="button" onClick={() => setShowForm(false)}>
        Cancel
      </button>
    </form>
  </div>
)}

 </div>
  );
};

export default SpkCmt;
