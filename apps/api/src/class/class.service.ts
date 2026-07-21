import { Injectable, ConflictException } from '@nestjs/common';
import { IClassRepository } from './class.repository.port';
import { CreateClassDto } from './class.dto';
import { ClassDomain } from './class.domain';

@Injectable()
export class ClassService {
  // Injeksi Port, bukan Prisma
  constructor(private readonly classRepository: IClassRepository) {}

  async createClass(dto: CreateClassDto): Promise<ClassDomain> {
    // Logika bisnis bisa diletakkan di sini.
    // Contoh: Memastikan kombinasi level, nama, dan sekolah tidak ganda
    // (Bisa mengandalkan Exception handling dari Prisma, atau melakukan pencarian spesifik terlebih dahulu).

    return this.classRepository.create(dto);
  }

  async getClassesBySchool(schoolId: string): Promise<ClassDomain[]> {
    return this.classRepository.findAllBySchool(schoolId);
  }
}