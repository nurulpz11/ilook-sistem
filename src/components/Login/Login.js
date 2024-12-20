import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Login.css";
import Logo from "../../assets/images/Logo.jpg";

const Login = () => {
  const navigate = useNavigate(); // Inisialisasi hook navigate
  const [email, setEmail] = useState(""); // State untuk email
  const [password, setPassword] = useState(""); // State untuk password

  const handleLogin = (e) => {
    e.preventDefault();

    // Logika login sementara: jika email dan password cocok, arahkan ke halaman home
    if (email && password) {
      navigate("/Home"); // Arahkan ke halaman Home jika login sukses
    } else {
      alert("Email atau password tidak boleh kosong!");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image">
          <img src={Logo} alt="Logo" />
        </div>
        <div className="login-form-container">
          <h1 className="login-title">Login</h1>
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Masukkan email anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update state email
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Masukkan password anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update state password
              />
            </div>
            <button type="submit" className="btn-create-account">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
