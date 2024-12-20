import React from 'react';
import './Layout.css';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="home-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Ilook Fashion Indonesia</h3>
        </div>
        <nav className="sidebar-menu">
          <ul>
            <li>
              <Link to="/home" className="sidebar-link">Dashboard</Link>
            </li>
            <li>
              <Link to="/jahit" className="sidebar-link">CMT</Link>
            </li>
            <li>
              Gudang
            </li>
            <li className="disabled">Disabled menu</li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet /> {/* Render konten dinamis di sini */}
      </main>
    </div>
  );
};

export default Layout;
