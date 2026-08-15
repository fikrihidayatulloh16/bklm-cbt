// apps/web/components/providers/RealtimeSyncProvider.tsx
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket'; // Sesuaikan dengan lokasi inisiasi socket Anda
import { getKeysToInvalidate } from '@/lib/config/realtime-mapper.config';

interface RealtimeSyncProviderProps {
  userId?: string;
  children: React.ReactNode;
}

export const RealtimeSyncProvider = ({ userId, children }: RealtimeSyncProviderProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    // 1. Buat fungsi khusus untuk mengetuk pintu room
    const joinRoom = () => {
      console.log(`🚪 [WebSocket] Meminta masuk ke room: user-${userId}`);
      socket.emit('join_volatile_room', `user-${userId}`);
    };

    // 2. Jika saat ini SUDAH connect, langsung join.
    if (socket.connected) {
      joinRoom();
    }

    // 3. Jika BARU connect (atau RECONNECT setelah putus), selalu join ulang!
    socket.on('connect', joinRoom);

    // 4. Tangkap sinyal data berubah
    const handleDataUpdated = (payload: { entity: string; timestamp: number }) => {
      console.log(`🔥 [WebSocket] Sinyal DITERIMA! Payload:`, payload);
      
      const keys = getKeysToInvalidate(payload.entity, userId);
      keys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    };

    socket.on('data_updated', handleDataUpdated);

    // 5. Buka koneksi jika belum terbuka
    if (!socket.connected) {
      socket.connect();
    }

    // 6. Cleanup saat komponen dibongkar
    return () => {
      socket.off('connect', joinRoom);
      socket.off('data_updated', handleDataUpdated);
    };
  }, [userId, queryClient]);

  // Kembalikan anak-anak komponen apa adanya
  return <>{children}</>;
};