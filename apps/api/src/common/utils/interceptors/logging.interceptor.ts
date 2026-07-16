import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse(); // Ditambahkan untuk mengambil statusCode sukses

    const method = req.method;
    const url = req.url;
    // const userAgent = req.get('user-agent') || ''; // Bisa diaktifkan jika butuh

    // Logika IP Cloudflare (Sudah Bagus)
    const rawIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip;
    const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp?.split(',')[0] || req.ip;

    const now = Date.now();

    // Persiapan Auth (Sudah Bagus)
    const user = req.user ? `${req.user.id} (${req.user.email})` : 'Guest';

    return next.handle().pipe(
      // TAP: HANYA BERJALAN JIKA REQUEST SUKSES (200/201)
      tap(() => {
        const duration = Date.now() - now;
        const statusCode = res.statusCode;
        
        // PERBAIKAN 1: Format menggunakan Template Literal (String) agar rapi
        this.logger.log(`✅ [${method}] ${url} - ${statusCode} - ${ip} - ${user} +${duration}ms`);
      }),

      // CATCHERROR: HANYA BERJALAN JIKA REQUEST DITOLAK/GAGAL (400, 429, 403, 500)
      catchError((error) => {
        const duration = Date.now() - now;
        
        // Ambil status HTTP asli, jika bukan HTTP error, anggap 500 (Internal Server Error)
        const statusCode = error instanceof HttpException ? error.getStatus() : 500;
        const errorMessage = error.message || 'Internal server error';

        // PERBAIKAN 2: Cetak Error berdasarkan level parahnya
        if (statusCode >= 500) {
          // Error 500 dicetak MERAH (Crash / Bug Code)
          this.logger.error(`❌ [${method}] ${url} - ${statusCode} - ${ip} - ${user} +${duration}ms - ${errorMessage}`, error.stack);
        } else {
          // Error 4xx (429 Throttle, 400 Bad Request) dicetak KUNING/WARN
          this.logger.warn(`🚨 [${method}] ${url} - ${statusCode} - ${ip} - ${user} +${duration}ms - ${errorMessage}`);
        }

        // Lempar kembali errornya agar Frontend tetap menerima pesan penolakan
        return throwError(() => error);
      }),
    );
  }
}