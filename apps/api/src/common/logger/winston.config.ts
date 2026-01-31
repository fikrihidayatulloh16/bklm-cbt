import { transports, format } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonUtilities } from 'nest-winston';

export const winstonConfig = {
  transports: [
    // 1. Agar tetap muncul di Terminal Laptop (Warna-warni & Cantik)
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.ms(),
        nestWinstonUtilities.format.nestLike('BKLM-API', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),

    // 2. Agar disimpan ke File (JSON Format untuk Grafana)
    // Level: 'info' (Mencatat Log Sukses & Error)
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log', // Nama file ada tanggalnya
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // File lama dikompres biar hemat size
      maxSize: '20m',      // Jika file > 20MB, bikin file baru
      maxFiles: '14d',     // Hapus log yang lebih tua dari 14 hari
      format: format.combine(
        format.timestamp(),
        format.json() 
      ),
    }),

    // 3. File Khusus Error (Biar gampang nyari bug fatal)
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',      // Cuma catat yang error
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
    }),
  ],
};