import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ✅ 1. Buat Instance Khusus Logger (PENTING!)
// Kita butuh instance terpisah agar request log tidak ikut di-intercept oleh logic di bawahnya (mencegah infinite loop)
const loggerApi = axios.create({
  baseURL: API_URL,
});

// ✅ 2. Instance Utama Aplikasi
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Pasang stopwatch (metadata)
    (config as any).metadata = { startTime: new Date().getTime() };
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => {
    const config = response.config as any;
    
    // Hitung durasi jika metadata ada
    if (config.metadata) {
        const endTime = new Date().getTime();
        const duration = endTime - config.metadata.startTime;

        // Logic RUM: Lapor jika lambat (> 300ms)
        if (duration > 300) { 
           sendReportToBackend(response.config.url, duration);
        }
    }

    // ✅ ERROR 1 FIXED: WAJIB me-return response!
    // Kalau ini lupa, frontend akan error "undefined" saat terima data.
    return response; 
  },
  (error) => {
    // Handle 401 (Unauthorized)
    if (error.response?.status === 401) {
      Cookies.remove('token', { path: '/' }); 
      if (typeof window !== 'undefined') {
        window.location.href = '/login'; 
      }
    }

    // Tetap lapor latency meskipun error
    if (error.config && (error.config as any).metadata) {
       const endTime = new Date().getTime();
       const duration = endTime - (error.config as any).metadata.startTime;
       sendReportToBackend(error.config.url, duration);
    }

    return Promise.reject(error);
  }
);

// --- Helper Function ---
function sendReportToBackend(path: string | undefined, duration: number) {
    // Ambil info koneksi user (experimental API, perlu safety check)
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const effectiveType = connection ? connection.effectiveType : 'unknown';

    // ✅ ERROR 2 FIXED: Menggunakan loggerApi yang sudah didefinisikan di atas
    loggerApi.post('/client-log', {
        path: path || 'unknown-path',
        duration: duration,
        connectionType: effectiveType 
    // ✅ ERROR 3 FIXED: Memberikan tipe 'any' pada error catch
    }).catch((err: any) => console.error("Gagal kirim log metrics:", err));
}

export default api;