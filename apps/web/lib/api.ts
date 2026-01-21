import axios from 'axios';
import Cookies from 'js-cookie';

// 1. Tentukan URL String-nya dulu (STRING, bukan Object)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// 2. Buat Instance Axios (Cukup Satu Kali)
const api = axios.create({
  baseURL: API_URL, // <--- Di sini sekarang isinya String URL yang benar
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Interceptor Request (Satpam Otomatis)
// (Kode ini persis sama dengan punya Anda, tidak saya ubah karena sudah benar)
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Interceptor Response (Penanganan Error Global)
// (Kode ini juga sama, logika logout otomatisnya sudah oke)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      // Redirect manual ke login
      if (typeof window !== 'undefined') {
        // Cek agar tidak looping redirect jika sudah di login page
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;