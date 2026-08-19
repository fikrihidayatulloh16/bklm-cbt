// apps/web/components/providers/RealtimeSyncProvider.tsx
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { getKeysToInvalidate } from '@/lib/config/realtime-mapper.config';

interface RealtimeSyncProviderProps {
  userId?: string;
  schoolId?: string; // 👈 Pastikan ini ada (Sudah Anda buat)
  children: React.ReactNode;
}

export const RealtimeSyncProvider = ({ userId, schoolId, children }: RealtimeSyncProviderProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    const joinRoom = () => {
      console.log(`🚪 [WebSocket] Meminta masuk ke room user`);
      socket.emit('join_volatile_room user');
      
      // 1. Masuk ke ruangan (room) sekolah bersama guru-guru lain
      if (schoolId) {
        console.log(`🏫 [WebSocket] Meminta masuk ke room sekolah`);
        socket.emit('join_volatile_room sekolah'); 
      }
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on('connect', joinRoom);

    const handleDisconnect = (reason: string) => {
      console.warn(`⚠️ [WebSocket] Terputus: ${reason}. Akan mencoba reconnect...`);
    };
    socket.on('disconnect', handleDisconnect);

    const handleDataUpdated = (payload: { entity: string; timestamp: number }) => {
      console.log(`🔥 [WebSocket] Sinyal DITERIMA!`);

      console.log(`Nama Entity diterima`);
      
      // 👈 2. LEMPAR schoolId KE SINI!
      const keys = getKeysToInvalidate(payload.entity, userId, schoolId); 

      console.log(`🎯 Kunci (Keys) yang akan dihancurkan React Query:`, keys);
      
      keys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    };

    socket.on('data_updated', handleDataUpdated);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect', joinRoom);
      socket.off('disconnect', handleDisconnect);
      socket.off('data_updated', handleDataUpdated);
    };
    
  // 👈 3. WAJIB TAMBAHKAN schoolId KE DEPENDENCY ARRAY INI!
  }, [userId, schoolId, queryClient]); 

  return <>{children}</>;
};