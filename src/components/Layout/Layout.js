import React, { useState, useEffect } from 'react';
import './Layout.css';
import { Link, Outlet } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaCogs, FaChevronDown, FaChevronUp, FaFolder } from 'react-icons/fa';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCmtOpen, setIsCmtOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home"); // Tambahkan state untuk menu aktif
  const [role, setRole] = useState(""); // State untuk menyimpan role user

  useEffect(() => {
    const userRole = localStorage.getItem("role"); // Ambil role dari localStorage
    setRole(userRole);
  }, []);

  const toggleCmtMenu = () => {
    setIsCmtOpen(!isCmtOpen);
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu); 
    setIsSidebarOpen(false); 
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
                      Penjahit
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
                        <Link
                          to="ChatPage"
                          className={`dropdown-link ${activeMenu === "ChatPage" ? "active" : ""}`}
                          onClick={() => handleMenuClick("ChatPage")}
                        >
                          ChatComponent
                        </Link>
                      </li>

                    </>
                  )}
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