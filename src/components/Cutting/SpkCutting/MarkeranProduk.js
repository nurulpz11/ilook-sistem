import React, { useEffect, useState } from "react"
import "./SpkCuting.css";
import API from "../../../api"; 

const MarkeranProduk = () => {
    const [markeran, setMarkeran] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false); 
    const [searchTerm, setSearchTerm] = useState("");
    const [markeranProdukList, setMarkeranProdukList] = useState([{
    produk_id: "",
    nama_komponen: "",
    total_panjang: "",
    jumlah_hasil: "",
  },
]);


useEffect(() => {
    const fetchMarkeran = async () => {
        try {
            setLoading(true);
            const response = await API.get('/markeran_produk');
            setMarkeran(response.data);
        }catch (error){
            setError("Gagal mengambil data");
        }finally{
            setLoading(false);
        }
    }
    fetchMarkeran();
}, []);

 const handleFormSubmit = async (e) => {
  e.preventDefault(); // Mencegah reload halaman

  try {
    const response = await API.post("/markeran_produk", markeranProdukList, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response:", response);
    alert("Semua markeran berhasil disimpan!");

    // Reset list setelah submit
    setMarkeranProdukList([]);

    // Kalau pakai modal atau form tambahan, bisa juga ditutup di sini
    setShowForm(false);

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan markeran.");
  }
};

const handleAddRow = () => {
  setMarkeranProdukList([...markeranProdukList, {
    produk_id: "",
    nama_komponen: "",
    total_panjang: "",
    jumlah_hasil: "",
  }]);
};

const handleRemoveRow = (index) => {
  const updatedList = markeranProdukList.filter((_, i) => i !== index);
  setMarkeranProdukList(updatedList);
};

const handleInputChange = (index, field, value) => {
  const updatedList = [...markeranProdukList];
  updatedList[index][field] = value;
  setMarkeranProdukList(updatedList);
};

  return (
 <div>
     <div className="penjahit-container">
      <h1>Data markeran Produk</h1>
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
            placeholder="Cari ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          </div>
          
      </div>
      
        <div className="table-container">
       <table className="table-markeran">
        <thead>
            <tr>
            <th>ID Produk</th>
            <th>Nama Produk</th>
            <th>Nama Komponen</th>
            <th>Total Panjang</th>
            <th>Jumlah Hasil</th>
            <th>Berat per pcs</th>
            </tr>
        </thead>
        <tbody>
        {markeran.map((produk) =>
            produk.komponen.map((komponen, index) => (
            <tr key={komponen.id} className={`produk-${produk.produk_id}`}>
                {index === 0 && (
                <>
                    <td rowSpan={produk.komponen.length}>{produk.produk_id}</td>
                    <td rowSpan={produk.komponen.length}>{produk.nama_produk}</td>
                </>
                )}
                {index !== 0 && null}
                <td>{komponen.nama_komponen}</td>
                <td>{komponen.total_panjang}</td>
                <td>{komponen.jumlah_hasil}</td>
                <td>{komponen.berat_per_pcs}</td>
            </tr>
            ))
        )}
        </tbody>
    </table>
</div>

{showForm && (
  <div className="modal">
    <div className="modal-content">
      <h2>Tambah Markeran Produk</h2>
      <form onSubmit={handleFormSubmit} className="modern-form">

        {markeranProdukList.map((item, index) => (
          <div className="markeran-group" key={index}>
            <h4>Komponen #{index + 1}</h4>

            <div className="form-group">
              <label>Produk ID:</label>
              <input
                type="number"
                name="produk_id"
                value={item.produk_id}
                onChange={(e) => handleInputChange(index, 'produk_id', e.target.value)}
                placeholder="Masukkan ID Produk"
                required
              />
            </div>

            <div className="form-group">
              <label>Nama Komponen:</label>
              <input
                type="text"
                name="nama_komponen"
                value={item.nama_komponen}
                onChange={(e) => handleInputChange(index, 'nama_komponen', e.target.value)}
                placeholder="Misal: Lengan, Badan"
                required
              />
            </div>

            <div className="form-group">
              <label>Total Panjang (m):</label>
              <input
                type="number"
                step="0.01"
                name="total_panjang"
                value={item.total_panjang}
                onChange={(e) => handleInputChange(index, 'total_panjang', e.target.value)}
                placeholder="Contoh: 2.5"
                required
              />
            </div>

            <div className="form-group">
              <label>Jumlah Hasil:</label>
              <input
                type="number"
                name="jumlah_hasil"
                value={item.jumlah_hasil}
                onChange={(e) => handleInputChange(index, 'jumlah_hasil', e.target.value)}
                placeholder="Contoh: 10"
                required
              />
            </div>

            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleRemoveRow(index)}
            >
              Hapus
            </button>
            <hr />
          </div>
        ))}

        <button type="button" className="btn btn-secondary" onClick={handleAddRow}>
          + Tambah Komponen
        </button>

        <div className="form-actions">
          <button type="submit" className="btn btn-submit">
            Simpan Markeran
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
</div>
  );
};

export default MarkeranProduk