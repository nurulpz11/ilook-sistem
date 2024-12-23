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
                <h2>Welcome</h2>
                <p>Please login to your account</p>
                <form onSubmit={handleLogin} className="login-form">
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Email" 
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
                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;