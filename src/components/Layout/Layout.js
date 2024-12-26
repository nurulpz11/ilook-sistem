import React, { useState } from 'react';
import './Layout.css';
import { Link, Outlet } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaHome, FaFolder, FaCogs, FaScissors } from 'react-icons/fa';

const Layout = () => {
  const [isCmtOpen, setIsCmtOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home"); // Tambahkan state untuk menu aktif

  const toggleCmtMenu = () => {
    setIsCmtOpen(!isCmtOpen);
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu); // Atur menu yang aktif
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>
            <span className="sidebar-logo">🚀</span> Ilook Fashion
          </h3>
        </div>
        <nav className="sidebar-menu">
          <ul>
            <li>
              <Link
                to="/home"
                className={`sidebar-link ${activeMenu === "home" ? "active" : ""}`}
                onClick={() => handleMenuClick("home")}
              >
                <FaHome className="icon" /> Dashboard
              </Link>
            </li>
            <li>
              <div
                onClick={() => {
                  toggleCmtMenu();
                  handleMenuClick("cmt");
                }}
                className={`sidebar-link dropdown-toggle ${activeMenu === "cmt" ? "active" : ""}`}
              >
                 <FaCogs className="icon" /> CMT {/* Ikon untuk menu CMT */}
                <span className={`arrow ${isCmtOpen ? "open" : ""}`}>
                  {isCmtOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              {isCmtOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      to="penjahit"
                      className={`dropdown-link ${activeMenu === "penjahit" ? "active" : ""}`}
                      onClick={() => handleMenuClick("penjahit")}
                    >
                      Penjahit
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="spk"
                      className={`dropdown-link ${activeMenu === "spk" ? "active" : ""}`}
                      onClick={() => handleMenuClick("spk")}
                    >
                      SPK
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link
                to="/gudang"
                className={`sidebar-link ${activeMenu === "gudang" ? "active" : ""}`}
                onClick={() => handleMenuClick("gudang")}
              >
               <FaFolder className="icon" /> Dashboard
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h4></h4>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
