

## Cache

### Backend
```TS
@Injectable()
export class ClassService {
  // 🔥 Konsep Cache: Daftar  INI adalah milik yang id me-request.
  private readonly CACHE_LIST = (schoolId: string) => `classes:list:school:${schoolId}`;
  private readonly CACHE_PATTERN_ALL = (schoolId: string) => `*:school:${schoolId}*`;

  // Injeksi Port, bukan Prisma
  constructor(
    private readonly classRepository: IClassRepository,

    @Inject(I_CACHE_REPOSITORY)
    private readonly cacheRepo: ICacheRepository, // 👈 Port disuntikkan
  ) {}

  async createClass(dto: CreateClassDto): Promise<ClassDomain> {
    // Logika bisnis bisa diletakkan di sini.
    // Contoh: Memastikan kombinasi level, nama, dan sekolah tidak ganda
    // (Bisa mengandalkan Exception handling dari Prisma, atau melakukan pencarian spesifik terlebih dahulu).


    await this.cacheRepo.invalidateAndNotify(
        this.CACHE_PATTERN_ALL(dto.school_id), // Hapus semua cache terkait user ini di modul assessment
        'classes',                  // Nama Entity yang dibawa ke Frontend
        dto.school_id                          // ID User untuk mencari Room Websocket
    );

    return this.classRepository.create(dto);
  }

  async getClassesBySchool(schoolId: string): Promise<ClassDomain[]> {

    return this.cacheRepo.getOrSet(
      this.CACHE_LIST(schoolId),
      async () => {
        // Ingat! Di dalam findById ini, Prisma WAJIB menggunakan "include: { classes: true }"
        // agar Domain memiliki array of classId
        return await this.classRepository.findAllBySchool(schoolId);
      },
      CacheTTL.LONG_LIVED // TTL 1 menit
    );
  }
}
```

### Frontend