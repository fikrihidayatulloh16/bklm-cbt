import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { ISchoolRepository } from './ports/school.repository.interface';
import { SchoolRepository } from './adapter/school.prisma.repository';

@Module({
  controllers: [SchoolsController],
  providers: [
    SchoolsService,
    {
      provide: 'ISchoolRepository',      // Kunci DI (Port)
      useClass: SchoolRepository // Mesin sesungguhnya (Adapter)
    },
  ],
})
export class SchoolsModule {}
