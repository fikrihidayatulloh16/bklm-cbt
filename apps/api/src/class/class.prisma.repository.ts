import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Sesuaikan path
import { IClassRepository } from './class.repository.port';
import { ClassDomain } from './class.domain';
import { CreateClassDto } from './class.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClassPrismaRepository implements IClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClassDto): Promise<ClassDomain> {
    try {
      const result = await this.prisma.class.create({
        data: {
          level: dto.level,
          name: dto.name,
          school_id: dto.school_id,
        },
      });
      
      return new ClassDomain(result.id, result.level, result.name, result.school_id);
    } catch (error) {
      // 1. Beri tahu TypeScript bahwa ini adalah error Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // 2. Sekarang TypeScript tahu bahwa error.code itu ada!
        if (error.code === 'P2002') {
          // Kita lempar error bawaan NestJS agar langsung ditangkap oleh Controller
          throw new ConflictException(`Kelas tingkat ${dto.level} dengan nama ${dto.name} sudah ada.`);
        }
      }
      // Jika error lain, lempar kembali apa adanya
      throw error;
    }
  }

  async findAllBySchool(schoolId: string): Promise<ClassDomain[]> {
    const results = await this.prisma.class.findMany({
      where: { school_id: schoolId },
    });
    
    return results.map(r => new ClassDomain(r.id, r.level, r.name, r.school_id));
  }
}