// apps/api/src/submissions/submissions.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    // 🚨 1. TAMBAHKAN PATH INI: Memaksa Socket.io pindah ke bawah payung /api
    path: '/api/socket.io',
    
    origin: true, 
    methods: ["GET", "POST"],
    credentials: true,
  },
  // ✅ Tambahkan ini agar transport websocket diizinkan eksplisit
  transports: ['websocket', 'polling'], 
})
export class SubmissionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`✅ Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client Disconnected: ${client.id}`);
  }

  // 👇 Fungsi ini yang nanti dipanggil oleh Service
  notifyNewSubmission(payload: any) {
    // Kirim sinyal ke semua orang yang sedang connect
    // Event name: 'submission:initiated' (Sesuai kesepakatan kita tadi)
    this.server.emit('submission:initiated', payload);
  }

  notifySubmissionFinished(payload: any) {
    // Event name beda: 'submission:finished'
    this.server.emit('submission:finished', payload);
  }
}