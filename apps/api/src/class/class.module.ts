import { Module } from '@nestjs/common';
import { ClassController } from './class.controller'; // (Kurir REST - Kita buat setelah ini)
import { ClassService } from './class.service';
import { IClassRepository } from './class.repository.port';
import { ClassPrismaRepository } from './class.prisma.repository';
// Import modul Prisma Anda (Misal: PrismaModule atau biarkan jika Anda jadikan Global)

@Module({
  controllers: [ClassController], // Nanti gRPC controller juga ditambahkan di sini
  providers: [
    ClassService,
    {
      provide: IClassRepository,      // Kunci DI (Port)
      useClass: ClassPrismaRepository // Mesin sesungguhnya (Adapter)
    },
  ],
  exports: [ClassService], // Export jika modul lain (seperti Assessment) butuh
})
export class ClassModule {}