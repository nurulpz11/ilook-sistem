import axios from "axios";


const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    Accept: "application/json", // ✅ Boleh dipertahankan
    // ❌ Hapus Content-Type biar Axios yang atur otomatis
  },
});
// Interceptor untuk menambahkan token secara otomatis di setiap request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default API;
