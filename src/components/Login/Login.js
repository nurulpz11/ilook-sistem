import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import file CSS

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });
    
            if (!response.ok) {
                throw new Error("Login gagal");
            }
           
            const data = await response.json();
            console.log("Data dari API:", data);
            console.log("Role yang akan disimpan:", data.user.role); 
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('role', data.user.role);
            
            console.log("Role dari LocalStorage setelah disimpan:", localStorage.getItem("role"));
            

            // Arahkan ke halaman Home setelah login berhasil
            navigate('/home');
        } catch (error) {
            console.error("Error login:", error.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src="/path/to/logo.png" alt="" className="logo" />
                    <h2>ILOOK ADMIN </h2>
                    <p>Please input your email and password</p>
                </div>
                <form onSubmit={handleLogin} className="login-form">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Username"
                        required
                        className="login-input"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="login-input"
                    />
                    <div className="login-options">
                        <label>
                            <input type="checkbox" />
                            Remember this Device
                        </label>
                      
                    </div>
                    <button type="submit" className="login-button">Sign In</button>
                </form>
                <div className="login-footer">
                    
                </div>
            </div>
        </div>
    );
};

export default Login;
