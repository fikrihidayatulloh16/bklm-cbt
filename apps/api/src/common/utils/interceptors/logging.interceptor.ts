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
// import { v4 as uuidv4 } from 'uuid'; // Fallback tidak perlu UUID berat, kita pakai Date.now() saja untuk lokal

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    const method = req.method;
    const url = req.url;

    // --- 1. TANGKAP REQUEST ID DARI NGINX ---
    // Nginx mengirimkan header dengan format huruf kecil (x-request-id)
    const requestId = req.headers['x-request-id'] || `dev-${Date.now()}`;

    // --- 2. Logika IP Cloudflare ---
    const rawIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip;
    const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp?.split(',')[0] || req.ip;

    const now = Date.now();

    // --- 3. Persiapan Auth ---
    const user = req.user ? `${req.user.id} (${req.user.email})` : 'Guest';

    return next.handle().pipe(
      // TAP: SUKSES (200/201)
      tap(() => {
        const duration = Date.now() - now;
        
        // 👇 UBAH STRING MENJADI JSON OBJECT
        const logData = JSON.stringify({
          action: 'request_in',
          req_id: requestId,
          method: method,
          url: url,
          status: res.statusCode,
          ip: ip,
          user: user,
          duration_ms: duration,
        });
        this.logger.log(logData);
      }),

      // CATCHERROR: GAGAL (4xx / 5xx)
      catchError((error) => {
        const duration = Date.now() - now;
        const statusCode = error instanceof HttpException ? error.getStatus() : 500;
        const errorMessage = error.message || 'Internal server error';

        // 👇 BUAT OBJECT ERROR
        const errorLog = JSON.stringify({
          action: 'request_error',
          req_id: requestId,
          method: method,
          url: url,
          status: statusCode,
          ip: ip,
          user: user,
          duration_ms: duration,
          error_msg: errorMessage,
        });

        if (statusCode >= 500) {
          this.logger.error(errorLog, error.stack);
        } else {
          this.logger.warn(errorLog);
        }

        return throwError(() => error);
      }),
    );
  }
}

//                              =======================
//                                    JIKA ADA GRPC
//                              =======================

// const type = context.getType(); // Bisa berisi 'http', 'rpc' (gRPC), atau 'graphql'

// if (type === 'http') {
//    // ... logika HTTP yang kita buat tadi
// } else if (type === 'rpc') {
//    // Logika gRPC
//    const rpcContext = context.switchToRpc();
//    const data = rpcContext.getData(); // Payload gRPC
   
//    this.logger.log({
//       action: 'grpc_request',
//       service: context.getClass().name,
//       method: context.getHandler().name,
//       // Metadata/Header gRPC diambil dengan cara berbeda, bukan req.headers
//    });
// }