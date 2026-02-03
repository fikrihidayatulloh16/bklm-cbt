import { Controller, Post, Body, Logger } from '@nestjs/common';

@Controller('client-log') // Endpoint jadi: POST /api/client-log
export class ClientLoggerController {
  // Kita namai loggernya 'ClientRUM' biar mudah difilter di Grafana nanti
  private readonly logger = new Logger('ClientRUM');

  @Post()
  logClientMetric(@Body() body: any) {
    // Validasi sederhana: pastikan ada path dan duration
    if (!body.path || !body.duration) return;

    // Log level 'log' atau 'verbose'
    this.logger.log(
      `[LATENCY] ${body.path} - ${body.duration}ms - Conn: ${body.connectionType || 'Unknown'}`,
    );

    // Return sukses kosong agar hemat bandwidth
    return { success: true };
  }
}