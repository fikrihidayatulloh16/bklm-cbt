import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { CacheTTL, I_CACHE_REPOSITORY, ICacheRepository } from 'src/common/cache/cache.repository.port';
import { I_SCHOOL_REPOSITORY, ISchoolRepository } from './ports/school.repository.interface';
import { SchoolDomain } from './entities/school.entity'

@Injectable()
export class SchoolsService {
  private readonly CACHE_LIST = (superAdminId: string) => `schools:list:user:${superAdminId}`;
  private readonly CACHE_DETAIL = (schoolId: string) => `schools:detail:schoolId:${schoolId}`;
  private readonly CACHE_PATTERN_ALL = (superAdminId: string) => `*:user:${superAdminId}*`;

  constructor(
    @Inject(I_SCHOOL_REPOSITORY)
    private readonly iSchoolRepo: ISchoolRepository,

    @Inject(I_CACHE_REPOSITORY)
    private readonly cacheRepo: ICacheRepository, // 👈 Port disuntikkan
  ) {}
  async createSchool(createSchoolDto: CreateSchoolDto, superAdminId: string): Promise<SchoolDomain> {
    const newSchoolEntity = SchoolDomain.createNewSchool(createSchoolDto.name);

    const savedSchool = await this.iSchoolRepo.createSchool(newSchoolEntity);

    if (savedSchool) {
      await this.cacheRepo.invalidateAndNotify(
        this.CACHE_PATTERN_ALL(superAdminId), // Hapus semua cache terkait user ini di modul assessment
        'schools',                            // Nama Entity yang dibawa ke Frontend
        superAdminId                          // ID User untuk mencari Room Websocket
    );
    }

    return savedSchool;
  }

  async findAllSchool(superAdminId: string) {
    return await this.cacheRepo.getOrSet(
      this.CACHE_LIST(superAdminId),
      async () => {
        return await this.iSchoolRepo.findAllSchool();
      },
      CacheTTL.DEFAULT // TTL 1 menit
    );
  }

  async findSchoolDetailBySchoolId(schoolId: string)  {
    try {
      const getSchool = await this.iSchoolRepo.findDetailSchoolBySchoolId(schoolId);

      if (getSchool) {
        return await this.cacheRepo.getOrSet(
          this.CACHE_DETAIL(schoolId),
          async () => {
            return await this.iSchoolRepo.findDetailSchoolBySchoolId(schoolId);
          },
          CacheTTL.DEFAULT // TTL 1 menit
        );
      } else {
        throw new NotFoundException('Schoold ID Not Found')
      }
    } catch (error) {
      
    }
  }
}
