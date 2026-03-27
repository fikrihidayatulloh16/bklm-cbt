// apps/web/lib/socket.ts
import { io, Socket } from "socket.io-client";

// 1. Ambil URL API dari environment
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// 2. KECERDASAN BUATAN UNTUK HOST
const SOCKET_HOST = apiUrl.startsWith("http") 
  ? new URL(apiUrl).origin 
  : undefined;

let socket: Socket;

export const getSocket = (): Socket => {
  // Hanya buat socket dan pasang telinga (listener) JIKA socket belum ada
  if (!socket) {
    socket = io(SOCKET_HOST, {
      path: '/api/socket.io', 
      transports: ["websocket"], 
      withCredentials: true,
      reconnectionAttempts: 7,
      reconnectionDelay: 1000,
      autoConnect: false, // Ingat: Kita harus memanggil socket.connect() secara manual nanti
    });

    // 🚨 PINDAHKAN KE SINI: Pastikan listener hanya dipasang satu kali
    socket.on("connect", () => {
      console.log("✅ [SOCKET] Berhasil terhubung ke Backend! ID:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.log("❌ [SOCKET] Gagal terhubung!");
      console.dir(error); 
    });
  }
  
  return socket;
};