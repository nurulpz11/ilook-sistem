import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaRegEye, FaClock,FaInfoCircle,FaClipboard , FaList,FaMoneyBillWave  } from 'react-icons/fa';
import "./Penjahit.css";
import { useParams } from "react-router-dom"


const Kinerja = () => {
    const [kinerjaCmt, setKinerjaCmt] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedKinerja, setSelectedKinerja] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { kategori } = useParams(); // Ambil parameter dari URL


    useEffect(() => {
        fetch("http://localhost:8000/api/kinerja-cmt")
          .then((response) => response.json())
          .then((data) => {
            console.log("Data fetched:", data); // Debugging
            setKinerjaCmt(data); // Simpan respons API langsung
          })
          .catch((error) => console.error("Error fetching data:", error));
      }, []);
    
      // Filter nama penjahit berdasarkan searchTerm
      const filteredData = Object.keys(kinerjaCmt).filter((nama) =>
        nama.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const handleDetailClick = (data) => {
        setSelectedKinerja(data); // Simpan detail SPK yang dipilih
        setShowModal(true); // Tampilkan modal
      };
    
      const closeModal = () => {
        setShowModal(false); // Sembunyikan modal
        setSelectedKinerja(null); // Reset data SPK
      };
      const getKategoriColor = (kategori) => {
        switch (kategori) {
          case "A":
            return "#A0DCDC"; // Kategori A: hijau
          case "B":
            return "#EAC98D";  // Kategori B: biru
          case "C":
            return "#E4B255"; // Kategori C: oranye
          case "D":
            return "#ED9292";    // Kategori D: merah
          default:
            return "black";  // Default: hitam jika kategori tidak dikenali
        }
        
      };
      
  return (
    <div>
        <div className="penjahit-container">
          <h1>Kinerja Cmt</h1>
        </div>
        <div className="table-container">
          <div className="filter-header">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Cari nama penjahit"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
        </div>
        <table className="penjahit-table">
          <thead>
            <tr>
              <th>Nama CMT</th>
              <th>Nilai Kinerja</th>
              <th>Total SPK</th>
             
              <th>Kategori KINERJA</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((namaPenjahit) => {
              const data = kinerjaCmt[namaPenjahit];
              return (
                <tr key={namaPenjahit}>
                  <td>{namaPenjahit}</td>
                  <td>{data.rata_rata}%</td>
                  <td>{data.total_spk}</td>
                  
                  <td>
                  <span
                    style={{
                        backgroundColor: getKategoriColor(data.kategori),
                        color: "white",
                        padding: "3px 6px",
                        borderRadius: "5px",
                        fontWeight: "bold",
                       
                    }}
                    >
                    {data.kategori}
                    </span>
                    </td>
                  

                  <td>
                <div className="action-card">
                  <button 
                    className="btn1-icon" 
                    onClick={() => handleDetailClick(data)}
                  >
                    <FaInfoCircle className="icon" />
                  </button>
                  </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>


      
   
    </div>
  );
};

export default Kinerja;