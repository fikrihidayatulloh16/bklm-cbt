import axios from 'axios';
import Cookies from 'js-cookie';

// ✅ Gunakan Environment Variable lagi (karena build laptop sudah benar)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    // 🗑️ HAPUS LOG DEBUGGING DISINI (yang console.log roket/cookie tadi)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ KEMBALIKAN LOGIKA REDIRECT (Hapus Alert)
    if (error.response?.status === 401) {
      Cookies.remove('token', { path: '/' }); // Pastikan path '/' dihapus
      if (typeof window !== 'undefined') {
        window.location.href = '/login'; // Tendang ke login dengan sopan
      }
    }
    return Promise.reject(error);
  }
);

export default api;