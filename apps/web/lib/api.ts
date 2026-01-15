import axios from 'axios';
import Cookies from 'js-cookie';

// 1. Buat Instance Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', // Alamat Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor (Satpam Otomatis)
// Sebelum request terbang, selipkan Token dari Cookie ke Header
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token'); // Ambil token yg kita simpan pas login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Interceptor Response (Penanganan Error Global)
// Kalau token kadaluarsa (401), tendang ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      // Redirect manual ke login (karena ini bukan komponen React)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;