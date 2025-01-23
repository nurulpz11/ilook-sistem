import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto"; // Pastikan ini diimport agar chart bisa berfungsi
import './Home.css';

import {   } from 'react-icons/fa';


const Home = () => {
  const [spkData, setSpkData] = useState([]);

  useEffect(() => {
    // Simulasi fetch data dari API
    fetch('http://localhost:8000/api/spkcmt')
      .then(response => response.json())
      .then(data => setSpkData(data));
  }, []);

  const inProgressCount = spkData.filter(
    (item) => item.status === "In Progress"
  ).length;
  const pendingCount = spkData.filter((item) => item.status === "Pending").length;
  const completedCount = spkData.filter((item) => item.status === "Completed")
    .length;

  // Breakdown data untuk In Progress berdasarkan warna
  const inProgressRed = spkData.filter(
    (item) => item.status_with_color?.color === "red"
  ).length;
  const inProgressBlue = spkData.filter(
    (item) => item.status_with_color?.color === "blue"
  ).length;
  const inProgressGreen = spkData.filter(
    (item) => item.status_with_color?.color === "green"
  ).length;

  // Data untuk Donut Chart
// Data untuk Donut Chart
const donutData = {
  labels: ["Periode 1", "Periode 2", "Lebih dari 2 periode"],
  datasets: [
    {
      label: "In Progress Breakdown",
      data: [inProgressRed, inProgressBlue, inProgressGreen],
      backgroundColor: ["#FF6384", "#36A2EB", "#4CAF50"],
      hoverBackgroundColor: ["#FF6384", "#36A2EB", "#4CAF50"],
    },
  ],
};

// Opsi untuk Chart
const chartOptions = {
  plugins: {
    legend: {
      labels: {
        usePointStyle: true, // Gunakan lingkaran untuk label
        pointStyle: "circle", // Bentuk lingkaran
      },
    },
  },
};


  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
      </header>
        
         <div className="dashboard-content">
            {/* Kontainer untuk card-animate */}
            <div className="card-container">
              <div className="card card-animate">
                <div className="card-icon" style={{ backgroundColor: '#d9af5e' }}>
                  <i className="fas fa-tasks"></i>
                </div>
                <div className="card-content">
                  <h2>In Progress</h2>
                  <p className="value">{inProgressCount}</p>
                </div>
              </div>
              <div className="card card-animate">
                <div className="card-icon" style={{ backgroundColor: '#d26b75' }}>
                  <i className="fas fa-clock"></i>
                </div>
                <div className="card-content">
                  <h2>Pending</h2>
                  <p className="value">{pendingCount}</p>
                </div>
              </div>
              <div className="card card-animate">
                <div className="card-icon" style={{ backgroundColor: '#74a474' }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="card-content">
                  <h2>Completed</h2>
                  <p className="value">{completedCount}</p>
                </div>
              </div>
            </div>

            {/* Kontainer untuk chart-card */}
            <div className="chart-container">
              <div className="chart-card card">
                <h2 className="chart-title">In Progress </h2>
                <Doughnut data={donutData} options={chartOptions} />

              </div>
            </div>
          </div>
 
       
    </div>
  
  );
};

export default Home;
