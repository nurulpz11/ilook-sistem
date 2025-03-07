import React, { useEffect, useState } from "react";
import { Doughnut, Pie } from "react-chartjs-2";
import "chart.js/auto"; // Pastikan ini diimport agar chart bisa berfungsi
import './Home.css';
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Tambahkan ini
import ChartDataLabels from 'chartjs-plugin-datalabels';
import API from "../../api"; 

import {   } from 'react-icons/fa';


const Home = () => {
  const [spkData, setSpkData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState([]); 
  const [sisaProdukChart, setSisaProdukChart] = useState(null);

  const navigate = useNavigate(); // Inisialisasi useNavigate

  
  useEffect(() => {
    const fetchSpkData = async () => {
      try {
        const response = await API.get("/spkcmt", {
          params: { allData: true },
        });
        setSpkData(response.data);
      } catch (error) {
        console.error("Error fetching SPK data:", error);
      }
    };
  
    fetchSpkData();
  }, []);
  

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await API.get("/kinerja-cmt");
        const apiData = response.data;

        // Prepare data for pie chart
        const labels = Object.keys(apiData);
        const values = labels.map((key) => apiData[key].rata_rata);

        setChartData({
          labels,
          datasets: [
            {
              label: "Rata-rata Kinerja",
              data: values,
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  
 
  useEffect(() => {
    const fetchCategoryCount = async () => {
      try {
        const response = await API.get("/kinerja-cmt/kategori-count-by-penjahit"
        );
        const categoryData = response.data;

        // Siapkan data untuk Pie Chart
        const labels = Object.keys(categoryData); // ['A', 'B', 'C', 'D']
        const values = Object.values(categoryData).map((item) => item.count); // [1, 1, 0, 0]
        const percentages = Object.values(categoryData).map(
          (item) => item.percentage
        ); // [50, 50, 0, 0]

        setChartData({
          labels,
          datasets: [
            {
              label: "Jumlah Penjahit",
              data: values,
              backgroundColor: ["#789DBC", "#FFB0B0", "#C9E9D2", "#FFF8DE"],
              hoverBackgroundColor: [
                "#5B82A3",
                "#ED9292",
                "#9AE2AE",
                "#ECE1BB",
              ],
            },
          ],
        });

        // Simpan info kategori untuk ditampilkan di samping chart
        const info = labels.map((label, index) => ({
          label,
          percentage: percentages[index],
        }));
        setCategoryInfo(info);
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };

    fetchCategoryCount();
  }, []);
  
  useEffect(() => {
  const fetchSisaProdukData = async () => {
    try {
      const response = await API.get("/kemampuan-cmt");
      const data = response.data;

      // Hitung jumlah kategori
      let overloadCount = 0, underloadCount = 0, normalCount = 0;

      Object.values(data).forEach(item => {
        if (item.kategori_sisa_produk === "Overload") overloadCount++;
        else if (item.kategori_sisa_produk === "Underload") underloadCount++;
        else normalCount++;
      });

      // Siapkan data untuk Pie Chart
      setSisaProdukChart({
        labels: ["Overload", "Underload", "Normal"],
        datasets: [
          {
            label: "Kategori Sisa Produk",
            data: [overloadCount, underloadCount, normalCount],
            backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"], // Warna kategori
            hoverBackgroundColor: ["#E74C3C", "#F1C40F", "#3498DB"],
          },
        ],
      });

    } catch (error) {
      console.error("Error fetching sisa produk data:", error);
    }
  };

  fetchSisaProdukData();
}, []);


  const inProgressCount = spkData.filter(
    (item) => item.status === "In Progress"
  ).length;
  const pendingCount = spkData.filter((item) => item.status === "Pending").length;
  const completedCount = spkData.filter((item) => item.status === "Completed")
    .length;

  // Breakdown data untuk In Progress berdasarkan warna
  const inProgressRed = spkData.filter(
    (item) => item.status === "In Progress" && item.status_with_color?.color === "red"
  ).length;
  
  const inProgressBlue = spkData.filter(
    (item) => item.status === "In Progress" && item.status_with_color?.color === "blue"
  ).length;
  
  const inProgressGreen = spkData.filter(
    (item) => item.status === "In Progress" && item.status_with_color?.color === "green"
  ).length;
  

  // Data untuk Donut Chart
  const donutData = {
    labels: ["Periode 1", "Periode 2", "Lebih dari 2 periode"],
    datasets: [
      {
        label: "In Progress Breakdown",
        data: [inProgressRed, inProgressBlue, inProgressGreen],
        backgroundColor: ["#EAC98D", "#A0DCDC", "#DCA5A0"],
        hoverBackgroundColor: ["#E4B255", "#53CCCC", "#E58D85"],
      },
    ],
  };


  const handleChartClick = (event, elements) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const selectedCategory = ["Overload", "Underload", "Normal"][index];
      navigate(`/kinerja2?filter=${selectedCategory.toLowerCase()}`);
    }
  };
  

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          position: "bottom",
        },
      },
      datalabels: {
        color: "#fff", // Warna teks label
        anchor: "center", // Posisi teks di tengah
        align: "center",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value, context) => {
          return value; // Menampilkan angka kategori
        },
      },
    },
    onClick: handleChartClick,
  };
  

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
                <div className="card-icon" style={{ backgroundColor: '#88BC78' }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="card-content">
                  <h2>Completed</h2>
                  <p className="value">{completedCount}</p>
                </div>
              </div>
            </div>

            <div className="charts-wrapper">
              {/* Kontainer untuk donut chart */}
              <div className="chart-container">
                <div className="chart-card card">
                  <h2 className="chart-title">In Progress</h2>
                  <div className="chart-content">
                  <Doughnut data={donutData} options={donutOptions}   />
                  </div>
                </div>
              </div>

              {/* Kontainer untuk pie chart */}
              <div className="chart-container">
                {chartData && (
                  <div className="chart-card card">
                    <h2 className="chart-title">Kinerja Penjahit</h2>
                    <div className="chart-content">
                      <Pie data={chartData} options={chartOptions} />
                      <div className="chart-info">
                        {categoryInfo.map((item) => (
                          <div key={item.label} className="info-item">
                            <span
                              className="info-color"
                              style={{
                                backgroundColor:
                                  chartData.datasets[0].backgroundColor[
                                    chartData.labels.indexOf(item.label)
                                  ],
                              }}
                            ></span>
                            <span className="info-label">{item.label}</span>
                            <span className="info-percentage">{item.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="chart-container">
        {sisaProdukChart && (
          <div className="chart-card card">
            <h2 className="chart-title">Sisa Produk CMT</h2>
            <div className="chart-content">
            <Pie data={sisaProdukChart} options={chartOptions} plugins={[ChartDataLabels]} />

            </div>
    </div>
  )}
</div>

            </div>







          </div> 
    </div>
  
  );
};

export default Home;
