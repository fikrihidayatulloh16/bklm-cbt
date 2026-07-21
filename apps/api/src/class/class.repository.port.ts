import { ClassDomain } from './class.domain';
import { CreateClassDto } from './class.dto';

export abstract class IClassRepository {
  abstract create(dto: CreateClassDto): Promise<ClassDomain>;
  abstract findAllBySchool(schoolId: string): Promise<ClassDomain[]>;
}