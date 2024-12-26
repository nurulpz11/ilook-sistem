import React, { useEffect, useState } from "react";
import "./Penjahit.css";

const Penjahit = () => {
  const [penjahits, setPenjahits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false); // State untuk modal form
  const [newPenjahit, setNewPenjahit] = useState({
    nama_penjahit: "",
    kontak: "",
    alamat: "",
  }); // State untuk form data penjahit baru

  // Fetch data penjahit
  useEffect(() => {
    fetch("http://localhost:8000/api/penjahit") // Ganti dengan endpoint API Anda
      .then((response) => response.json())
      .then((data) => setPenjahits(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Filter data berdasarkan pencarian
  const filteredPenjahits = penjahits.filter((penjahit) =>
    penjahit.nama_penjahit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle submit form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Simpan data penjahit baru ke server
    fetch("http://localhost:8000/api/penjahit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPenjahit),
    })
      .then((response) => response.json())
      .then((data) => {
        setPenjahits([...penjahits, data]); // Tambahkan data baru ke list
        setShowForm(false); // Tutup modal
        setNewPenjahit({ nama_penjahit: "", kontak: "", alamat: "" }); // Reset form
      })
      .catch((error) => console.error("Error adding data:", error));
  };

  return (
    <div className="penjahit-container">
      <h1>Daftar Penjahit</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Cari nama penjahit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-button" onClick={() => setShowForm(true)}>
          Tambah 
        </button>
      </div>

      {/* Tabel */}
      <table className="penjahit-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Penjahit</th>
            <th>Kontak</th>
            <th>Alamat</th>
          </tr>
        </thead>
        <tbody>
          {filteredPenjahits.map((penjahit) => (
            <tr key={penjahit.id_penjahit}>
              <td>{penjahit.id_penjahit}</td>
              <td>{penjahit.nama_penjahit}</td>
              <td>{penjahit.kontak}</td>
              <td>{penjahit.alamat}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Form */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Tambah Data Penjahit</h2 >
            <form onSubmit={handleFormSubmit} className="modern-form">
            <div className="form-group">
              <label>Nama Penjahit</label>
              <input
                type="text"
                value={newPenjahit.nama_penjahit}
                onChange={(e) =>
                  setNewPenjahit({ ...newPenjahit, nama_penjahit: e.target.value })
                }
                  placeholder="Masukkan nama penjahit"
                required
              />
              </div>

              <div className="form-group">
              <label>Kontak</label>
              <input
                type="text"
                value={newPenjahit.kontak}
                onChange={(e) =>
                  setNewPenjahit({ ...newPenjahit, kontak: e.target.value })
                }
                 placeholder="Masukkan jumlah produk"
                required
              />
              </div>

              <div className="form-group">
              <label>Alamat</label>
              <textarea
                value={newPenjahit.alamat}
                onChange={(e) =>
                  setNewPenjahit({ ...newPenjahit, alamat: e.target.value })
                }
                 placeholder="Tambahkan alamat..."
                required
              ></textarea>
              </div>


              <div className="form-actions">
                <button type="submit" className="btn btn-submit" >
                  Simpan
                  </button>
                <button
                 type="button"
                   className="btn btn-cancel"
                 onClick={() => setShowForm(false)}>
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

export default Penjahit;
