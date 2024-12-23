import React from 'react';
import './Layout.css';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Ilook Fashion</h3>
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
              <Link to="/gudang" className="sidebar-link">Gudang</Link>
            </li>
            <li className="sidebar-link disabled">Disabled Menu</li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h1>Welcome to Ilook Fashion</h1>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
