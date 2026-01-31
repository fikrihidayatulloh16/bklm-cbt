import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // Kita beri context 'HTTP' agar di log terlihat rapi
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 1. Ambil Data Request Masuk
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('user-agent') || '';
    // const ip = req.headers['cf-connecting-ip'] || 
    //        req.headers['x-forwarded-for'] || 
    //        req.connection.remoteAddress;

    // 👇 LOGIKA IP CLOUDFLARE
    // Ambil IP asli walaupun lewat proxy
    const rawIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip;
    // Kadang x-forwarded-for isinya banyak "ip1, ip2, ip3", kita ambil yang pertama
    const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp?.split(',')[0] || req.ip;

    // Catat waktu mulai (untuk hitung durasi/performance)
    const now = Date.now();

    // 2. Proses Request & Tunggu Selesai
    return next.handle().pipe(
      tap(() => {
        // 3. Request Selesai, Hitung Durasi
        const duration = Date.now() - now;

        // PERSIAPAN AUTH (Nanti otomatis terisi kalau JWT sudah jalan)
        const user = req.user ? `${req.user.id} (${req.user.email}) (${req.user.role})` : 'Guest';
 
        
        // Ambil User ID jika sudah login (dari JWT nanti)
        // const userId = req.user?.id || 'Guest'; 
        
        // 4. Tulis ke Log (JSON Format via Winston)
        this.logger.log(`Incoming Request`, {
          method,
          url,
          ip,
          user,
          duration: `${duration}ms`,
          userAgent,
          // user: userId, // Aktifkan nanti kalau Auth sudah jalan
        });
      }),
    );
  }
}