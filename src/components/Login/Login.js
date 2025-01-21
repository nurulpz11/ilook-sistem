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
            const response = await axios.post('http://localhost:8000/api/login', { email, password });
            console.log(response.data.token); // Simpan token sesuai kebutuhan (localStorage, state management)

            // Arahkan ke halaman Home setelah login berhasil
            navigate('/home');
        } catch (error) {
            console.error(error.response.data);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src="/path/to/logo.png" alt="" className="logo" />
                    <h1>ILOOK ADMIN </h1>
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
                        <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
                    </div>
                    <button type="submit" className="login-button">Sign In</button>
                </form>
                <div className="login-footer">
                    <p>New to Spike? <a href="/register">Create an account</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
