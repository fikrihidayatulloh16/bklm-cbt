import React from 'react';
import { CountdownRenderProps } from 'react-countdown';
import { Clock } from 'lucide-react'; // Pastikan import icon sesuai yang Anda pakai

export const countdownRenderer = ({ hours, minutes, seconds, completed, total }: CountdownRenderProps) => {
  if (completed) {
    // Tampilan saat waktu habis (00:00:00 Merah)
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono font-bold text-lg md:text-xl bg-danger-50 text-danger">
        <Clock size={20} />
        00:00:00
      </div>
    );
  } else {
    // Tampilan hitung mundur
    // Logic: Jika sisa waktu kurang dari 5 menit (300.000 ms), warna jadi merah & berkedip
    const isUrgent = total < 300000;

    return (
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg font-mono font-bold text-lg md:text-xl transition-colors
        ${isUrgent ? "bg-danger-50 text-danger animate-pulse" : "bg-primary-50 text-primary"}
      `}>
        <Clock size={20} />
        {/* Format jam:menit:detik dengan leading zero (01:05:09) */}
        {hours.toString().padStart(2, '0')}:
        {minutes.toString().padStart(2, '0')}:
        {seconds.toString().padStart(2, '0')}
      </div>
    );
  }
};