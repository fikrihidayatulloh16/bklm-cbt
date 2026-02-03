// app/providers.tsx
'use client'

import { NextUIProvider } from '@nextui-org/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({children}: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Data dianggap "fresh" selama 1 menit (tidak request ulang)
        staleTime: 60 * 1000, 
        // Jika user pindah window lalu balik, jangan refresh otomatis (opsional, bagus utk ujian)
        refetchOnWindowFocus: false, 
      },
    },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </QueryClientProvider>
  )
}