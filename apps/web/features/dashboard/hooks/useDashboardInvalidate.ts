// 'use client';

// import { useEffect } from 'react';
// import { useQueryClient } from '@tanstack/react-query';
// // Sesuaikan import socket dengan konfigurasi Next.js Anda
// import { socket } from '@/lib/socket'; 

// export const useLiveInvalidation = (userId: string | undefined) => {
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     // Jika belum login/userId kosong, jangan lakukan apa-apa
//     if (!userId) return;

//     // 1. Bergabung ke "Room" milik user ini (Sesuai dengan `user-${entityId}` di NestJS)
//     socket.emit('join_room', `user-${userId}`);

//     // 2. Fungsi penangkap sinyal
//     const handleDataUpdated = (payload: { entity: string; timestamp: number }) => {
//       console.log(`[WebSocket] Sinyal perubahan data diterima untuk entitas: ${payload.entity}`);

//       // 3. Hancurkan Cache TanStack Query berdasarkan nama entitas!
//       if (payload.entity === 'assessments') {
//         // Hancurkan cache dashboard stats (karena total ujian berubah)
//         queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
        
//         // (Opsional) Jika Anda punya query list terpisah, hancurkan juga
//         // queryClient.invalidateQueries({ queryKey: ['assessments-list'] });
//       }

//       if (payload.entity === 'question_banks') {
//         // Hancurkan cache dashboard stats (karena total bank soal berubah)
//         queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
//       }
//     };

//     // 4. Mulai dengarkan event dari NestJS
//     socket.on('data_updated', handleDataUpdated);

//     // 5. Cleanup saat komponen dihancurkan (mencegah memory leak / double listener)
//     return () => {
//       socket.off('data_updated', handleDataUpdated);
//     };
//   }, [queryClient, userId]); 
// };