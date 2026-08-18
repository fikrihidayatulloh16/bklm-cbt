// apps/api/src/schools/ports/school.repository.interface.ts
import { SchoolDomain } from '../entities/school.entity'

export const I_SCHOOL_REPOSITORY = 'ISchoolRepository';

export abstract class ISchoolRepository {
    abstract createSchool(school: SchoolDomain): Promise<SchoolDomain>;
    abstract findAllSchool(): Promise<SchoolDomain[]>;
    abstract findDetailSchoolBySchoolId(id: string): Promise<SchoolDomain | null>;
}
