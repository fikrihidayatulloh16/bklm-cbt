// lib/socket.ts
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

let socket: Socket;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      // ✅ PAKSA WEBSOCKET (Hapus 'polling')
      transports: ["websocket"], 
      
      // Opsi tambahan untuk kestabilan
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
      
      // Kadang perlu ini jika versi socket.io client & server beda jauh (opsional)
      // allowEIO3: true, 
    });
  }
  return socket;
};