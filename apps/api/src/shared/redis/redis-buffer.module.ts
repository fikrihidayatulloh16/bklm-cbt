import { Global, Module } from '@nestjs/common';
import { RedisBufferService } from './redis.buffer.service';

@Global() // Ini membuat module ini berlaku seperti 'shared crate' yang bisa diakses dari mana saja
@Module({
  providers: [RedisBufferService],
  exports: [RedisBufferService], // Wajib di-export agar bisa disuntikkan ke service lain
})
export class RedisBufferModule {}