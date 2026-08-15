// apps/api/src/notifications/adapter/volatile-events.gateway.ts
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { DataUpdatedEvent } from '../../common/events/volatile.event';

// Bebas pakai namespace atau port sesuai konfigurasi Anda
@WebSocketGateway({
  path: '/api/socket.io', // 🚨 Kunci utamanya di sini!
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket'],
})
export class VolatileEventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join_volatile_room')
  handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.join(room); // Memasukkan client ke dalam room
    console.log(`🤝 [Volatile] Client ${client.id} mendaftar ke room: ${room}`);
    console.log(`🤝 [WebSocket] Client ${client.id} berhasil masuk ke room: ${room}`);
  }

  afterInit(server: Server) {
    console.log('🚀 [VolatileEventsGateway] Standby di Namespace /volatile');
    console.log('🚀 [VolatileEventsGateway] Berhasil diinisialisasi dan siap menerima event internal!');
  }

  // 🔥 Menangkap sinyal dari CacheRepository tanpa peduli modul mana yang memanggilnya!
  @OnEvent('volatile.data_updated')
  handleDataUpdated(event: DataUpdatedEvent) {
    console.log(`[EventBus] Entitas '${event.entity}' milik '${event.entityId}' diperbarui!`);
    console.log(`[EventBus] Menerima sinyal internal untuk entitas: ${event.entity}, ID: ${event.entityId}`);
    
    // Asumsi: Frontend bergabung ke room dengan nama `user-{ID}`
    this.server
      .to(`user-${event.entityId}`)
      .emit('data_updated', {
          entity: event.entity,
          timestamp: Date.now()
      });

    console.log(`[WebSocket] Sinyal 'data_updated' telah ditembakkan ke room: `, `user-${event.entityId}`);
  }
}