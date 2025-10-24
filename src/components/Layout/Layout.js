import React, { useState, useEffect } from 'react';
import './Layout.css';
import { Link, Outlet } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaCogs, FaChevronDown, FaChevronUp, FaFolder } from 'react-icons/fa';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCmtOpen, setIsCmtOpen] = useState(false);
  const [isCuttingOpen, setIsCuttingOpen] = useState(false);
  const [isJasaOpen, setIsJasaOpen] = useState(false);
  const [isHppOpen, setIsHppOpen] = useState(false);
  const [isPackingOpen, setIsPackingOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home"); // Tambahkan state untuk menu aktif
  const [role, setRole] = useState(""); // State untuk menyimpan role user
  const [isAksesorisOpen, setIsAksesorisOpen] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("role"); // Ambil role dari localStorage
    setRole(userRole);
  }, []);

  const toggleCmtMenu = () => {
    setIsCmtOpen(!isCmtOpen);
  };
    const toggleCuttingMenu = () => {
    setIsCuttingOpen(!isCuttingOpen);
  };
    const toggleJasaMenu = () => {
    setIsJasaOpen(!isJasaOpen);
  };

    const toggleHppMenu = () => {
    setIsHppOpen(!isHppOpen);
  };
    const togglePackingMenu = () => {
    setIsPackingOpen(!isPackingOpen);
  };



  const handleMenuClick = (menu) => {
    setActiveMenu(menu); 
    setIsSidebarOpen(false); 
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleAksesorisMenu = () => {
    setIsAksesorisOpen(!isAksesorisOpen);
  };

  return (
    <div className="layout-container">
      {/* Tombol Menu (hanya di mobile) */}
      <button className="menu-button" onClick={toggleSidebar}>
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>ILOOK FASHION</h3>
        </div>
        <nav className="sidebar-menu">
          <ul>
            {role !== "penjahit" && (
              <li>
                <Link to="/home" className={`sidebar-link ${activeMenu === "home" ? "active" : ""}`} onClick={() => handleMenuClick("home")}>
                  <FaHome className="icon" /> DASHBOARD
                </Link>
              </li>
            )}
            <li>
              <div onClick={toggleCmtMenu} className={`sidebar-link dropdown-toggle ${activeMenu === "cmt" ? "active" : ""}`}>
                <FaCogs className="icon" /> CMT
                <span className={`arrow ${isCmtOpen ? "open" : ""}`}>{isCmtOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
              </div>
              {isCmtOpen && (
                <ul className="dropdown-menu">
                 
                 
                  <li>
                    <Link to="penjahit" className={`dropdown-link ${activeMenu === "penjahit" ? "active" : ""}`} onClick={() => handleMenuClick("penjahit")}>
                      CMT
                    </Link>
                  </li>
                  <li>

                    <Link to="spkcmt" className={`dropdown-link ${activeMenu === "spk" ? "active" : ""}`} onClick={() => handleMenuClick("spk")}>
                      SPK
                    </Link>
                  </li>

                 

                 
                    <li>
                     <Link to="kinerja2" className={`dropdown-link ${activeMenu === "kinerja2" ? "active" : ""}`} onClick={() => handleMenuClick("kinerja2")}>
                        Kinerja 
                     </Link>
                    </li>
                    
                    
                  {role !== "penjahit" && (
                    <>
                   
                      <li>
                        <Link to="pengiriman" className={`dropdown-link ${activeMenu === "pengiriman" ? "active" : ""}`} onClick={() => handleMenuClick("pengiriman")}>
                          Pengiriman
                        </Link>
                      </li>
                      <li>
                        <Link to="hutang" className={`dropdown-link ${activeMenu === "hutang" ? "active" : ""}`} onClick={() => handleMenuClick("hutang")}>
                          Hutang
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="cashbon"
                          className={`dropdown-link ${activeMenu === "cashbon" ? "active" : ""}`}
                          onClick={() => handleMenuClick("casbon")}
                        >
                          Casbon
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="pendapatan"
                          className={`dropdown-link ${activeMenu === "pendapatan" ? "active" : ""}`}
                          onClick={() => handleMenuClick("pendapatan")}
                        >
                          Pendapatan
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="historyPendapatan"
                          className={`dropdown-link ${activeMenu === "historyPendapatan" ? "active" : ""}`}
                          onClick={() => handleMenuClick("historyPendapatan")}
                        >
                          History Pendapatan
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="deadline"
                          className={`dropdown-link ${activeMenu === "deadline" ? "active" : ""}`}
                          onClick={() => handleMenuClick("deadline")}
                        >
                          Log Deadline
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="status"
                          className={`dropdown-link ${activeMenu === "status" ? "active" : ""}`}
                          onClick={() => handleMenuClick("status")}
                        >
                          Log Status
                        </Link>
                      </li>
                      
                     
                    <li>
                    <div
                      onClick={toggleAksesorisMenu}
                      className={`sidebar-link dropdown-toggle ${activeMenu === "aksesoris" ? "active" : ""}`}
                    >
                      Aksesoris
                      <span className={`arrow ${isAksesorisOpen ? "open" : ""}`}>
                        {isAksesorisOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </div>
                    {isAksesorisOpen && (
                      <ul className="dropdown-menu">
                        <li>
                          <Link
                            to="aksesoris"
                            className={`dropdown-link ${activeMenu === "aksesoris" ? "active" : ""}`}
                            onClick={() => handleMenuClick("aksesoris")}
                          >
                            Data Aksesoris
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="pembelianA"
                            className={`dropdown-link ${activeMenu === "pembelianA" ? "active" : ""}`}
                            onClick={() => handleMenuClick("pembelianA")}
                          >
                            Pembelian Aksesoris A
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="pembelianB"
                            className={`dropdown-link ${activeMenu === "pembelianb" ? "active" : ""}`}
                            onClick={() => handleMenuClick("pembelianb")}
                          >
                            Pembelian Aksesoris B
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="stok-aksesoris"
                            className={`dropdown-link ${activeMenu === "stok-aksesoris" ? "active" : ""}`}
                            onClick={() => handleMenuClick("stok-aksesoris")}
                          >
                            Stok Aksesoris
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="petugas-c"
                            className={`dropdown-link ${activeMenu === "petugas-c" ? "active" : ""}`}
                            onClick={() => handleMenuClick("petugas-c")}
                          >
                            Pemesanan Aksesoris 
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="petugas-d"
                            className={`dropdown-link ${activeMenu === "petugas-d" ? "active" : ""}`}
                            onClick={() => handleMenuClick("petugas-d")}
                          >
                           Detail Pemesanan Aksesoris 
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>


                    </>
                  )}
                </ul>
              )}

              
            </li>
          <li>
              <div onClick={toggleCuttingMenu} className={`sidebar-link dropdown-toggle ${activeMenu === "cutting" ? "active" : ""}`}>
                <FaCogs className="icon" /> CUTTING
                <span className={`arrow ${isCuttingOpen ? "open" : ""}`}>{isCuttingOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
              </div>
              {isCuttingOpen && (
                <ul className="dropdown-menu">
                 
                 
                  <li>
                    <Link to="tukangCutting" className={`dropdown-link ${activeMenu === "tukangCutting" ? "active" : ""}`} onClick={() => handleMenuClick("tukangCutting")}>
                     Tukang Cutting
                    </Link>
                  </li>
                  
                  <li>
                    <Link to="markeran" className={`dropdown-link ${activeMenu === "markeran" ? "active" : ""}`} onClick={() => handleMenuClick("markeran")}>
                      Markeran Produk
                    </Link>
                  </li>
                  <li>
                    <Link to="spkcutting" className={`dropdown-link ${activeMenu === "spkcutting" ? "active" : ""}`} onClick={() => handleMenuClick("spkcutting")}>
                      SPK 
                    </Link>
                  </li>
                  <li>
                    <Link to="hasilcutting" className={`dropdown-link ${activeMenu === "hasilcutting" ? "active" : ""}`} onClick={() => handleMenuClick("hasilcutting")}>
                      Hasil 
                    </Link>
                  </li>
                   <li>
                    <Link to="hutangc" className={`dropdown-link ${activeMenu === "hutangc" ? "active" : ""}`} onClick={() => handleMenuClick("hutangc")}>
                      Hutang 
                    </Link>
                  </li>
                    <li>
                    <Link to="cashboanc" className={`dropdown-link ${activeMenu === "cashboanc" ? "active" : ""}`} onClick={() => handleMenuClick("cashboanc")}>
                      Cashboan 
                    </Link>
                  </li>
                  
                   <li>
                    <Link to="pendapatancutting" className={`dropdown-link ${activeMenu === "pendapatancutting" ? "active" : ""}`} onClick={() => handleMenuClick("pendapatancutting")}>
                      Pendapatan 
                    </Link>
                  </li>
                    <li>
                    <Link to="pendapatanhistory" className={`dropdown-link ${activeMenu === "pendapatanhistory" ? "active" : ""}`} onClick={() => handleMenuClick("pendapatanhistory")}>
                      History Pendapatan
                    </Link>
                  </li>
                </ul>
              )}            
          </li>   

           <li>
              <div onClick={toggleJasaMenu} className={`sidebar-link dropdown-toggle ${activeMenu === "jasa" ? "active" : ""}`}>
                <FaCogs className="icon" /> JASA
                <span className={`arrow ${isJasaOpen ? "open" : ""}`}>{isJasaOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
              </div>
              {isJasaOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="tukangJasa" className={`dropdown-link ${activeMenu === "tukangJasa" ? "active" : ""}`} onClick={() => handleMenuClick("tukangJasa")}>
                      Tukang Jasa
                    </Link>
                  </li>
                  
                  <li>
                    <Link to="spkjasa" className={`dropdown-link ${activeMenu === "spkjasa" ? "active" : ""}`} onClick={() => handleMenuClick("spkjasa")}>
                      Spk Jasa
                    </Link>
                  </li>

                    <li>
                    <Link to="hasiljasa" className={`dropdown-link ${activeMenu === "hasiljasa" ? "active" : ""}`} onClick={() => handleMenuClick("hasiljasa")}>
                       Hasil Jasa
                    </Link>
                  </li>

                   <li>
                    <Link to="cashboanjasa" className={`dropdown-link ${activeMenu === "cashboanjasa" ? "active" : ""}`} onClick={() => handleMenuClick("cashboanjasa")}>
                      Cashboan
                    </Link>
                  </li>

                  <li>
                    <Link to="hutangjasa" className={`dropdown-link ${activeMenu === "hutangjasa" ? "active" : ""}`} onClick={() => handleMenuClick("hutangjasa")}>
                      Hutang
                    </Link>
                  </li>

                    <li>
                    <Link to="pendapatanjasa" className={`dropdown-link ${activeMenu === "pendapatanjasa" ? "active" : ""}`} onClick={() => handleMenuClick("pendapatanjasa")}>
                      Pendapatan
                    </Link>
                  </li>
                <li>
                    <Link to="pendapatanhistoryjasa" className={`dropdown-link ${activeMenu === "pendapatanhistoryjasa" ? "active" : ""}`} onClick={() => handleMenuClick("pendapatanhistoryjasa")}>
                      History Pendapatan
                    </Link>
                  </li>
                </ul>
              )}            
          </li>   



          <li>
              <div onClick={toggleHppMenu} className={`sidebar-link dropdown-toggle ${activeMenu === "hpp" ? "active" : ""}`}>
                <FaCogs className="icon" /> Produk
                <span className={`arrow ${isHppOpen ? "open" : ""}`}>{isHppOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
              </div>
              {isHppOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="hppProduk" className={`dropdown-link ${activeMenu === "hppProduk" ? "active" : ""}`} onClick={() => handleMenuClick("hppProduk")}>
                      Hpp Produk
                    </Link>
                  </li>
                  
                  
                </ul>
              )}            
          </li>     

          
          <li>
              <div onClick={togglePackingMenu} className={`sidebar-link dropdown-toggle ${activeMenu === "packing" ? "active" : ""}`}>
                <FaCogs className="icon" /> Packing
                <span className={`arrow ${isPackingOpen ? "open" : ""}`}>{isPackingOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
              </div>
              {isPackingOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="packing" className={`dropdown-link ${activeMenu === "packing" ? "active" : ""}`} onClick={() => handleMenuClick("packing")}>
                      Packing
                    </Link>
                  </li>
                   <li>
                    <Link to="logs" className={`dropdown-link ${activeMenu === "hppProduk" ? "active" : ""}`} onClick={() => handleMenuClick("logs")}>
                      History scan
                    </Link>
                  </li>
                  
                  
                </ul>
              )}            
          </li>     


          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;