
import React, { useEffect, useState } from 'react';
import './Home.css';

const Home = () => {
  const [spkData, setSpkData] = useState([]);

  useEffect(() => {
    // Simulasi fetch data dari API
    fetch('http://localhost:8000/api/spkcmt')
      .then(response => response.json())
      .then(data => setSpkData(data));
  }, []);


  const inProgressCount = spkData.filter(item => item.status === 'In Progress').length;
  const pendingCount = spkData.filter(item => item.status === 'Pending').length;
  const completedCount = spkData.filter(item => item.status === 'Completed').length;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        
      </header>

      <div className="dashboard-content">
        <div className="card card-animate">
          <h2>In Progress</h2>
          <p className="value">{inProgressCount}</p>
        </div>
        <div className="card card-animate">
          <h2>Pending</h2>
          <p className="value">{pendingCount}</p>
        </div>
        <div className="card card-animate">
          <h2>Completed</h2>
          <p className="value">{completedCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;