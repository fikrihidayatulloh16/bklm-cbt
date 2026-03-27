// apps/web/lib/socket.ts
import { io, Socket } from "socket.io-client";

// 1. Ambil URL API dari environment
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// 2. KECERDASAN BUATAN UNTUK HOST:
// Jika apiUrl berawalan 'http' (Misal: http://localhost:3000/api saat koding lokal)
//    -> Kita potong dan ambil 'http://localhost:3000' saja sebagai host-nya.
// Jika apiUrl HANYA '/api' (Saat di VPS/Docker dengan Nginx)
//    -> Kita jadikan 'undefined' agar Socket.io otomatis menggunakan domain VPS saat ini.
const SOCKET_HOST = apiUrl.startsWith("http") 
  ? new URL(apiUrl).origin 
  : undefined;

let socket: Socket;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_HOST, {
      
      // Path ini tetap absolut dan konsisten di semua environment!
      path: '/api/socket.io', 
      
      transports: ["polling", "websocket"], 
      withCredentials: true,
      
      // (Opsional) Konfigurasi stabilitas yang baik untuk Production
      reconnectionAttempts: 7,
      reconnectionDelay: 1000,
      autoConnect: false,
    });
  }
  return socket;
};